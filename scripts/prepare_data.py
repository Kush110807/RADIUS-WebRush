#!/usr/bin/env python3
"""Create the compact, privacy-preserving Anonymous 37 dataset used by RADIUS.

Usage:
  python scripts/prepare_data.py /path/to/archive.zip public/data/anonymous37.json

This is an offline build-time transformation. The web app never reads the source archive.
"""
from __future__ import annotations
import json, math, sys, zipfile
from collections import Counter
from pathlib import Path
import numpy as np
import pandas as pd

UID = "c37f9221f44e9ca35a49180dc05a7587"
DISPLAY_ID = "Anonymous 37"
SENSING_COLS = [
    "uid","day","sleep_duration","loc_home_dur","loc_social_dur","loc_study_dur",
    "loc_dist_ep_0","loc_visit_num_ep_0","unlock_num_ep_0","unlock_duration_ep_0",
    "audio_convo_duration_ep_0","audio_convo_num_ep_0","act_on_foot_ep_0",
    "call_in_num_ep_0","call_out_num_ep_0","sms_in_num_ep_0","sms_out_num_ep_0",
]

def chapter_for(d: pd.Timestamp) -> str:
    if d <= pd.Timestamp("2020-02-29"): return "before"
    if d <= pd.Timestamp("2020-05-31"): return "collapse"
    if d <= pd.Timestamp("2021-05-31"): return "adaptation"
    return "reopening"

def n(v, digits=2):
    if pd.isna(v): return None
    return round(float(v), digits)

def percentile_bounds(series: pd.Series, lo=.05, hi=.95):
    x = pd.to_numeric(series, errors="coerce").dropna()
    return [float(x.quantile(lo)), float(x.quantile(hi))]

def normalise(v, bounds):
    if v is None or bounds[1] <= bounds[0]: return None
    return float(np.clip((v-bounds[0])/(bounds[1]-bounds[0]), 0, 1))

def radius_score(row, bounds):
    vals = {
      "distanceKm": row.get("distanceKm"),
      "placesVisited": row.get("placesVisited"),
      "movementMinutes": row.get("movementMinutes"),
      "timeAwayHours": row.get("timeAwayHours"),
    }
    weights = {"distanceKm":.35,"placesVisited":.25,"movementMinutes":.20,"timeAwayHours":.20}
    pieces=[]
    for k,w in weights.items():
        z=normalise(vals[k], bounds[k])
        if z is not None: pieces.append((z,w))
    if not pieces: return None
    # Reweight if one input is missing rather than treating missing as zero.
    return round(sum(z*w for z,w in pieces)/sum(w for _,w in pieces)*100, 1)

def med(series):
    x=pd.to_numeric(series,errors='coerce').dropna()
    return None if x.empty else round(float(x.median()),2)

def main(src: Path, out: Path):
    with zipfile.ZipFile(src) as z:
        sensing=pd.read_csv(z.open("Sensing/sensing.csv"), usecols=SENSING_COLS)
        sensing=sensing[sensing.uid==UID].copy()
        sensing["date"]=pd.to_datetime(sensing.day.astype(str))
        sensing=sensing.sort_values("date")

        general=pd.read_csv(z.open("EMA/general_ema.csv"))
        general=general[general.uid==UID].copy(); general["date"]=pd.to_datetime(general.day.astype(str))
        general_stress_responses=int(general.stress.notna().sum())
        general_social_responses=int(general.social_level.notna().sum())
        general=general.groupby("date",as_index=False).agg({"stress":"median","social_level":"median","pam":"median"})

        covid=pd.read_csv(z.open("EMA/covid_ema.csv"))
        covid=covid[covid.uid==UID].copy(); covid["date"]=pd.to_datetime(covid.day.astype(str))
        covid_cols=[f"COVID-{i}" for i in range(1,11)]
        covid_specific_responses=int(len(covid))
        covid_usable_rows=int(covid[covid_cols].notna().any(axis=1).sum())
        covid=covid.groupby("date",as_index=False)[covid_cols].median(numeric_only=True)

        apps=pd.read_csv(z.open(f"Raw Sensing/running_apps/{UID}.csv"))
        apps["date"]=pd.to_datetime(apps.day).dt.normalize()
        app_counts=apps.groupby("date").size().to_dict()
        app_unique=apps.groupby("date")["data"].nunique().to_dict()

        # Counts are verification metadata only; raw identifiers/messages are never exported.
        call_count=0
        for ch in pd.read_csv(z.open("Raw Sensing/call_log/calllog.csv"), usecols=["uid"], chunksize=200000):
            call_count += int((ch.uid==UID).sum())
        sms_count=0
        for ch in pd.read_csv(z.open("Raw Sensing/sms_log/smslog.csv"), usecols=["uid"], chunksize=200000):
            sms_count += int((ch.uid==UID).sum())
        unlock_count=len(pd.read_csv(z.open(f"Raw Sensing/unlock/{UID}.csv"), usecols=["date"]))

    merged=sensing.merge(general,on="date",how="left").merge(covid,on="date",how="left")
    raw=[]
    for _,r in merged.iterrows():
        d=r.date
        home=n(r.loc_home_dur)
        away=None if home is None else round(max(0,min(24,24-home)),2)
        rec={
          "date":d.strftime("%Y-%m-%d"), "chapter":chapter_for(d),
          "homeHours":home, "studyHours":n(r.loc_study_dur), "distanceKm":n(r.loc_dist_ep_0/1000 if pd.notna(r.loc_dist_ep_0) else np.nan),
          "placesVisited":None if pd.isna(r.loc_visit_num_ep_0) else int(r.loc_visit_num_ep_0),
          "movementMinutes":n(r.act_on_foot_ep_0/60 if pd.notna(r.act_on_foot_ep_0) else np.nan),
          "timeAwayHours":away, "sleepHours":n(r.sleep_duration),
          "unlocks":None if pd.isna(r.unlock_num_ep_0) else int(r.unlock_num_ep_0),
          "incomingCalls":None if pd.isna(r.call_in_num_ep_0) else int(r.call_in_num_ep_0),
          "outgoingCalls":None if pd.isna(r.call_out_num_ep_0) else int(r.call_out_num_ep_0),
          "incomingMessages":None if pd.isna(r.sms_in_num_ep_0) else int(r.sms_in_num_ep_0),
          "outgoingMessages":None if pd.isna(r.sms_out_num_ep_0) else int(r.sms_out_num_ep_0),
          "conversationMinutes":n(r.audio_convo_duration_ep_0/60 if pd.notna(r.audio_convo_duration_ep_0) else np.nan),
          "conversationCount":None if pd.isna(r.audio_convo_num_ep_0) else int(r.audio_convo_num_ep_0),
          "stress":n(r.stress,1), "socialLevel":n(r.social_level,1), "affect":n(r.pam,1),
          "backgroundAppsObserved":int(app_counts[d]) if d in app_counts else None, "uniqueBackgroundApps":int(app_unique[d]) if d in app_unique else None,
          "covidResponses":[n(r[c],1) for c in covid_cols] if any(pd.notna(r[c]) for c in covid_cols) else None,
        }
        raw.append(rec)

    df=pd.DataFrame(raw)
    bounds={k:percentile_bounds(df[k]) for k in ["distanceKm","placesVisited","movementMinutes","timeAwayHours"]}
    for rec in raw: rec["radiusScore"]=radius_score(rec,bounds)
    df=pd.DataFrame(raw)

    chapter_defs={
      "before":("2018-09-25","2020-02-29"), "collapse":("2020-03-01","2020-05-31"),
      "adaptation":("2020-06-01","2021-05-31"), "reopening":("2021-06-01","2022-06-15")
    }
    # Chapter medians use the highest-precision source values rather than the
    # rounded display records. This avoids rounding a daily value before taking
    # the median (e.g. 4.725 km should reflect the underlying source, not a
    # banker's-rounding artefact from a 2-decimal intermediate).
    precise=pd.DataFrame({
      "date":merged.date.dt.strftime("%Y-%m-%d"),
      "homeHours":pd.to_numeric(merged.loc_home_dur,errors="coerce"),
      "distanceKm":pd.to_numeric(merged.loc_dist_ep_0,errors="coerce")/1000,
      "placesVisited":pd.to_numeric(merged.loc_visit_num_ep_0,errors="coerce"),
      "movementMinutes":pd.to_numeric(merged.act_on_foot_ep_0,errors="coerce")/60,
      "sleepHours":pd.to_numeric(merged.sleep_duration,errors="coerce"),
      "unlocks":pd.to_numeric(merged.unlock_num_ep_0,errors="coerce"),
      "stress":pd.to_numeric(merged.stress,errors="coerce"),
      "socialLevel":pd.to_numeric(merged.social_level,errors="coerce"),
      "incomingCalls":pd.to_numeric(merged.call_in_num_ep_0,errors="coerce"),
      "outgoingCalls":pd.to_numeric(merged.call_out_num_ep_0,errors="coerce"),
      "incomingMessages":pd.to_numeric(merged.sms_in_num_ep_0,errors="coerce"),
      "outgoingMessages":pd.to_numeric(merged.sms_out_num_ep_0,errors="coerce"),
      "studyHours":pd.to_numeric(merged.loc_study_dur,errors="coerce"),
      "conversationMinutes":pd.to_numeric(merged.audio_convo_duration_ep_0,errors="coerce")/60,
      "conversationCount":pd.to_numeric(merged.audio_convo_num_ep_0,errors="coerce"),
      "affect":pd.to_numeric(merged.pam,errors="coerce"),
    })
    precise["backgroundAppsObserved"]=[app_counts.get(d, np.nan) for d in merged.date]
    precise["radiusScore"]=df["radiusScore"]
    metrics=["homeHours","distanceKm","placesVisited","movementMinutes","sleepHours","unlocks","stress","socialLevel","affect","backgroundAppsObserved","incomingCalls","outgoingCalls","incomingMessages","outgoingMessages","conversationMinutes","conversationCount","studyHours","radiusScore"]
    chapter_medians={}
    for ch,(a,b) in chapter_defs.items():
        sub=precise[(precise.date>=a)&(precise.date<=b)]
        chapter_medians[ch]={m:med(sub[m]) for m in metrics}
        chapter_medians[ch]["days"]=int(len(sub))

    baseline=chapter_medians["before"]
    # The reference ring is the median of the daily pre-lockdown radius scores,
    # rather than the score recomputed from independent component medians.
    baseline_score=baseline["radiusScore"]

    payload={
      "participant":DISPLAY_ID,
      "range":{"start":df.date.min(),"end":df.date.max(),"days":len(raw)},
      "verification":{
        "generalStressResponses":general_stress_responses,
        "generalSocialResponses":general_social_responses,
        "covidSpecificResponses":covid_specific_responses,
        "usableCovidResponses":covid_usable_rows,
        "deployedStressDays":int(df.stress.notna().sum()),
        "deployedSocialDays":int(df.socialLevel.notna().sum()),
        "deployedAffectDays":int(df.affect.notna().sum()),
        "deployedCovidDays":int(df.covidResponses.notna().sum()),
        "locationCoverageDays":int(sensing[["loc_home_dur","loc_social_dur","loc_study_dur","loc_dist_ep_0","loc_visit_num_ep_0"]].notna().any(axis=1).sum()),
        "rawCallRecords":call_count,
        "rawSmsRecords":sms_count,
        "backgroundApplicationObservations":len(apps),
        "deployedBackgroundApplicationObservations":int(df.backgroundAppsObserved.fillna(0).sum()),
        "rawUnlockEvents":unlock_count
      },
      "normalisation":{"method":"5th–95th percentile clipping across available daily records","bounds":{k:[round(a,2),round(b,2)] for k,(a,b) in bounds.items()},"baselineRadiusScore":baseline_score},
      "chapterMedians":chapter_medians,
      "records":raw
    }
    out.parent.mkdir(parents=True,exist_ok=True)
    out.write_text(json.dumps(payload,separators=(",",":")),encoding="utf-8")
    print(f"Wrote {out} ({out.stat().st_size/1024:.1f} KiB), {len(raw)} days")
    print(json.dumps(chapter_medians,indent=2))

if __name__=="__main__":
    if len(sys.argv)!=3: raise SystemExit("usage: prepare_data.py SOURCE.zip OUTPUT.json")
    main(Path(sys.argv[1]),Path(sys.argv[2]))

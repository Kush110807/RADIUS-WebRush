import type { DataPayload } from '../../types/receipts'

export default function Methodology({ data, onBack }: { data: DataPayload; onBack: () => void }) {
  const verification = data.verification

  return (
    <>
      <a className="skip-link" href="#main-content">Skip to methodology</a>
      <main className="methodology-view" id="main-content">
        <div className="methodology-wrap">
          <button className="text-button" type="button" onClick={onBack}>← Back to story</button>
          <p className="eyebrow">Methodology &amp; limits</p>
          <h1>What the radius means — and what it does not.</h1>

          <section>
            <h2>A visual storytelling device</h2>
            <p>
              The living radius is not a scientific, medical, or clinical score. It combines four recorded mobility signals to make change legible: distance travelled (35%), places visited (25%), detected movement on foot (20%), and time away from home (20%).
            </p>
            <p>
              Each input is clipped to its 5th–95th percentile range across this participant’s available daily records, then normalised from 0 to 1. If one input is missing, its weight is redistributed across the available inputs rather than treating missing data as zero.
            </p>
          </section>

          <section>
            <h2>The thread fingerprint</h2>
            <p>
              The thin spokes inside the radius are a comparison aid, not another score. For the selected evidence thread, each available daily metric is compared with its median in the Before chapter. The small crossbar marks that Before reference; the current dot moves inward or outward relative to it. Missing values are omitted rather than drawn at zero.
            </p>
          </section>

          <section>
            <h2>What was prepared</h2>
            <p>
              The source archive is transformed offline into a compact static JSON file containing {data.range.days.toLocaleString()} daily sensing records for <strong>{data.participant}</strong>. The deployed app is frontend-only: no backend, database, authentication, or server-side processing is used.
            </p>
            <p>
              The raw EMA table contains {verification.generalStressResponses} non-missing stress responses; {verification.deployedStressDays} align to the deployed sensing-day archive. RADIUS keeps that distinction rather than manufacturing a value for a day that is not present in the daily sensing series.
            </p>
            <div className="method-stats">
              <span><b>{verification.locationCoverageDays.toLocaleString()}</b> days with location coverage</span>
              <span><b>{verification.deployedStressDays}</b> deployed self-reported stress days</span>
              <span><b>{verification.deployedCovidDays}</b> usable COVID-response days</span>
              <span><b>{verification.deployedBackgroundApplicationObservations.toLocaleString()}</b> app observations aligned to sensing days</span>
              <span><b>{verification.rawCallRecords.toLocaleString()}</b> raw call records verified</span>
              <span><b>{verification.rawSmsRecords.toLocaleString()}</b> raw SMS records verified</span>
            </div>
          </section>

          <section>
            <h2>Interpretation boundaries</h2>
            <ul>
              <li>“Model-estimated sleep” is not measured or clinically assessed sleep.</li>
              <li>“Self-reported stress” is a survey response, not a diagnosis.</li>
              <li>Background application records are observations, not foreground usage or time spent.</li>
              <li>Detected conversation is a device-sensor classification; no audio content is exposed and it should not be interpreted as relationship quality.</li>
              <li>Changes are described as associated with a period; the records do not establish causal effects of lockdown.</li>
              <li>Coordinates, hashed contact identifiers, message contents, and unnecessary demographics are not included in the deployed dataset.</li>
            </ul>
          </section>

          <section>
            <h2>Source</h2>
            <p>
              College Experience Study dataset by Subigya Nepal and collaborators; dataset licence CC BY-NC-SA 4.0. View the <a href="https://www.kaggle.com/datasets/subigyanepal/college-experience-dataset" target="_blank" rel="noreferrer">dataset source on Kaggle</a> or the <a href="https://doi.org/10.1145/3643501" target="_blank" rel="noreferrer">published study (DOI 10.1145/3643501)</a>.
            </p>
          </section>
        </div>
      </main>
    </>
  )
}

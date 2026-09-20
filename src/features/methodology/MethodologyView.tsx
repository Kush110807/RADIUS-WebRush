import type { DataPayload } from '../../types/receipts'
import Methodology from './Methodology'

export default function MethodologyView({ data, onBack }: { data: DataPayload; onBack: () => void }) {
  return <Methodology data={data} onBack={onBack} />
}

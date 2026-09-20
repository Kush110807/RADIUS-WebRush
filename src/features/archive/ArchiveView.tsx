import type { DataPayload } from '../../types/receipts'
import ArchiveExplorer from './ArchiveExplorer'

export default function ArchiveView({ data, onBack }: { data: DataPayload; onBack: () => void }) {
  return <ArchiveExplorer data={data} onBack={onBack} />
}

import { useNavigate } from 'react-router-dom'
import { InWorldOverlay } from './InWorldOverlay'
import { useStore } from '../state/store'

export function InWorldArchives({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { cases } = useStore()
  const navigate = useNavigate()
  const sorted = [...cases].sort((a, b) => b.createdAt - a.createdAt)

  return (
    <InWorldOverlay open={open} title="THE ARCHIVES" badge="PERMANENTLY FILED GRIEVANCES" onClose={onClose}>
      <div className="grid gap-2 max-h-[60vh] overflow-auto">
        {sorted.length === 0 && (
          <p className="text-base opacity-80 p-2">The Archives are currently empty. File something tremendously trivial.</p>
        )}
        {sorted.map((c) => (
          <button
            key={c.id}
            type="button"
            className="tile text-left"
            onClick={() => {
              onClose()
              navigate(`/case/${c.id}`)
            }}
          >
            <span className="font-pixel text-[9px] leading-relaxed">{c.title}</span>
            <span className="text-base opacity-90">{new Date(c.createdAt).toLocaleDateString('en-GB')}</span>
          </button>
        ))}
      </div>
      <div className="flex justify-end">
        <button type="button" className="btn btn-sm btn-secondary" onClick={() => { onClose(); navigate('/archives') }}>
          FULL ARCHIVES PAGE
        </button>
      </div>
    </InWorldOverlay>
  )
}

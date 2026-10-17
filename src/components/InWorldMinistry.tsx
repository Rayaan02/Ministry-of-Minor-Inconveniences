import { useNavigate } from 'react-router-dom'
import { FilePlus2 } from 'lucide-react'
import { InWorldOverlay } from './InWorldOverlay'

export function InWorldMinistry({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate()
  return (
    <InWorldOverlay open={open} title="MINISTRY OF MINOR INCONVENIENCES" badge="FORM 44-B COUNTER" onClose={onClose}>
      <article className="panel p-3">
        <p className="font-pixel text-[9px]">HOW SERIOUS IS IT?</p>
        <p className="text-base mt-1">
          File your grievance here. The clerk will assign it an unreasonably high priority.
        </p>
      </article>
      <button
        type="button"
        className="tile items-center"
        onClick={() => {
          onClose()
          navigate('/file')
        }}
      >
        <span className="font-pixel text-[9px] flex items-center gap-2">
          <FilePlus2 size={13} aria-hidden="true" /> FILE A COMPLAINT
        </span>
        <span className="text-base opacity-90">Three copies minimum. Four if you’re upset.</span>
      </button>
    </InWorldOverlay>
  )
}

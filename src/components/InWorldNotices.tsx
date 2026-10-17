import { InWorldOverlay } from './InWorldOverlay'
import { ANNOUNCEMENTS } from '../data/notices'

export function InWorldNotices({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <InWorldOverlay open={open} title="NOTICE BOARD" badge="OFFICIAL ANNOUNCEMENTS" onClose={onClose}>
      <div className="grid gap-2">
        {ANNOUNCEMENTS.map((n) => (
          <article key={n.id} className="tile flex-col items-start gap-1">
            <p className="font-pixel text-[9px]">{n.title}</p>
            <p className="text-base mt-1 opacity-80">{n.posted}</p>
            <p className="text-base mt-1">{n.body}</p>
          </article>
        ))}
      </div>
    </InWorldOverlay>
  )
}

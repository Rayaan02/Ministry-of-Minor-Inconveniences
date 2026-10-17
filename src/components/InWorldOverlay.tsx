import { X } from 'lucide-react'

interface InWorldOverlayProps {
  open: boolean
  title: string
  badge?: string
  onClose: () => void
  children: React.ReactNode
}

export function InWorldOverlay({ open, title, badge, onClose, children }: InWorldOverlayProps) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[85] flex items-end sm:items-center justify-center bg-navy/70 p-2 sm:p-4">
      <div className="panel w-full max-w-2xl max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between gap-3 p-3 border-b-4 border-navy/30">
          <div>
            {badge && (
              <p className="badge" style={{ background: 'var(--lavender)' }}>
                {badge}
              </p>
            )}
            <p className="font-pixel text-[11px] mt-2 leading-relaxed">{title}</p>
          </div>
          <button type="button" className="btn btn-sm" onClick={onClose} aria-label="Close overlay">
            <X size={14} aria-hidden="true" /> CLOSE
          </button>
        </div>
        <div className="p-3 sm:p-4 grid gap-3">{children}</div>
      </div>
    </div>
  )
}

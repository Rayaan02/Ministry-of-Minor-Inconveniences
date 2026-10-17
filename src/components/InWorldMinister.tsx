import { InWorldOverlay } from './InWorldOverlay'
import { SirPigeon } from './Sprites'

export function InWorldMinister({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <InWorldOverlay open={open} title="MEET THE MINISTER" badge="MINISTERIAL OFFICE" onClose={onClose}>
      <article className="grid gap-3">
        <div className="flex items-center justify-center">
          <SirPigeon className="w-28 sm:w-32" />
        </div>
        <div className="panel p-3">
          <p className="font-pixel text-[9px]">SIR PIGEON III</p>
          <p className="text-base mt-1">
            Supreme Overlord of Minor Inconveniences. Has held office for three consecutive crumbs.
          </p>
        </div>
        <div className="panel p-3">
          <p className="text-base">
            “Every inconvenience, no matter how trivial, is a matter of utmost importance until I get bored of it.”
          </p>
        </div>
      </article>
    </InWorldOverlay>
  )
}

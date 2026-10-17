import type { ReactElement, ReactNode } from 'react'
import type { SpriteKey } from '../types'
import { PixelArt } from './PixelArt'

/* ============================================================
   SHARED PALETTE
   ============================================================ */
export const C = {
  sky: '#75C9E8',
  skyDeep: '#4BA8CC',
  cream: '#FFF0C9',
  creamDeep: '#F3DDA4',
  paper: '#FFF8E6',
  grass: '#79B86A',
  grassDeep: '#5C9A52',
  forest: '#356B53',
  coral: '#E97862',
  coralDeep: '#C95643',
  gold: '#F5C86A',
  goldDeep: '#D9A63F',
  lavender: '#A994D4',
  navy: '#29364F',
  navyDark: '#1A2337',
  wood: '#956746',
  woodDeep: '#6F4B30',
  white: '#FFFFFF',
  pigeon: '#DCE0E8',
  pigeonMid: '#A9B0C2',
  glass: '#BFE7F5'
}

/* ============================================================
   SIR PIGEON III — original 16x17 pixel sprite
   (tiny formal suit, red tie, small government hat, serious face)
   ============================================================ */
const PIGEON_PALETTE: Record<string, string> = {
  n: C.navyDark,
  b: C.navy,
  l: '#3D4E6F',
  d: C.pigeon,
  e: C.pigeonMid,
  y: C.gold,
  r: C.coral,
  w: C.cream
}

const PIGEON_GRID = [
  '.....nnnnnn.....',
  '.....nlllln.....',
  '.....nrrrrn.....',
  '..nbbbbbbbbbbn..',
  '....nddddddn....',
  '...nddddddddn...',
  '...nddnddnddn...',
  '...nddddddddn...',
  '...ndddyydddn...',
  '..nedddddddden..',
  '..nbbbbbbbbbbn..',
  '..nbbbbrrbbbbn..',
  '..nbbbbrrbbbbn..',
  '..nbrrrrrrrrbn..',
  '..nbbbbbbbbbbn..',
  '..nneddddddenn..',
  '...yy......yy...'
]

export function SirPigeon({ className, label = 'Sir Pigeon III' }: { className?: string; label?: string }) {
  return <PixelArt grid={PIGEON_GRID} palette={PIGEON_PALETTE} className={className} label={label} />
}

/** Small walking pigeon used for the roaming easter egg. */
export function TinyPigeon({ className }: { className?: string }) {
  const grid = [
    '..nnnn..',
    '.ndddn..',
    'nddddnnn',
    'nddyyydd',
    '.ndddddd',
    '..n..n..'
  ]
  const palette: Record<string, string> = { n: C.navyDark, d: C.pigeon, y: C.gold }
  return <PixelArt grid={grid} palette={palette} className={className} />
}

/* ============================================================
   SUSPECT AVATARS — 16x16 character cards
   ============================================================ */
function Frame({ children, fill }: { children?: ReactNode; fill: string }) {
  return (
    <>
      <rect x={0} y={0} width={16} height={16} fill={C.navyDark} />
      <rect x={1} y={1} width={14} height={14} fill={fill} />
      <rect x={1} y={1} width={14} height={2} fill={C.white} opacity={0.25} />
      {children}
    </>
  )
}

const AVATAR_COLOURS: Record<SpriteKey, string> = {
  clock: C.creamDeep,
  machine: C.lavender,
  creature: C.grass,
  person: C.gold,
  shadow: '#3B4A66',
  bird: C.sky,
  object: C.wood
}

export function SuspectAvatar({ sprite, className }: { sprite: SpriteKey; className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={`pixelated block ${className ?? ''}`}
      shapeRendering="crispEdges"
      aria-hidden="true"
      focusable="false"
    >
      <Frame fill={AVATAR_COLOURS[sprite] ?? C.grass}>
        {sprite === 'clock' && (
          <>
            <rect x={2} y={0} width={2} height={2} fill={C.navyDark} />
            <rect x={12} y={0} width={2} height={2} fill={C.navyDark} />
            <rect x={3} y={4} width={10} height={10} fill={C.paper} />
            <rect x={3} y={4} width={10} height={1} fill={C.navyDark} />
            <rect x={3} y={13} width={10} height={1} fill={C.navyDark} />
            <rect x={3} y={4} width={1} height={10} fill={C.navyDark} />
            <rect x={12} y={4} width={1} height={10} fill={C.navyDark} />
            <rect x={7} y={6} width={1} height={4} fill={C.navyDark} />
            <rect x={7} y={9} width={4} height={1} fill={C.coral} />
          </>
        )}
        {sprite === 'machine' && (
          <>
            <rect x={3} y={3} width={10} height={6} fill={C.glass} />
            <rect x={3} y={3} width={10} height={1} fill={C.navyDark} />
            <rect x={4} y={4} width={4} height={3} fill={C.forest} />
            <rect x={4} y={10} width={2} height={2} fill={C.coral} />
            <rect x={7} y={10} width={2} height={2} fill={C.gold} />
            <rect x={10} y={10} width={2} height={2} fill={C.paper} />
            <rect x={3} y={9} width={10} height={1} fill={C.navyDark} />
          </>
        )}
        {sprite === 'creature' && (
          <>
            <rect x={3} y={2} width={2} height={3} fill={C.coral} />
            <rect x={11} y={2} width={2} height={3} fill={C.coral} />
            <rect x={4} y={6} width={3} height={3} fill={C.paper} />
            <rect x={9} y={6} width={3} height={3} fill={C.paper} />
            <rect x={5} y={7} width={1} height={1} fill={C.navyDark} />
            <rect x={10} y={7} width={1} height={1} fill={C.navyDark} />
            <rect x={6} y={11} width={4} height={1} fill={C.navyDark} />
          </>
        )}
        {sprite === 'person' && (
          <>
            <rect x={6} y={3} width={4} height={4} fill={C.cream} />
            <rect x={7} y={5} width={1} height={1} fill={C.navyDark} />
            <rect x={9} y={5} width={1} height={1} fill={C.navyDark} />
            <rect x={4} y={8} width={8} height={6} fill={C.navy} />
            <rect x={7} y={8} width={2} height={4} fill={C.coral} />
          </>
        )}
        {sprite === 'shadow' && (
          <>
            <rect x={4} y={4} width={8} height={9} fill={C.navyDark} />
            <rect x={5} y={6} width={2} height={2} fill={C.lavender} />
            <rect x={9} y={6} width={2} height={2} fill={C.lavender} />
            <rect x={6} y={10} width={4} height={1} fill={C.lavender} />
          </>
        )}
        {sprite === 'bird' && (
          <>
            <rect x={3} y={5} width={8} height={6} fill={C.pigeon} />
            <rect x={10} y={6} width={3} height={2} fill={C.gold} />
            <rect x={4} y={7} width={2} height={2} fill={C.navyDark} />
            <rect x={3} y={9} width={7} height={2} fill={C.pigeonMid} />
            <rect x={5} y={12} width={2} height={2} fill={C.coral} />
            <rect x={9} y={12} width={2} height={2} fill={C.coral} />
          </>
        )}
        {sprite === 'object' && (
          <>
            <rect x={3} y={4} width={10} height={9} fill={C.paper} />
            <rect x={3} y={4} width={10} height={1} fill={C.navyDark} />
            <rect x={4} y={6} width={8} height={1} fill={C.navyDark} />
            <rect x={4} y={9} width={6} height={1} fill={C.navyDark} />
            <rect x={4} y={11} width={8} height={1} fill={C.navyDark} />
          </>
        )}
      </Frame>
    </svg>
  )
}

/* ============================================================
   ENVIRONMENT SCRAPS — original pixel art scenery
   ============================================================ */
export function PixelCloud({ className }: { className?: string }) {
  const grid = [
    '...wwwww....',
    '..wwwwwww...',
    '.wwwwwwwwww.',
    'wwwwwwwwwwww',
    '.wwwwwwwwww.'
  ]
  const palette: Record<string, string> = { w: C.white }
  return <PixelArt grid={grid} palette={palette} className={className} />
}

export function PixelTree({ className }: { className?: string }) {
  const grid = [
    '....gggg....',
    '...gggggg...',
    '..gggggggg..',
    '.gggggggggg.',
    'gggggggggggg',
    '.gggggggggg.',
    '..gggggggg..',
    '...gggggg...',
    '....gggg....',
    '.....ww.....',
    '.....ww.....',
    '....wwww....'
  ]
  const palette: Record<string, string> = { g: C.forest, w: C.wood }
  return <PixelArt grid={grid} palette={palette} className={className} />
}

export function PixelBush({ className }: { className?: string }) {
  const grid = ['..gggg..', '.gggggg.', 'gggggggg', 'gggggggg', '.gggggg.']
  const palette: Record<string, string> = { g: C.grassDeep }
  return <PixelArt grid={grid} palette={palette} className={className} />
}

export function PixelFlower({ className, colour = C.coral }: { className?: string; colour?: string }) {
  const grid = ['.f.', 'fff', '.f.', '.g.', '.g.']
  const palette: Record<string, string> = { f: colour, g: C.forest }
  return <PixelArt grid={grid} palette={palette} className={className} />
}

/** Chunky pixel arrow used as a “click me” cursor above doors. */
export function PixelArrow({ className }: { className?: string }) {
  const grid = ['..y..', 'yyyyy', '.yyy.', '..y..']
  const palette: Record<string, string> = { y: C.gold }
  return <PixelArt grid={grid} palette={palette} className={className} />
}

/* ============================================================
   BUILDINGS — composed from pixel-aligned rects
   ============================================================ */
const svgProps = {
  shapeRendering: 'crispEdges' as const,
  'aria-hidden': true as const,
  focusable: 'false' as const
}

function SteppedRoof({ fill, peakX = 20, maxHalf = 18, top = 1, step = 3 }: {
  fill: string
  peakX?: number
  maxHalf?: number
  top?: number
  step?: number
}) {
  const layers: ReactElement[] = []
  let half = 3
  let y = top
  while (half <= maxHalf) {
    layers.push(<rect key={`r-${y}`} x={peakX - half} y={y} width={half * 2} height={step} fill={fill} />)
    half += 3
    y += step
  }
  return <g>{layers}</g>
}

export function MinistryBuilding({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 34" className={`pixelated block ${className ?? ''}`} {...svgProps}>
      {/* outline silhouette */}
      <SteppedRoof fill={C.navyDark} top={1} />
      <rect x={2} y={13} width={36} height={20} fill={C.navyDark} />
      <rect x={0} y={31} width={40} height={3} fill={C.navyDark} />
      {/* roof */}
      <SteppedRoof fill={C.coral} top={2} peakX={20} maxHalf={16} />
      <SteppedRoof fill={C.coralDeep} top={11} peakX={20} maxHalf={16} step={1} />
      {/* walls */}
      <rect x={4} y={15} width={32} height={16} fill={C.cream} />
      <rect x={4} y={15} width={32} height={1} fill={C.creamDeep} />
      {/* columns */}
      {[6, 11, 16].map((x) => (
        <g key={x}>
          <rect x={x} y={17} width={3} height={12} fill={C.paper} />
          <rect x={x - 1} y={16} width={5} height={2} fill={C.gold} />
          <rect x={x - 1} y={28} width={5} height={2} fill={C.gold} />
        </g>
      ))}
      {/* clock tower face */}
      <rect x={20} y={16} width={8} height={8} fill={C.navyDark} />
      <rect x={21} y={17} width={6} height={6} fill={C.paper} />
      <rect x={23} y={18} width={1} height={3} fill={C.navy} />
      <rect x={23} y={20} width={3} height={1} fill={C.coral} />
      {/* windows */}
      <rect x={30} y={18} width={4} height={4} fill={C.glass} />
      <rect x={30} y={18} width={4} height={1} fill={C.navyDark} />
      <rect x={30} y={23} width={4} height={4} fill={C.glass} />
      <rect x={30} y={23} width={4} height={1} fill={C.navyDark} />
      {/* door */}
      <rect x={19} y={25} width={10} height={7} fill={C.navyDark} />
      <rect x={20} y={26} width={8} height={6} fill={C.wood} />
      <rect x={24} y={26} width={1} height={6} fill={C.woodDeep} />
      <rect x={26} y={28} width={1} height={1} fill={C.gold} />
      {/* steps */}
      <rect x={0} y={30} width={40} height={2} fill={C.creamDeep} />
      <rect x={0} y={30} width={40} height={1} fill={C.navyDark} />
      {/* flag */}
      <rect x={12} y={2} width={1} height={12} fill={C.woodDeep} />
      <rect x={13} y={3} width={7} height={5} fill={C.coral} />
      <rect x={13} y={3} width={7} height={1} fill={C.navyDark} />
      <rect x={13} y={7} width={7} height={1} fill={C.navyDark} />
      <rect x={15} y={4} width={3} height={2} fill={C.gold} />
    </svg>
  )
}

export function ArchivesBuilding({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 34" className={`pixelated block ${className ?? ''}`} {...svgProps}>
      <rect x={3} y={6} width={34} height={27} fill={C.navyDark} />
      <rect x={5} y={8} width={30} height={23} fill={C.cream} />
      {/* roof */}
      <rect x={1} y={6} width={38} height={4} fill={C.navyDark} />
      <rect x={2} y={7} width={36} height={2} fill={C.lavender} />
      <rect x={6} y={2} width={28} height={4} fill={C.navyDark} />
      <rect x={7} y={3} width={26} height={2} fill={C.lavender} />
      {/* pillars */}
      {[7, 13, 21, 27].map((x) => (
        <g key={x}>
          <rect x={x} y={12} width={3} height={17} fill={C.paper} />
          <rect x={x - 1} y={11} width={5} height={2} fill={C.lavender} />
        </g>
      ))}
      {/* file stacks visible through the door */}
      <rect x={17} y={18} width={6} height={11} fill={C.navyDark} />
      <rect x={18} y={19} width={4} height={10} fill={C.woodDeep} />
      <rect x={19} y={21} width={2} height={1} fill={C.gold} />
      <rect x={19} y={24} width={2} height={1} fill={C.gold} />
      {/* windows with boxes */}
      <rect x={30} y={14} width={4} height={5} fill={C.glass} />
      <rect x={30} y={15} width={4} height={1} fill={C.gold} />
      <rect x={30} y={21} width={4} height={5} fill={C.glass} />
      <rect x={30} y={22} width={4} height={1} fill={C.coral} />
      {/* sign */}
      <rect x={8} y={8} width={24} height={3} fill={C.wood} />
      <rect x={9} y={9} width={22} height={1} fill={C.cream} />
    </svg>
  )
}

export function NoticeBoardProp({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 30" className={`pixelated block ${className ?? ''}`} {...svgProps}>
      {/* posts */}
      <rect x={5} y={16} width={3} height={14} fill={C.woodDeep} />
      <rect x={24} y={16} width={3} height={14} fill={C.woodDeep} />
      {/* board */}
      <rect x={1} y={2} width={30} height={17} fill={C.woodDeep} />
      <rect x={3} y={4} width={26} height={13} fill={C.wood} />
      {/* pinned papers */}
      <rect x={5} y={6} width={7} height={9} fill={C.paper} />
      <rect x={13} y={7} width={6} height={7} fill={C.cream} />
      <rect x={20} y={5} width={7} height={10} fill={C.paper} />
      <rect x={6} y={6} width={1} height={1} fill={C.coral} />
      <rect x={14} y={7} width={1} height={1} fill={C.coral} />
      <rect x={21} y={5} width={1} height={1} fill={C.coral} />
      {/* grass tufts */}
      <rect x={2} y={28} width={6} height={2} fill={C.grassDeep} />
      <rect x={22} y={28} width={8} height={2} fill={C.grassDeep} />
    </svg>
  )
}

export function PodiumProp({ className, children }: { className?: string; children?: ReactNode }) {
  return (
    <div className={`relative ${className ?? ''}`}>
      <svg viewBox="0 0 32 30" className="pixelated block w-full" {...svgProps}>
        <rect x={4} y={16} width={24} height={13} fill={C.navyDark} />
        <rect x={6} y={18} width={20} height={11} fill={C.wood} />
        <rect x={2} y={12} width={28} height={5} fill={C.navyDark} />
        <rect x={3} y={13} width={26} height={3} fill={C.woodDeep} />
        <rect x={7} y={20} width={18} height={7} fill={C.cream} />
        <rect x={9} y={22} width={14} height={1} fill={C.navy} />
        <rect x={9} y={24} width={10} height={1} fill={C.navy} />
      </svg>
      <div className="absolute inset-x-0 -top-6 flex justify-center">{children}</div>
    </div>
  )
}

export function PixelFlag({ colour = C.coral, className }: { colour?: string; className?: string }) {
  return (
    <svg viewBox="0 0 12 16" className={`pixelated block ${className ?? ''}`} {...svgProps}>
      <rect x={2} y={0} width={2} height={16} fill={C.woodDeep} />
      <rect x={4} y={1} width={7} height={7} fill={colour} />
      <rect x={4} y={1} width={7} height={1} fill={C.navyDark} />
      <rect x={4} y={7} width={7} height={1} fill={C.navyDark} />
      <rect x={6} y={3} width={3} height={3} fill={C.cream} />
    </svg>
  )
}

/** Long cobblestone strip with hard pixel edges. */
export function CobbleStrip({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 12" className={`pixelated block w-full ${className ?? ''}`} preserveAspectRatio="none" {...svgProps}>
      <rect x={0} y={0} width={80} height={12} fill={C.creamDeep} />
      <rect x={0} y={0} width={80} height={1} fill={C.navyDark} />
      <rect x={0} y={11} width={80} height={1} fill={C.navyDark} />
      {Array.from({ length: 10 }).map((_, i) => (
        <rect key={`h${i}`} x={i * 8} y={0} width={1} height={12} fill={C.navyDark} opacity={0.45} />
      ))}
      {Array.from({ length: 9 }).map((_, i) => (
        <rect key={`b${i}`} x={i * 8 + 4} y={5} width={8} height={1} fill={C.navyDark} opacity={0.45} />
      ))}
    </svg>
  )
}

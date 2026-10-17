import type { CSSProperties, ReactElement } from 'react'

export interface PixelArtProps {
  /** Rows of characters. Every character maps to a palette key; '.' or ' ' is transparent. */
  grid: string[]
  /** character -> CSS colour */
  palette: Record<string, string>
  className?: string
  style?: CSSProperties
  /** Accessible label. Omit for purely decorative art. */
  label?: string
}

/**
 * Renders character-grid pixel art as crisp SVG rects.
 * One grid character === one SVG unit, so everything lines up on the pixel grid.
 */
export function PixelArt({ grid, palette, className, style, label }: PixelArtProps) {
  const rows = grid.length
  const cols = grid.reduce((max, row) => Math.max(max, row.length), 0)
  const rects: ReactElement[] = []

  grid.forEach((row, y) => {
    for (let x = 0; x < row.length; x += 1) {
      const key = row[x]
      const fill = palette[key]
      if (!fill || key === '.' || key === ' ') continue
      rects.push(<rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={fill} />)
    }
  })

  return (
    <svg
      viewBox={`0 0 ${cols} ${rows}`}
      className={`pixelated block ${className ?? ''}`}
      style={style}
      shapeRendering="crispEdges"
      role={label ? 'img' : 'presentation'}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
    >
      {rects}
    </svg>
  )
}

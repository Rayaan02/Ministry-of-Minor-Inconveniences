/**
 * Tiny pixel-grid helper used by the world renderer and the React sprite components.
 * One grid cell === one art pixel.
 */
export class Grid {
  readonly w: number
  readonly h: number
  readonly cells: string[][]

  constructor(w: number, h: number, fill = '.') {
    this.w = w
    this.h = h
    this.cells = Array.from({ length: h }, () => Array.from({ length: w }, () => fill))
  }

  set(x: number, y: number, ch: string): this {
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return this
    this.cells[y][x] = ch
    return this
  }

  get(x: number, y: number): string {
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return '.'
    return this.cells[y][x]
  }

  rect(x: number, y: number, w: number, h: number, ch: string): this {
    for (let i = 0; i < w; i += 1) {
      for (let j = 0; j < h; j += 1) this.set(x + i, y + j, ch)
    }
    return this
  }

  /** Draw a w x h box outline. */
  frame(x: number, y: number, w: number, h: number, ch: string): this {
    for (let i = 0; i < w; i += 1) {
      this.set(x + i, y, ch)
      this.set(x + i, y + h - 1, ch)
    }
    for (let j = 0; j < h; j += 1) {
      this.set(x, y + j, ch)
      this.set(x + w - 1, y + j, ch)
    }
    return this
  }

  hline(x: number, y: number, w: number, ch: string): this {
    return this.rect(x, y, w, 1, ch)
  }

  vline(x: number, y: number, h: number, ch: string): this {
    return this.rect(x, y, 1, h, ch)
  }

  rows(): string[] {
    return this.cells.map((row) => row.join(''))
  }
}

export function gridFromRows(rows: string[]): Grid {
  const w = rows.reduce((max, row) => Math.max(max, row.length), 0)
  const grid = new Grid(w, rows.length)
  rows.forEach((row, y) => {
    for (let x = 0; x < row.length; x += 1) grid.set(x, y, row[x])
  })
  return grid
}

/** Mirror a grid horizontally (used for left-facing sprites). */
export function mirrorGrid(source: Grid): Grid {
  const out = new Grid(source.w, source.h)
  for (let y = 0; y < source.h; y += 1) {
    for (let x = 0; x < source.w; x += 1) out.set(source.w - 1 - x, y, source.get(x, y))
  }
  return out
}

/** Replace characters, e.g. hide a beak when a character faces away from the camera. */
export function recolour(source: Grid, map: Record<string, string>): Grid {
  const out = new Grid(source.w, source.h)
  for (let y = 0; y < source.h; y += 1) {
    for (let x = 0; x < source.w; x += 1) {
      const ch = source.get(x, y)
      out.set(x, y, map[ch] ?? ch)
    }
  }
  return out
}

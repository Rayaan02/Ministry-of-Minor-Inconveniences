/**
 * Village buildings, drawn programmatically at FULL resolution (1 grid cell = 1 art pixel),
 * so they share the exact pixel density of the trees, flowers and characters.
 *
 * Sizes are in world pixels on a 16px tile grid:
 *   Ministry  80 x 64  (5 x 4 tiles)
 *   Archives  64 x 48  (4 x 3 tiles)
 */
import { Grid } from './grid'

export const MINISTRY_W = 80
export const MINISTRY_H = 64
export const ARCHIVES_W = 64
export const ARCHIVES_H = 48

/** Ministry of Minor Inconveniences — stepped coral roof, cream walls, gold columns. */
export function ministryGrid(): Grid {
  const g = new Grid(MINISTRY_W, MINISTRY_H)

  // Stepped coral roof, navy outlined, each step shaded.
  const steps: Array<[number, number]> = [
    [30, 20],
    [26, 28],
    [22, 36],
    [18, 44],
    [14, 52],
    [10, 60]
  ]
  steps.forEach(([x, w], index) => {
    const y = index * 4
    g.rect(x, y, w, 4, 'n')
    g.rect(x + 1, y + 1, w - 2, 2, 'r')
    g.hline(x + 1, y + 2, w - 2, 'R')
  })

  // Eaves, then the wall block.
  g.rect(6, 23, 68, 2, 'n')
  g.rect(6, 24, 68, 38, 'n')
  g.rect(8, 26, 64, 34, 'c')
  g.hline(8, 26, 64, 'C')

  // Gold-capped columns.
  ;[10, 26, 48, 64].forEach((x) => {
    g.rect(x, 30, 6, 28, 'n')
    g.rect(x + 1, 31, 4, 26, 'p')
    g.rect(x - 1, 29, 8, 2, 'y')
    g.rect(x - 1, 58, 8, 2, 'y')
  })

  // Windows with crossbars.
  ;[17, 55].forEach((x) => {
    g.rect(x, 34, 8, 11, 'n')
    g.rect(x + 1, 35, 6, 9, 'o')
    g.vline(x + 4, 35, 9, 'n')
    g.hline(x + 1, 39, 6, 'n')
  })

  // Wall clock (the Ministry is always 4:15 late).
  g.rect(34, 27, 12, 10, 'n')
  g.rect(35, 28, 10, 8, 'p')
  g.vline(40, 30, 4, 'n')
  g.hline(40, 33, 3, 'n')

  // Door + entrance steps.
  g.rect(34, 38, 12, 22, 'n')
  g.rect(36, 40, 8, 20, 't')
  g.vline(40, 40, 20, 'T')
  g.rect(41, 48, 2, 2, 'y')
  g.rect(28, 60, 24, 2, 'C')
  g.rect(24, 62, 32, 2, 'C')

  return g
}

/** The Archives — lavender roof, cream walls, and boxes of other people's grievances. */
export function archivesGrid(): Grid {
  const g = new Grid(ARCHIVES_W, ARCHIVES_H)

  const steps: Array<[number, number]> = [
    [22, 20],
    [18, 28],
    [14, 36],
    [10, 44]
  ]
  steps.forEach(([x, w], index) => {
    const y = index * 4
    g.rect(x, y, w, 4, 'n')
    g.rect(x + 1, y + 1, w - 2, 2, 'l')
    g.hline(x + 1, y + 2, w - 2, 'L')
  })
  g.rect(4, 15, 56, 2, 'n')

  // Signboard.
  g.rect(18, 12, 28, 6, 't')
  g.rect(20, 13, 24, 3, 'c')
  g.hline(24, 14, 16, 'n')

  // Wall block.
  g.rect(4, 16, 56, 30, 'n')
  g.rect(6, 18, 52, 26, 'c')
  g.hline(6, 18, 52, 'C')

  // Pillars.
  ;[8, 20, 44, 56].forEach((x) => {
    g.rect(x, 22, 6, 22, 'n')
    g.rect(x + 1, 23, 4, 20, 'p')
    g.rect(x - 1, 21, 8, 2, 'l')
    g.rect(x - 1, 45, 8, 2, 'l')
  })

  // A window, and stacks of files that never made it inside.
  g.rect(28, 24, 8, 8, 'n')
  g.rect(29, 25, 6, 6, 'o')
  g.hline(29, 28, 6, 'n')
  g.rect(38, 24, 6, 6, 'y')
  g.rect(38, 30, 6, 4, 'r')

  // Door + step.
  g.rect(26, 34, 12, 12, 'n')
  g.rect(28, 36, 8, 10, 'T')
  g.rect(33, 41, 2, 2, 'y')
  g.rect(20, 46, 24, 2, 'C')

  return g
}

export const POST_OFFICE_W = 64
export const POST_OFFICE_H = 44

export function postOfficeGrid(): Grid {
  const g = new Grid(POST_OFFICE_W, POST_OFFICE_H)
  const steps: Array<[number, number]> = [[18, 28], [14, 36], [10, 44]]
  steps.forEach(([x, w], index) => {
    const y = index * 4
    g.rect(x, y, w, 4, 'n')
    g.rect(x + 1, y + 1, w - 2, 2, 'c')
    g.hline(x + 1, y + 2, w - 2, 'C')
  })
  g.rect(6, 11, 52, 2, 'n')
  g.rect(8, 9, 48, 2, 'p')
  g.rect(4, 12, 56, 24, 'n')
  g.rect(6, 14, 52, 20, 'c')
  g.hline(6, 14, 52, 'C')
  ;[10, 24, 40, 54].forEach((x) => {
    g.rect(x, 18, 6, 14, 'n')
    g.rect(x + 1, 19, 4, 12, 'p')
    g.rect(x - 1, 17, 8, 2, 'p')
  })
  g.rect(18, 18, 28, 8, 'n')
  g.rect(20, 19, 24, 6, 'o')
  g.vline(32, 19, 6, 'n')
  g.hline(20, 22, 24, 'n')
  g.rect(26, 28, 12, 8, 'n')
  g.rect(28, 30, 8, 6, 't')
  g.rect(33, 33, 2, 2, 'y')
  g.rect(20, 38, 24, 4, 'C')
  return g
}

export const TAVERN_W = 72
export const TAVERN_H = 48

export function tavernGrid(): Grid {
  const g = new Grid(TAVERN_W, TAVERN_H)
  const steps: Array<[number, number]> = [[22, 28], [18, 36], [14, 44], [10, 52]]
  steps.forEach(([x, w], index) => {
    const y = index * 4
    g.rect(x, y, w, 4, 'n')
    g.rect(x + 1, y + 1, w - 2, 2, 'r')
    g.hline(x + 1, y + 2, w - 2, 'R')
  })
  g.rect(6, 15, 60, 2, 'n')
  g.rect(8, 13, 56, 2, 'y')
  g.rect(4, 16, 64, 24, 'n')
  g.rect(6, 18, 60, 20, 'c')
  g.hline(6, 18, 60, 'C')
  ;[10, 22, 38, 50, 62].forEach((x) => {
    g.rect(x, 20, 6, 14, 'n')
    g.rect(x + 1, 21, 4, 12, 'p')
    g.rect(x - 1, 19, 8, 2, 'y')
  })
  g.rect(28, 20, 16, 8, 'n')
  g.rect(30, 21, 12, 6, 'o')
  g.hline(30, 24, 12, 'n')
  g.rect(30, 30, 12, 6, 'n')
  g.rect(32, 32, 8, 4, 't')
  g.rect(37, 33, 2, 2, 'y')
  g.rect(20, 40, 32, 6, 'C')
  return g
}

export const COTTAGE_W = 48
export const COTTAGE_H = 36

export function cottageGrid(): Grid {
  const g = new Grid(COTTAGE_W, COTTAGE_H)
  const steps: Array<[number, number]> = [[16, 16], [12, 24], [8, 32]]
  steps.forEach(([x, w], index) => {
    const y = index * 4
    g.rect(x, y, w, 4, 'n')
    g.rect(x + 1, y + 1, w - 2, 2, 'l')
    g.hline(x + 1, y + 2, w - 2, 'L')
  })
  g.rect(4, 11, 40, 2, 'n')
  g.rect(4, 12, 40, 16, 'n')
  g.rect(6, 14, 36, 12, 'c')
  g.hline(6, 14, 36, 'C')
  g.rect(18, 16, 12, 6, 'n')
  g.rect(20, 17, 8, 4, 'o')
  g.hline(20, 19, 8, 'n')
  g.rect(10, 22, 10, 6, 'n')
  g.rect(12, 24, 6, 4, 't')
  g.rect(15, 25, 2, 2, 'y')
  g.rect(12, 28, 24, 6, 'C')
  return g
}

export const FOUNTAIN_W = 24
export const FOUNTAIN_H = 20

export function fountainGrid(): Grid {
  const g = new Grid(FOUNTAIN_W, FOUNTAIN_H)
  g.rect(2, 6, 20, 8, 'n')
  g.rect(4, 8, 16, 4, 'p')
  g.rect(8, 10, 8, 4, 's')
  g.rect(10, 12, 4, 2, 'w')
  g.hline(2, 5, 20, 'y')
  g.hline(2, 14, 20, 'C')
  return g
}

export const GAZEBO_W = 40
export const GAZEBO_H = 32

export function gazeboGrid(): Grid {
  const g = new Grid(GAZEBO_W, GAZEBO_H)
  g.rect(4, 10, 32, 2, 'n')
  g.rect(6, 11, 28, 2, 'c')
  ;[8, 16, 24, 32].forEach((x) => {
    g.rect(x, 12, 2, 12, 't')
    g.rect(x - 1, 11, 4, 2, 'T')
    g.rect(x - 1, 24, 4, 2, 'C')
  })
  const steps: Array<[number, number]> = [[10, 20], [6, 28]]
  steps.forEach(([x, w], index) => {
    const y = 24 + index * 4
    g.rect(x, y, w, 4, 'n')
    g.rect(x + 1, y + 1, w - 2, 2, 'c')
  })
  return g
}

import { Grid, gridFromRows, mirrorGrid, recolour } from './grid'

export type Palette = Record<string, string>
export interface SpriteDef {
  label: string
  rows: string[]
  palette: Palette
}

/* ============================================================
   PALETTES
   ============================================================ */
export const WORLD_PALETTE: Palette = {
  n: '#1A2337', // hard outline
  N: '#29364F', // deep navy
  b: '#3D4E6F', // slate
  d: '#DCE0E8', // pigeon light
  m: '#A9B0C2', // pigeon mid
  e: '#1A2337', // eye
  w: '#FFFFFF',
  y: '#F5C86A', // golden yellow
  Y: '#D9A63F', // golden deep
  r: '#E97862', // coral red
  R: '#C95643', // coral deep
  g: '#356B53', // forest green
  G: '#2A5540', // forest dark
  k: '#79B86A', // grass green
  K: '#5C9A52', // grass deep
  c: '#FFF0C9', // warm cream
  C: '#F3DDA4', // cream deep
  p: '#FFF8E6', // paper
  t: '#956746', // wood brown
  T: '#6F4B30', // wood deep
  l: '#A994D4', // lavender
  L: '#8B76B8', // lavender deep
  s: '#75C9E8', // sky blue
  o: '#BFE7F5', // glass
  h: '#E97862' // alias coral (scarf)
}

export const SIR_PIGEON_PALETTE: Palette = {
  n: '#1A2337',
  b: '#29364F',
  l: '#3D4E6F',
  d: '#DCE0E8',
  e: '#A9B0C2',
  y: '#F5C86A',
  r: '#E97862',
  w: '#FFF0C9'
}

/* ============================================================
   SIR PIGEON III — the Minister (NPC)
   ============================================================ */
export const SIR_PIGEON_ROWS = [
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

/* ============================================================
   THE PLAYER — an ordinary citizen pigeon with a small red scarf
   ============================================================ */
export const CITIZEN_FRONT = [
  '....nnnnnn....',
  '...nddddddn...',
  '...ndeddedn...',
  '...nddddddn...',
  '....ndyydn....',
  '..nneddddenn..',
  '..nedddddden..',
  '..nedmrrdmen..',
  '..nemmmmmmen..',
  '..nemmmmmmen..',
  '...nedddden...',
  '....y....y....'
]

export const CITIZEN_BACK = [
  '....nnnnnn....',
  '...nddddddn...',
  '...nddddddn...',
  '...nddddddn...',
  '...nddddddn...',
  '..nneddddenn..',
  '..nedddddden..',
  '..nedmrrdmen..',
  '..nemmmmmmen..',
  '..nemmmmmmen..',
  '...nedddden...',
  '....y....y....'
]

export const CITIZEN_SIDE = [
  '.....nnnnn....',
  '....ndddddn...',
  '....nddeddn...',
  '....nddddyy...',
  '...neddddden..',
  '..nemmmmmmen..',
  '..nemmmmmmen..',
  '..nemmmmmmen..',
  '..nemmmmmmen..',
  '..nemmmmmmen..',
  '...nedddden...',
  '....y....y....'
]

/* ============================================================
   SCENERY
   ============================================================ */
export const TREE_ROWS = [
  '.......gggg.......',
  '.....gggggggg.....',
  '....gggggggggg....',
  '...gggggggggggg...',
  '..gggggggggggggg..',
  '.gggggggggggggggg.',
  '.gggggggggggggggg.',
  'gggggggggggggggggg',
  'gggggggggggggggggg',
  '.gggggggggggggggg.',
  '.gggggggggggggggg.',
  '..gggggggggggggg..',
  '...gggggggggggg...',
  '....gggggggggg....',
  '......gggggg......',
  '.......gggg.......',
  '.......tttt.......',
  '.......tTTt.......',
  '.......tTTt.......',
  '.......tTTt.......',
  '.......tTTt.......',
  '......tTTTTt......',
  '.....ttTTTTtt.....',
  '.....ttTTTTtt.....'
]

export const BUSH_ROWS = [
  '...kkkkkkkk...',
  '..kkkkkkkkkk..',
  '.kkkkkkkkkkkk.',
  'kkkkkkkkkkkkkk',
  'kkkkkkkkkkkkkk',
  'kkkkkkkkkkkkkk',
  '.kkkkkkkkkkkk.',
  '..kkkkkkkkkk..',
  '...kkkkkkkk...'
]

export const FLOWER_ROWS = [
  '.....rrrr.....',
  '...rrrrrrrr...',
  '..rrrrrrrrrr..',
  '.rrrrrrrrrrrr.',
  '.rrrrryrrrrrr.',
  '.rrrrrrrrrrrr.',
  '..rrrrrrrrrr..',
  '...rrrrrrrr...',
  '.....rrrr.....',
  '......gg......',
  '.kkk..gg..kkk.',
  'kkkkk.gg.kkkkk',
  '.kkk..gg..kkk.',
  '.....gggg.....'
]

export const SIGN_ROWS = [
  '..tttttttttt..',
  '..tppppppppt..',
  '..tpnnnnpppt..',
  '..tpnnnppppt..',
  '..tppppppppt..',
  '..tttttttttt..',
  '......TT......',
  '......TT......',
  '......TT......',
  '......TT......',
  '.....TTTT.....'
]

export const NOTICE_BOARD_ROWS = [
  '..TTTTTTTTTTTT..',
  '..TttttttttttT..',
  '..TtpppttppprT..',
  '..TtpppttppptT..',
  '..TtpppttppptT..',
  '..TtpppttppptT..',
  '..TttttttttttT..',
  '..TTTTTTTTTTTT..',
  '....TT....TT....',
  '....TT....TT....',
  '....TT....TT....',
  '....TT....TT....'
]

export const CHEST_ROWS = [
  '..TTTTTTTT..',
  '.TttttttttT.',
  'TtrrrrrrrrtT',
  'TttttttttttT',
  'TttttttttttT',
  'TTTTTTTTTTTT'
]

/* ============================================================
   BUILDINGS (drawn at half-tile resolution)
   ============================================================ */
function ministryGrid(): Grid {
  const g = new Grid(26, 12)
  // stepped coral roof with navy outline
  const roof: Array<[number, number]> = [
    [9, 8],
    [7, 12],
    [5, 16],
    [3, 20],
    [1, 24]
  ]
  roof.forEach(([x, w], index) => {
    g.rect(x, index, w, 1, 'n')
  })
  roof.forEach(([x, w], index) => {
    g.rect(x + 1, index, w - 2, 1, index >= 4 ? 'r' : 'r')
  })
  g.hline(0, 5, 26, 'n')
  g.hline(1, 4, 24, 'R')
  // walls
  g.rect(0, 6, 26, 6, 'n')
  g.rect(1, 6, 24, 6, 'c')
  g.hline(1, 6, 24, 'C')
  // columns
  ;[3, 8, 15].forEach((x) => {
    g.rect(x, 7, 2, 5, 'p')
    g.rect(x - 1, 6, 4, 1, 'y')
  })
  // clock face
  g.rect(19, 6, 5, 5, 'n')
  g.rect(20, 7, 3, 3, 'p')
  g.set(21, 8, 'N')
  g.set(21, 9, 'r')
  // windows
  g.rect(12, 8, 2, 2, 'o')
  g.rect(12, 8, 2, 1, 'n')
  g.rect(11, 8, 1, 2, 'n')
  // door
  g.rect(5, 9, 4, 3, 'n')
  g.rect(6, 9, 2, 3, 't')
  g.set(8, 10, 'y')
  // steps
  g.hline(0, 11, 26, 'C')
  g.hline(0, 11, 26, 'C')
  return g
}

function archivesGrid(): Grid {
  const g = new Grid(22, 12)
  // lavender roof
  g.rect(2, 0, 18, 2, 'n')
  g.rect(3, 0, 16, 1, 'l')
  g.rect(4, 1, 14, 1, 'L')
  g.hline(0, 2, 22, 'n')
  g.hline(1, 2, 20, 'l')
  // sign board
  g.rect(6, 3, 10, 2, 't')
  g.rect(7, 3, 8, 1, 'c')
  // walls
  g.rect(0, 4, 22, 8, 'n')
  g.rect(1, 4, 20, 8, 'c')
  // pillars
  ;[3, 7, 14, 18].forEach((x) => {
    g.rect(x, 5, 2, 6, 'p')
    g.rect(x - 1, 4, 4, 1, 'l')
  })
  // doorway + file stacks
  g.rect(9, 6, 4, 6, 'n')
  g.rect(10, 7, 2, 5, 'T')
  g.set(10, 8, 'y')
  g.set(10, 10, 'y')
  // windows with boxes
  g.rect(16, 6, 3, 3, 'o')
  g.rect(16, 7, 3, 1, 'y')
  g.rect(16, 9, 3, 2, 'o')
  g.rect(16, 10, 3, 1, 'r')
  return g
}

/* ============================================================
   SPRITE REGISTRY — used by the game renderer and the PNG preview tool
   ============================================================ */
export interface WorldSprite extends SpriteDef {
  grid: Grid
}

function def(label: string, rows: string[], palette: Palette = WORLD_PALETTE): WorldSprite {
  return { label, rows, palette, grid: gridFromRows(rows) }
}

export const SIR_PIGEON_SPRITE: WorldSprite = def('Sir Pigeon III (Minister)', SIR_PIGEON_ROWS, SIR_PIGEON_PALETTE)
export const CITIZEN_SPRITES = {
  front: def('Player — front', CITIZEN_FRONT),
  back: def('Player — back', CITIZEN_BACK),
  side: def('Player — side (right)', CITIZEN_SIDE),
  left: def('Player — side (left)', mirrorGrid(gridFromRows(CITIZEN_SIDE)).rows())
}

export const HUGE_TREE_ROWS: string[] = [
  ".............................kkgggggggggggGG............................",
  "...........................kkgggggggggggggggGG..........................",
  "..........................kkgggggggggggggggggGG.........................",
  ".........................kkgggggggggggggggggggGG........................",
  "........................kkgggggggggggggggggggggGG.......................",
  ".......................kkgggggggggggggggggggggggGG......................",
  ".......................kggggggggggggggggggggggggGG......................",
  "......................kggggggggggggggggggggggggggGG.....................",
  "......................kggggggggggggggggggggggggggGG.....................",
  ".....................kggggggggggggggggggggggggggggGG....................",
  ".....................kggggggggggggggggggggggggggggGG....................",
  ".....................gggggggggggggggggggggggggggggGG....................",
  ".....................gggggggggggggggggggggggggggggGG....................",
  "....................kggggggggggggggggggggggggggggggGG...................",
  "..................kkgggggggggggggggggggggggggggggggggGG.................",
  ".................kkgggggggggggggggggggggggggggggggggggGG................",
  "................kkgggggggggggggggggggggggggggggggggggggGG...............",
  "............kkgggggggggggggggggggggggggggggggggggggggggggggGG...........",
  "..........kkgggggggggggggggggggggggggggggggggggggggggggggggggGG.........",
  ".........kkgggggggggggggggggggggggggggggggggggggggggggggggggggGG........",
  "........kkgggggggggggggggggggggggggggggggggggggggggggggggggggggGG.......",
  ".......kkgggggggggggggggggggggggggggggggggggggggggggggggggggggggGG......",
  "......kkgggggggggggggggggggggggggggggggggggggggggggggggggggggggggGG.....",
  ".....kkgggggggggggggggggggggggggggggggggggggggggggggggggggggggggggGG....",
  ".....kggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggGG....",
  "....kggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggGG...",
  "....kggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggGG...",
  "....gggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggGG...",
  "....gggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggGG...",
  "....gggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggGG...",
  "...GggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggGG..",
  "....gggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggGG...",
  "....gggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggGG...",
  "....gggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggGG...",
  "....GggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggGG...",
  "....GggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggGG...",
  ".....GggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggGG....",
  ".....GGgggggggggggggggggggggggggggggggggggggggggggggggggggggggggggGG....",
  "......GGgggggggggggggggggggggggggggggggggggggggggggggggggggggggggGG.....",
  ".......GGgggggggggggggggggggggggggggggggggggggggggggggggggggggggGG......",
  "........GGgggggggggggggggggggggggggggggggggggggggggggggggggggggGG.......",
  ".........GggggggggggggggggggggggggggggggggggggggggggggggggggggGG........",
  "..........gggggggggggggggggggggggggggggggggggggggggggggggggggGG.........",
  "..........gggggggggggggggggggggggggggggggggggggggggggggggggggGG.........",
  ".........GggggggggggggggggggggggggggggggggggggggggggggggggggggGG........",
  "..........gggggggggggggggggggggggggggggggggggggggggggggggggggGG.........",
  "..........gggggggggggggggggggggggggggggggggggggggggggggggggggGG.........",
  "..........gggggggggggggggggggggggggggggggggggggggggggggggggggGG.........",
  "..........GggggggggggggggggggggggggggggggggggggggggggggggggggGG.........",
  "..........GGgggggggggggggggggggggggggggggggggggggggggggggggggGG.........",
  "...........GggggggggggggggggggggggggggggggggggggggggggggggggGG..........",
  "............GggggggggggggggggggggggggggggggggggggggggggggggGG...........",
  "............GGggggggggggggggggTTttttttttTTgggggggggggggggggGG...........",
  ".............GGGggggggggggggggTTttttttttTTgggggggggggggggGGG............",
  "..............GGGgggggggggggggTTttttttttTTggggggggggggggGGG.............",
  "................GGGGGGggggggggTTttttttttTTgggggggggGGGGGG...............",
  ".................GGGGGGGggggggTTttttttttTTgggggggGGGGGGG................",
  "......................GGGGggggTTttttttttTTgggggGGGG.....................",
  "........................GGGGGgTTttttttttTTggGGGGG.......................",
  "..........................GGGGTTttttttttTTGGGGG.........................",
  ".............................GTTttttttttTTGG............................",
  "..............................TTttttttttTT..............................",
  "............................TTttttttttttttTT............................",
  "............................TTttttttttttttTT............................",
  "............................TTttttttttttttTT............................",
  "............................TTttttttttttttTT............................",
  "............................TTttttttttttttTT............................",
  "............................TTttttttttttttTT............................",
  "............................TTttttttttttttTT............................",
  "............................TTttttttttttttTT............................",
  "............................TTttttttttttttTT............................",
  "............................TTttttttttttttTT............................",
  "............................TTttttttttttttTT............................",
  "............................TTttttttttttttTT............................",
  "..........................TTttttttttttttttttTT..........................",
  "..........................TTttttttttttttttttTT..........................",
  "..........................TTttttttttttttttttTT..........................",
  "..........................TTttttttttttttttttTT..........................",
  "..........................TTttttttttttttttttTT..........................",
  "..........................TTttttttttttttttttTT..........................",
  "..........................TTttttttttttttttttTT..........................",
  "..........................TTttttttttttttttttTT..........................",
  "..........................TTttttttttttttttttTT..........................",
  ".......................TTTTTttttttttttttttttTTTTT.......................",
  "....................TTTTTTTTttttttttttttttttTTTTTTTT....................",
  ".................TTTTTTTTTTTttttttttttttttttTTTTTTTTTTT.................",
  "..............TTTTTTTTTTTTTTttttttttttttttttTTTTTTTTTTTTTT..............",
  "...........TTTTTTTTTTTTTTTTTttttttttttttttttTTTTTTTTTTTTTTTTT..........."
]

export const SCENERY_SPRITES = {
  tree: def('Tree', TREE_ROWS),
  hugeTree: def('Ancient Tree', HUGE_TREE_ROWS),
  bush: def('Bush', BUSH_ROWS),
  flowerCoral: def('Flower (coral)', FLOWER_ROWS, { ...WORLD_PALETTE, r: '#E97862', y: '#F5C86A' }),
  flowerGold: def('Flower (gold)', FLOWER_ROWS, { ...WORLD_PALETTE, r: '#F5C86A', y: '#FFF0C9' }),
  flowerLavender: def('Flower (lavender)', FLOWER_ROWS, { ...WORLD_PALETTE, r: '#A994D4', y: '#FFF0C9' }),
  sign: def('Wooden sign', SIGN_ROWS),
  noticeBoard: def('Notice board', NOTICE_BOARD_ROWS),
  chest: def('Lost property chest', CHEST_ROWS)
}

const ministry = ministryGrid()
const archives = archivesGrid()

export const BUILDING_SPRITES = {
  ministry: { label: 'Ministry of Minor Inconveniences', rows: ministry.rows(), palette: WORLD_PALETTE, grid: ministry },
  archives: { label: 'The Archives', rows: archives.rows(), palette: WORLD_PALETTE, grid: archives }
}

/** A grumpy-looking guard pigeon (recoloured citizen for variety). */
export const GUARD_SPRITE: WorldSprite = def(
  'Guard pigeon (NPC)',
  CITIZEN_FRONT,
  { ...WORLD_PALETTE, d: '#A9B0C2', m: '#7E879E', r: '#F5C86A' }
)

export const CLERK_SPRITE: WorldSprite = def(
  'Clerk pigeon (NPC)',
  CITIZEN_FRONT,
  { ...WORLD_PALETTE, d: '#C9CEDA', m: '#8E97AE', r: '#75C9E8' }
)

/** Every sprite, grouped, for the sprite-sheet preview script. */
export const SPRITE_GROUPS: Record<string, Array<SpriteDef & { scale: number }>> = {
  characters: [
    { ...SIR_PIGEON_SPRITE, scale: 8 },
    { ...CITIZEN_SPRITES.front, scale: 8 },
    { ...CITIZEN_SPRITES.back, scale: 8 },
    { ...CITIZEN_SPRITES.side, scale: 8 },
    { ...CLERK_SPRITE, scale: 8 },
    { ...GUARD_SPRITE, scale: 8 }
  ],
  scenery: [
    { ...SCENERY_SPRITES.tree, scale: 5 },
    { ...SCENERY_SPRITES.bush, scale: 5 },
    { ...SCENERY_SPRITES.flowerCoral, scale: 5 },
    { ...SCENERY_SPRITES.sign, scale: 5 },
    { ...SCENERY_SPRITES.noticeBoard, scale: 5 },
    { ...SCENERY_SPRITES.chest, scale: 5 }
  ],
  ancient: [{ ...SCENERY_SPRITES.hugeTree, scale: 2 }],
  buildings: [
    { ...BUILDING_SPRITES.ministry, scale: 4 },
    { ...BUILDING_SPRITES.archives, scale: 4 }
  ]
}

export { recolour, mirrorGrid }

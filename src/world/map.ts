/**
 * The village of Nowhere-in-Particular — a hand-authored 72 x 40 tile world.
 *
 * Expanded with a town square, more buildings, a huge tree, extra pigeons and
 * a few easter eggs. The map is authored in tiles (16px), collision in world pixels.
 */
import {
  CLERK_SPRITE,
  CITIZEN_SPRITES,
  GUARD_SPRITE,
  SCENERY_SPRITES,
  SIR_PIGEON_SPRITE,
  WORLD_PALETTE,
  type WorldSprite
} from './art'
import { Grid } from './grid'
import {
  archivesGrid,
  ministryGrid,
  postOfficeGrid,
  tavernGrid,
  cottageGrid,
  fountainGrid,
  gazeboGrid
} from './buildings'

export const TILE = 16
export const MAP_W = 72
export const MAP_H = 40
export const WORLD_W = MAP_W * TILE
export const WORLD_H = MAP_H * TILE

export type Facing = 'up' | 'down' | 'left' | 'right'
export type GroundTile = 'grass' | 'grassDark' | 'path' | 'plaza' | 'water' | 'sand'

export interface Rect {
  x: number
  y: number
  w: number
  h: number
}

export interface WorldObject {
  id: string
  sprite: WorldSprite
  x: number
  y: number
  /** World-pixel rect that blocks movement (null = walk over / through). */
  solid: Rect | null
}

export type ZoneKind = 'door' | 'npc' | 'board' | 'chest' | 'sign'

export interface DialogueLine {
  speaker: string
  lines: string[]
  portrait?: WorldSprite
  actions?: Array<{ label: string; route: string }>
}

export interface Zone {
  id: string
  kind: ZoneKind
  x: number
  y: number
  radius: number
  /** Prompt shown in the HUD, e.g. "Enter the Ministry Office". */
  label: string
  /** Doors navigate here. */
  route?: string
  /** NPCs / props open a dialogue. */
  dialogue?: DialogueLine
}

export interface Npc {
  id: string
  sprite: WorldSprite
  x: number
  y: number
  facing: Facing
  /** Optional patrol box (world px) for wandering citizens. */
  wander?: Rect
  speed: number
  targetX: number
  targetY: number
  think: number
}

export interface Village {
  ground: GroundTile[][]
  objects: WorldObject[]
  zones: Zone[]
  npcs: Npc[]
  spawn: { x: number; y: number }
  /** Tile-level blockers (water). */
  solidTiles: Uint8Array
  /** Invisible world edges (forest line). */
  boundaries: Rect[]
  locationAt: (x: number, y: number) => string
}

/* ------------------------------------------------------------------ */
/* helpers                                                             */
/* ------------------------------------------------------------------ */
function hash(x: number, y: number): number {
  let h = Math.imul(x + 1, 374761393) + Math.imul(y + 1, 668265263)
  h = Math.imul(h ^ (h >>> 13), 1274126177)
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295
}

function spriteFromGrid(label: string, grid: Grid): WorldSprite {
  return { label, rows: grid.rows(), palette: WORLD_PALETTE, grid }
}

/* ------------------------------------------------------------------ */
/* furniture positions (tile coords)                                   */
/* ------------------------------------------------------------------ */
const TREES: Array<[number, number]> = [
  [3, 3], [5, 3], [3, 6], [13, 4], [16, 3], [19, 6], [30, 3], [33, 4], [36, 3], [40, 5],
  [43, 8], [43, 11], [3, 17], [5, 20], [7, 23], [12, 20], [16, 24], [20, 18], [24, 22],
  [28, 24], [30, 17], [43, 17], [43, 22], [36, 16], [40, 26], [16, 16], [12, 26], [8, 26],
  [26, 18], [22, 26], [41, 20], [18, 11],
  [51, 4], [55, 6], [59, 3], [64, 7], [68, 10], [69, 16], [68, 22], [64, 27], [58, 30],
  [51, 33], [44, 36], [36, 38], [27, 38], [18, 37], [11, 34], [6, 29], [3, 22], [49, 19],
  [54, 13], [61, 17], [52, 26], [45, 30]
]

const BUSHES: Array<[number, number]> = [
  [4, 10], [11, 7], [20, 4], [31, 5], [34, 9], [42, 16], [4, 15], [15, 10], [25, 16],
  [31, 21], [35, 26], [18, 22], [9, 16], [27, 25], [14, 14],
  [50, 9], [56, 11], [62, 8], [66, 14], [70, 19], [67, 28], [60, 32], [54, 36], [47, 38],
  [39, 36], [32, 35], [24, 34], [17, 31], [10, 27], [6, 18]
]

const FLOWERS: Array<[number, number, number]> = [
  [4, 4, 0], [6, 5, 1], [14, 3, 2], [17, 5, 0], [21, 3, 1], [29, 4, 2], [32, 3, 0],
  [38, 4, 1], [42, 5, 2], [3, 12, 0], [6, 12, 1], [12, 10, 2], [15, 12, 0], [19, 12, 1],
  [23, 12, 2], [30, 12, 0], [35, 12, 1], [39, 12, 2], [44, 13, 0], [4, 22, 1], [10, 24, 2],
  [14, 18, 0], [22, 20, 1], [26, 22, 2], [31, 16, 0], [38, 17, 1], [42, 25, 2], [18, 26, 0],
  [10, 17, 1], [29, 20, 2],
  [48, 7, 1], [53, 10, 2], [58, 5, 0], [65, 9, 1], [70, 13, 2], [70, 25, 0], [65, 30, 1],
  [57, 33, 2], [50, 36, 0], [42, 37, 1], [34, 36, 2], [26, 36, 0], [19, 34, 1], [12, 30, 2],
  [8, 23, 0], [7, 14, 1], [55, 23, 2], [62, 22, 1], [48, 31, 0], [41, 29, 2],
  [24, 4, 0], [27, 6, 1], [46, 12, 2], [49, 16, 0], [56, 19, 1], [60, 24, 2], [63, 36, 0],
  [53, 38, 1], [22, 38, 2]
]

const FLOWER_VARIANTS = [SCENERY_SPRITES.flowerCoral, SCENERY_SPRITES.flowerGold, SCENERY_SPRITES.flowerLavender]

const MINISTRY_TILE: [number, number] = [24, 3]
const ARCHIVES_TILE: [number, number] = [6, 8]
const NOTICE_TILE: [number, number] = [36, 9]
const CHEST_TILE: [number, number] = [12, 11]
const SIGN_TILE: [number, number] = [23, 16]

/* ------------------------------------------------------------------ */
/* the world                                                           */
/* ------------------------------------------------------------------ */
export function buildVillage(): Village {
  const ground: GroundTile[][] = []
  for (let y = 0; y < MAP_H; y += 1) {
    const row: GroundTile[] = []
    for (let x = 0; x < MAP_W; x += 1) row.push(hash(x, y) > 0.68 ? 'grassDark' : 'grass')
    ground.push(row)
  }

  const paint = (tx: number, ty: number, tw: number, th: number, tile: GroundTile) => {
    for (let y = ty; y < ty + th; y += 1) {
      for (let x = tx; x < tx + tw; x += 1) {
        if (y >= 0 && y < MAP_H && x >= 0 && x < MAP_W) ground[y][x] = tile
      }
    }
  }

  // Stone plaza in front of the Ministry, plus the roads through the village.
  paint(22, 7, 12, 6, 'plaza')
  paint(26, 6, 4, 8, 'plaza')
  paint(2, 13, 42, 2, 'path')
  paint(26, 8, 2, 5, 'path')
  paint(8, 11, 2, 2, 'path')
  paint(15, 13, 3, 2, 'plaza')
  paint(36, 18, 6, 4, 'plaza')

  // Duck pond with a sand shore.
  paint(33, 19, 8, 6, 'sand')
  paint(34, 20, 6, 4, 'water')

  const solidTiles = new Uint8Array(MAP_W * MAP_H)
  for (let y = 0; y < MAP_H; y += 1) {
    for (let x = 0; x < MAP_W; x += 1) {
      if (ground[y][x] === 'water') solidTiles[y * MAP_W + x] = 1
    }
  }

  /* ---------------- objects ---------------- */
  const objects: WorldObject[] = []
  const push = (object: WorldObject) => objects.push(object)

  const ministry = spriteFromGrid('Ministry of Minor Inconveniences', ministryGrid())
  const archives = spriteFromGrid('The Archives', archivesGrid())
  const postOffice = spriteFromGrid('The Post Office', postOfficeGrid())
  const tavern = spriteFromGrid('The Slightly Crooked Tavern', tavernGrid())
  const cottage1 = spriteFromGrid('Cottage 1', cottageGrid())
  const cottage2 = spriteFromGrid('Cottage 2', cottageGrid())
  const cottage3 = spriteFromGrid('Cottage 3', cottageGrid())
  const fountain = spriteFromGrid('Town Square Fountain', fountainGrid())
  const gazebo = spriteFromGrid('Gazebo', gazeboGrid())

  const ministryX = MINISTRY_TILE[0] * TILE
  const ministryY = MINISTRY_TILE[1] * TILE
  const archivesX = ARCHIVES_TILE[0] * TILE
  const archivesY = ARCHIVES_TILE[1] * TILE

  push({ id: 'ministry', sprite: ministry, x: ministryX, y: ministryY, solid: { x: ministryX, y: ministryY, w: ministry.grid.w, h: ministry.grid.h } })
  push({ id: 'archives', sprite: archives, x: archivesX, y: archivesY, solid: { x: archivesX, y: archivesY, w: archives.grid.w, h: archives.grid.h } })

  const postX = 35 * TILE; const postY = 18 * TILE
  push({ id: 'post-office', sprite: postOffice, x: postX, y: postY, solid: { x: postX, y: postY, w: postOffice.grid.w, h: postOffice.grid.h } })
  const tavX = 42 * TILE; const tavY = 7 * TILE
  push({ id: 'tavern', sprite: tavern, x: tavX, y: tavY, solid: { x: tavX, y: tavY, w: tavern.grid.w, h: tavern.grid.h } })
  push({ id: 'cottage-a', sprite: cottage1, x: 8 * TILE, y: 14 * TILE, solid: { x: 8 * TILE, y: 14 * TILE, w: cottage1.grid.w, h: cottage1.grid.h } })
  push({ id: 'cottage-b', sprite: cottage2, x: 50 * TILE, y: 22 * TILE, solid: { x: 50 * TILE, y: 22 * TILE, w: cottage2.grid.w, h: cottage2.grid.h } })
  push({ id: 'cottage-c', sprite: cottage3, x: 54 * TILE, y: 30 * TILE, solid: { x: 54 * TILE, y: 30 * TILE, w: cottage3.grid.w, h: cottage3.grid.h } })
  const fntX = 33 * TILE; const fntY = 9 * TILE
  push({ id: 'fountain', sprite: fountain, x: fntX, y: fntY, solid: { x: fntX + 4, y: fntY + 6, w: 16, h: 4 } })
  push({ id: 'gazebo', sprite: gazebo, x: 20 * TILE, y: 9 * TILE, solid: { x: 20 * TILE + 6, y: 9 * TILE + 12, w: 28, h: 12 } })
  const huge = SCENERY_SPRITES.hugeTree
  const hugeX = 28 * TILE; const hugeY = 12 * TILE
  push({ id: 'huge-tree', sprite: huge, x: hugeX - 36, y: hugeY - 82, solid: { x: hugeX - 12, y: hugeY - 34, w: 24, h: 42 } })

  TREES.forEach(([tx, ty], index) => {
    const x = tx * TILE
    const y = ty * TILE - 3
    push({ id: `tree-${index}`, sprite: SCENERY_SPRITES.tree, x, y, solid: { x: x + 2, y: y + 9, w: 12, h: 10 } })
  })

  BUSHES.forEach(([tx, ty], index) => {
    const x = tx * TILE
    const y = ty * TILE
    push({ id: `bush-${index}`, sprite: SCENERY_SPRITES.bush, x, y, solid: { x: x + 1, y: y + 5, w: 10, h: 3 } })
  })

  FLOWERS.forEach(([tx, ty, variant], index) => {
    push({ id: `flower-${index}`, sprite: FLOWER_VARIANTS[variant % FLOWER_VARIANTS.length], x: tx * TILE + 5, y: ty * TILE + 8, solid: null })
  })

  const noticeX = NOTICE_TILE[0] * TILE
  const noticeY = NOTICE_TILE[1] * TILE
  push({ id: 'notice-board', sprite: SCENERY_SPRITES.noticeBoard, x: noticeX, y: noticeY, solid: { x: noticeX + 2, y: noticeY + 10, w: 12, h: 6 } })

  const chestX = CHEST_TILE[0] * TILE
  const chestY = CHEST_TILE[1] * TILE
  push({ id: 'chest', sprite: SCENERY_SPRITES.chest, x: chestX, y: chestY, solid: { x: chestX + 1, y: chestY + 4, w: 10, h: 2 } })

  const signX = SIGN_TILE[0] * TILE
  const signY = SIGN_TILE[1] * TILE
  push({ id: 'welcome-sign', sprite: SCENERY_SPRITES.sign, x: signX, y: signY, solid: { x: signX + 4, y: signY + 6, w: 6, h: 6 } })
  push({ id: 'easter-sign', sprite: SCENERY_SPRITES.sign, x: 38 * TILE, y: 24 * TILE, solid: { x: 38 * TILE + 4, y: 24 * TILE + 6, w: 6, h: 6 } })
  push({ id: 'secret-chest', sprite: SCENERY_SPRITES.chest, x: 60 * TILE, y: 32 * TILE, solid: { x: 60 * TILE + 1, y: 32 * TILE + 4, w: 10, h: 2 } })

  /* ---------------- NPCs ---------------- */
  const npcs: Npc[] = [
    {
      id: 'minister',
      sprite: SIR_PIGEON_SPRITE,
      x: 380,
      y: 166,
      facing: 'down',
      speed: 0,
      targetX: 380,
      targetY: 166,
      think: 0
    },
    {
      id: 'clerk',
      sprite: CLERK_SPRITE,
      x: 176,
      y: 198,
      facing: 'left',
      speed: 0,
      targetX: 176,
      targetY: 198,
      think: 0
    },
    {
      id: 'guard',
      sprite: GUARD_SPRITE,
      x: 480,
      y: 128,
      facing: 'left',
      speed: 0,
      targetX: 480,
      targetY: 128,
      think: 0
    },
    {
      id: 'citizen',
      sprite: CITIZEN_SPRITES.front,
      x: 448,
      y: 180,
      facing: 'left',
      wander: { x: 380, y: 130, w: 120, h: 60 },
      speed: 22,
      targetX: 448,
      targetY: 180,
      think: 0
    },
    {
      id: 'citizen-2',
      sprite: CITIZEN_SPRITES.side,
      x: 420,
      y: 120,
      facing: 'down',
      wander: { x: 400, y: 90, w: 80, h: 50 },
      speed: 18,
      targetX: 420,
      targetY: 120,
      think: 0
    },
    {
      id: 'citizen-3',
      sprite: CITIZEN_SPRITES.back,
      x: 400,
      y: 150,
      facing: 'up',
      wander: { x: 380, y: 120, w: 70, h: 60 },
      speed: 16,
      targetX: 400,
      targetY: 150,
      think: 0
    },
    {
      id: 'citizen-4',
      sprite: CITIZEN_SPRITES.front,
      x: 480,
      y: 170,
      facing: 'right',
      wander: { x: 450, y: 140, w: 60, h: 50 },
      speed: 20,
      targetX: 480,
      targetY: 170,
      think: 0
    }
  ]

  /* ---------------- interaction zones ---------------- */
  const zones: Zone[] = [
    {
      id: 'ministry-door',
      kind: 'door',
      x: ministryX + 40,
      y: ministryY + ministry.grid.h + 6,
      radius: 30,
      label: 'Enter the Ministry Office',
      route: '/file'
    },
    {
      id: 'archives-door',
      kind: 'door',
      x: archivesX + 31,
      y: archivesY + archives.grid.h + 6,
      radius: 28,
      label: 'Enter the Archives',
      route: '/archives'
    },
    {
      id: 'notice-board',
      kind: 'board',
      x: noticeX + 8,
      y: noticeY + 20,
      radius: 24,
      label: 'Read the Notice Board',
      route: '/notices'
    },
    {
      id: 'lost-property',
      kind: 'chest',
      x: chestX + 6,
      y: chestY + 12,
      radius: 22,
      label: 'Inspect the Lost Property',
      dialogue: {
        speaker: 'LOST PROPERTY',
        lines: [
          'A crate labelled "RECOVERED ITEMS (DO NOT ASK)".',
          'Inside: three biscuits (one half-eaten), a single sock, and a strongly worded letter about the sock.',
          'The letter is addressed to you. It has been waiting a long time.'
        ]
      }
    },
    {
      id: 'welcome-sign',
      kind: 'sign',
      x: signX + 7,
      y: signY + 18,
      radius: 22,
      label: 'Read the Village Sign',
      dialogue: {
        speaker: 'VILLAGE SIGN',
        lines: [
          'WELCOME TO NOWHERE-IN-PARTICULAR',
          'Population: one pigeon, several citizens, and one shared brain cell.',
          'Please file all inconveniences at the Ministry. Whatever it is, it counts.'
        ]
      }
    },
    {
      id: 'easter-sign',
      kind: 'sign',
      x: 38 * TILE + 7,
      y: 24 * TILE + 18,
      radius: 22,
      label: 'Read a Very Important Sign',
      dialogue: {
        speaker: 'VERY IMPORTANT SIGN',
        lines: [
          'WARNING: The pigeon in charge approves of silly problems.',
          'If you found this, you have excellent pigeon instincts.',
          'Consider filing a complaint about a missing left sock.'
        ]
      }
    },
    {
      id: 'secret-chest',
      kind: 'chest',
      x: 60 * TILE + 6,
      y: 32 * TILE + 12,
      radius: 22,
      label: 'Inspect the Mysterious Chest',
      dialogue: {
        speaker: 'MYSTERIOUS CHEST',
        lines: [
          'The chest rattles ominously with tiny pigeon noises.',
          'Inside: an envelope labelled "FOR THE NEXT CITIZEN".',
          'The envelope contains nothing at all. This is, somehow, cruelly perfect.'
        ]
      }
    },
    {
      id: 'minister-npc',
      kind: 'npc',
      x: 380,
      y: 176,
      radius: 26,
      label: 'Talk to Sir Pigeon III',
      dialogue: {
        speaker: 'SIR PIGEON III',
        portrait: SIR_PIGEON_SPRITE,
        lines: [
          'Ah. A citizen. How inconvenient. Do come closer — no, closer than that. Perfect. Too close.',
          'I am Sir Pigeon III, Supreme Deputy Assistant Minister of Unnecessary Paperwork. I hold nine honorary degrees, all in Administration, none verified.',
          'You look like someone with a small, deeply personal problem. I intend to take it far too seriously.'
        ],
        actions: [
          { label: 'FILE A COMPLAINT', route: '/file' },
          { label: 'BROWSE THE ARCHIVES', route: '/archives' }
        ]
      }
    },
    {
      id: 'clerk-npc',
      kind: 'npc',
      x: 176,
      y: 208,
      radius: 24,
      label: 'Talk to the Filing Clerk',
      dialogue: {
        speaker: 'FILING CLERK',
        portrait: CLERK_SPRITE,
        lines: [
          'You will need Form 44-B. In triplicate. Emotionally.',
          'Form 44-B requires Form 44-A, which has been discontinued. Ask at the far window. It is closed.',
          'Enjoy your visit. That was not optional.'
        ]
      }
    },
    {
      id: 'guard-npc',
      kind: 'npc',
      x: 480,
      y: 138,
      radius: 24,
      label: 'Talk to the Ministry Guard',
      dialogue: {
        speaker: 'MINISTRY GUARD',
        portrait: GUARD_SPRITE,
        lines: [
          'Halt. State your inconvenience.',
          '...Trivial? Excellent. Straight through. The serious problems are turned away at the door.'
        ]
      }
    },
    {
      id: 'citizen-npc',
      kind: 'npc',
      x: 448,
      y: 234,
      radius: 24,
      label: 'Talk to a Fellow Citizen',
      dialogue: {
        speaker: 'FELLOW CITIZEN',
        portrait: CITIZEN_SPRITES.front,
        lines: [
          'I filed a complaint about my socks vanishing in the wash. They opened a national inquiry.',
          'I have been here eleven weeks. I have learned things about the machine. Terrible things.'
        ]
      }
    }
  ]

  const boundaries: Rect[] = [
    { x: 0, y: 0, w: WORLD_W, h: 10 },
    { x: 0, y: WORLD_H - 10, w: WORLD_W, h: 10 },
    { x: 0, y: 0, w: 10, h: WORLD_H },
    { x: WORLD_W - 10, y: 0, w: 10, h: WORLD_H }
  ]

  const locationAt = (x: number, y: number): string => {
    const inPlaza = x >= 22 * TILE && x < 32 * TILE && y >= 7 * TILE && y < 11 * TILE
    if (inPlaza) return 'Village Square'
    if (x >= ministryX - 24 && x <= ministryX + ministry.grid.w + 24 && y >= ministryY && y <= ministryY + ministry.grid.h + 46) {
      return 'Ministry Forecourt'
    }
    if (x >= archivesX - 24 && x <= archivesX + archives.grid.w + 24 && y >= archivesY && y <= archivesY + archives.grid.h + 46) {
      return 'The Archive Steps'
    }
    if (x >= 32 * TILE && x <= 42 * TILE && y >= 18 * TILE && y <= 26 * TILE) return 'Duck Pond'
    if (x >= 20 * TILE && x <= 36 * TILE && y >= 4 * TILE && y <= 14 * TILE) return 'Town Square'
    if (y >= 13 * TILE && y < 15 * TILE) return 'Main Street'
    return 'Grasslands of Nowhere'
  }

  return {
    ground,
    objects,
    zones,
    npcs,
    spawn: { x: 424, y: 158 },
    solidTiles,
    boundaries,
    locationAt
  }
}

/* ------------------------------------------------------------------ */
/* collision                                                           */
/* ------------------------------------------------------------------ */
function overlaps(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
}

/**
 * True when the given world-pixel box hits a solid tile, object, boundary, or extra rect
 * (used for NPC bodies, which move every frame).
 */
export function blocked(village: Village, box: Rect, extra: Rect[] = []): boolean {
  const { solidTiles } = village
  const tx0 = Math.max(0, Math.floor(box.x / TILE))
  const tx1 = Math.min(MAP_W - 1, Math.floor((box.x + box.w - 1) / TILE))
  const ty0 = Math.max(0, Math.floor(box.y / TILE))
  const ty1 = Math.min(MAP_H - 1, Math.floor((box.y + box.h - 1) / TILE))
  for (let ty = ty0; ty <= ty1; ty += 1) {
    for (let tx = tx0; tx <= tx1; tx += 1) {
      if (solidTiles[ty * MAP_W + tx]) return true
    }
  }
  for (const object of village.objects) {
    if (object.solid && overlaps(box, object.solid)) return true
  }
  for (const boundary of village.boundaries) {
    if (overlaps(box, boundary)) return true
  }
  for (const rect of extra) {
    if (overlaps(box, rect)) return true
  }
  return false
}

/** Solid body of an NPC (feet box). */
export function npcSolid(npc: Npc): Rect {
  return { x: Math.round(npc.x) - 6, y: Math.round(npc.y) - 4, w: 12, h: 6 }
}

/** Nearest interaction zone, if the player is standing in one. */
export function zoneNear(village: Village, x: number, y: number): Zone | null {
  let best: Zone | null = null
  let bestDistance = Infinity
  for (const zone of village.zones) {
    const dx = zone.x - x
    const dy = zone.y - y
    const distance = dx * dx + dy * dy
    if (distance <= zone.radius * zone.radius && distance < bestDistance) {
      best = zone
      bestDistance = distance
    }
  }
  return best
}

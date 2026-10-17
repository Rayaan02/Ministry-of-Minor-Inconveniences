/**
 * Canvas renderer for the village. Everything is drawn at 1:1 world pixels and
 * scaled up by an integer factor with image smoothing disabled, so the art stays crisp.
 */
import type { WorldSprite } from './art'
import type { GroundTile, Village } from './map'
import { MAP_H, MAP_W, TILE } from './map'

const COLOURS = {
  grass: '#79B86A',
  grassDark: '#6FB061',
  grassSpeck: '#5C9A52',
  path: '#F3DDA4',
  pathSpeck: '#D9A63F',
  pathLine: 'rgba(41, 54, 79, 0.14)',
  plaza: '#FFF0C9',
  plazaAlt: '#F3DDA4',
  plazaLine: 'rgba(41, 54, 79, 0.12)',
  sand: '#EFCB8A',
  sandSpeck: '#D9A63F',
  water: '#75C9E8',
  waterDeep: '#4BA8CC',
  waterLight: '#A8DDF0',
  shadow: 'rgba(26, 35, 55, 0.22)',
  outline: '#29364F',
  paper: '#FFF8E6',
  gold: '#F5C86A'
}

/** Offscreen canvases, one per sprite object (30 trees share a single canvas). */
const spriteCache = new WeakMap<WorldSprite, HTMLCanvasElement>()

export function spriteCanvas(sprite: WorldSprite): HTMLCanvasElement {
  const cached = spriteCache.get(sprite)
  if (cached) return cached

  const canvas = document.createElement('canvas')
  canvas.width = sprite.grid.w
  canvas.height = sprite.grid.h
  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.imageSmoothingEnabled = false
    for (let y = 0; y < sprite.grid.h; y += 1) {
      for (let x = 0; x < sprite.grid.w; x += 1) {
        const key = sprite.grid.get(x, y)
        if (key === '.' || key === ' ') continue
        const colour = sprite.palette[key]
        if (!colour) continue
        ctx.fillStyle = colour
        ctx.fillRect(x, y, 1, 1)
      }
    }
  }
  spriteCache.set(sprite, canvas)
  return canvas
}

function hash2(x: number, y: number): number {
  let h = Math.imul(x + 7, 374761393) + Math.imul(y + 13, 668265263)
  h = Math.imul(h ^ (h >>> 13), 1274126177)
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295
}

function tileAt(village: Village, tx: number, ty: number): GroundTile {
  if (tx < 0 || ty < 0 || tx >= MAP_W || ty >= MAP_H) return 'grass'
  return village.ground[ty][tx]
}

/** Ground layer: base tiles plus deterministic specks and animated water. */
export function drawGround(
  ctx: CanvasRenderingContext2D,
  village: Village,
  camX: number,
  camY: number,
  viewW: number,
  viewH: number,
  time: number,
  animate: boolean
): void {
  const tx0 = Math.max(0, Math.floor(camX / TILE) - 1)
  const ty0 = Math.max(0, Math.floor(camY / TILE) - 1)
  const tx1 = Math.min(MAP_W - 1, Math.ceil((camX + viewW) / TILE) + 1)
  const ty1 = Math.min(MAP_H - 1, Math.ceil((camY + viewH) / TILE) + 1)

  for (let ty = ty0; ty <= ty1; ty += 1) {
    for (let tx = tx0; tx <= tx1; tx += 1) {
      const tile = village.ground[ty][tx]
      const x = tx * TILE
      const y = ty * TILE
      const r = hash2(tx, ty)

      if (tile === 'grass' || tile === 'grassDark') {
        ctx.fillStyle = tile === 'grass' ? COLOURS.grass : COLOURS.grassDark
        ctx.fillRect(x, y, TILE, TILE)
        // A couple of blade marks, placed deterministically.
        ctx.fillStyle = COLOURS.grassSpeck
        const bx = x + 3 + Math.floor(r * 8)
        const by = y + 4 + Math.floor(hash2(ty, tx) * 8)
        ctx.fillRect(bx, by, 2, 3)
        if (r > 0.5) ctx.fillRect(x + 10, y + 9, 3, 2)
        continue
      }

      if (tile === 'path') {
        ctx.fillStyle = COLOURS.path
        ctx.fillRect(x, y, TILE, TILE)
        ctx.fillStyle = COLOURS.pathLine
        ctx.fillRect(x, y + 7, TILE, 2)
        ctx.fillRect(x + 7, y, 2, TILE)
        ctx.fillStyle = COLOURS.pathSpeck
        ctx.fillRect(x + 2 + Math.floor(r * 10), y + 2 + Math.floor(hash2(ty, tx + 1) * 10), 2, 2)
        continue
      }

      if (tile === 'plaza') {
        ctx.fillStyle = r > 0.45 ? COLOURS.plaza : COLOURS.plazaAlt
        ctx.fillRect(x, y, TILE, TILE)
        ctx.fillStyle = COLOURS.plazaLine
        ctx.fillRect(x, y + 7, TILE, 2)
        ctx.fillRect(x + 7, y, 2, TILE)
        continue
      }

      if (tile === 'sand') {
        ctx.fillStyle = COLOURS.sand
        ctx.fillRect(x, y, TILE, TILE)
        ctx.fillStyle = COLOURS.sandSpeck
        ctx.fillRect(x + 3 + Math.floor(r * 9), y + 4 + Math.floor(hash2(ty + 3, tx) * 8), 2, 2)
        continue
      }

      // water
      ctx.fillStyle = COLOURS.water
      ctx.fillRect(x, y, TILE, TILE)
      const phase = animate ? Math.floor(time * 2) % 2 : 0
      ctx.fillStyle = COLOURS.waterLight
      ctx.fillRect(x + 2, y + 3 + phase * 6, 5, 2)
      ctx.fillRect(x + 9, y + 9 - phase * 6, 5, 2)
      // Shoreline: darker where water meets land.
      ctx.fillStyle = COLOURS.waterDeep
      if (tileAt(village, tx, ty - 1) !== 'water') ctx.fillRect(x, y, TILE, 2)
      if (tileAt(village, tx, ty + 1) !== 'water') ctx.fillRect(x, y + TILE - 2, TILE, 2)
      if (tileAt(village, tx - 1, ty) !== 'water') ctx.fillRect(x, y, 2, TILE)
      if (tileAt(village, tx + 1, ty) !== 'water') ctx.fillRect(x + TILE - 2, y, 2, TILE)
    }
  }
}

/** Soft (hard-edged) contact shadow under a character. */
export function drawShadow(ctx: CanvasRenderingContext2D, centreX: number, footY: number, width: number): void {
  ctx.fillStyle = COLOURS.shadow
  const w = Math.max(6, Math.round(width))
  const x = Math.round(centreX - w / 2)
  const y = Math.round(footY - 2)
  ctx.fillRect(x + 1, y, w - 2, 1)
  ctx.fillRect(x, y + 1, w, 1)
}

export function drawSprite(ctx: CanvasRenderingContext2D, sprite: WorldSprite, x: number, y: number): void {
  ctx.drawImage(spriteCanvas(sprite), Math.round(x), Math.round(y))
}

/** Bouncing "!" bubble drawn above an interactable object. */
export function drawMarker(ctx: CanvasRenderingContext2D, centreX: number, bottomY: number, time: number, animate: boolean): void {
  const bob = animate ? Math.round(Math.sin(time * 3.2) * 1.5) : 0
  const x = Math.round(centreX - 5)
  const y = Math.round(bottomY - 16 + bob)

  ctx.fillStyle = COLOURS.outline
  ctx.fillRect(x, y, 11, 12)
  ctx.fillStyle = COLOURS.gold
  ctx.fillRect(x + 1, y + 1, 9, 10)
  ctx.fillStyle = COLOURS.outline
  ctx.fillRect(x + 4, y + 3, 2, 5)
  ctx.fillRect(x + 4, y + 9, 2, 2)
  // tail
  ctx.fillRect(x + 3, y + 12, 3, 1)
  ctx.fillRect(x + 4, y + 13, 1, 1)
}

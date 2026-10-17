/**
 * Renders sprite contact sheets to PNG so the art can be reviewed outside the browser.
 * Usage: node scripts/make-sprites.mjs
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { build } from 'esbuild'
import { Canvas, hexToRgb } from './png.mjs'

const OUT_DIR = 'sprite-previews'
const BACKGROUND = '#FFF0C9'
const BORDER = '#29364F'
const PADDING = 16
const TARGET_HEIGHT = 190

await build({
  entryPoints: ['src/world/art.ts'],
  bundle: true,
  format: 'esm',
  outfile: '.tmp/art.mjs',
  logLevel: 'silent'
})

const art = await import(pathToFileURL('.tmp/art.mjs').href)
mkdirSync(OUT_DIR, { recursive: true })

const written = []

for (const [groupName, sprites] of Object.entries(art.SPRITE_GROUPS)) {
  const maxHeight = sprites.reduce((max, sprite) => Math.max(max, sprite.rows.length), 1)
  const scale = Math.max(2, Math.floor(TARGET_HEIGHT / maxHeight))

  const cells = sprites.map((sprite) => {
    const width = sprite.rows.reduce((max, row) => Math.max(max, row.length), 0)
    return { sprite, width: width * scale, height: sprite.rows.length * scale }
  })

  const contentWidth = cells.reduce((sum, cell) => sum + cell.width, 0) + PADDING * (cells.length + 1)
  const contentHeight = Math.max(...cells.map((cell) => cell.height)) + PADDING * 2

  const canvas = new Canvas(contentWidth, contentHeight)
  canvas.fill(BACKGROUND)

  let cursorX = PADDING
  const baseline = contentHeight - PADDING
  for (const cell of cells) {
    const y = baseline - cell.height
    // frame around each sprite cell
    canvas.fillRect(cursorX - 3, y - 3, cell.width + 6, cell.height + 6, hexToRgb(BORDER))
    canvas.fillRect(cursorX - 1, y - 1, cell.width + 2, cell.height + 2, hexToRgb(BACKGROUND))
    canvas.blitSprite(cell.sprite, cursorX, y, scale)
    cursorX += cell.width + PADDING
  }

  const file = `${OUT_DIR}/sheet-${groupName}.png`
  writeFileSync(file, canvas.toPNG())
  written.push({ file, scale, sprites: sprites.map((s) => s.label) })
}

// Also export each character on its own, large, for close inspection.
const closeUps = [
  ['sir-pigeon-iii', art.SIR_PIGEON_SPRITE, 16],
  ['player-front', art.CITIZEN_SPRITES.front, 16],
  ['player-side', art.CITIZEN_SPRITES.side, 16],
  ['player-back', art.CITIZEN_SPRITES.back, 16]
]

for (const [name, sprite, scale] of closeUps) {
  const width = sprite.rows.reduce((max, row) => Math.max(max, row.length), 0)
  const canvas = new Canvas(width * scale + PADDING * 2, sprite.rows.length * scale + PADDING * 2)
  canvas.fill(BACKGROUND)
  canvas.blitSprite(sprite, PADDING, PADDING, scale)
  const file = `${OUT_DIR}/${name}.png`
  writeFileSync(file, canvas.toPNG())
  written.push({ file, scale, sprites: [sprite.label] })
}

for (const entry of written) {
  console.log(`${entry.file}  (scale x${entry.scale})  → ${entry.sprites.join(', ')}`)
}

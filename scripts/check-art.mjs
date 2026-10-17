/**
 * Structural validation of every sprite: catches ragged rows (which break silhouettes)
 * and palette keys with no colour defined (which punch holes in the art).
 * Usage: node scripts/check-art.mjs
 */
import { pathToFileURL } from 'node:url'
import { build } from 'esbuild'

await build({
  entryPoints: ['src/world/art.ts'],
  bundle: true,
  format: 'esm',
  outfile: '.tmp/art.mjs',
  logLevel: 'silent'
})

const art = await import(pathToFileURL('.tmp/art.mjs').href)

const all = []
for (const [group, sprites] of Object.entries(art.SPRITE_GROUPS)) {
  sprites.forEach((sprite) => all.push({ group, sprite }))
}
all.push({ group: 'characters', sprite: art.SIR_PIGEON_SPRITE })
Object.entries(art.CITIZEN_SPRITES).forEach(([key, sprite]) => all.push({ group: 'characters', sprite }))
Object.entries(art.BUILDING_SPRITES).forEach(([key, sprite]) => all.push({ group: 'buildings', sprite }))

let problems = 0

for (const { sprite } of all) {
  const widths = new Set(sprite.rows.map((row) => row.length))
  if (widths.size > 1) {
    problems += 1
    console.log(`RAGGED  ${sprite.label}: row widths ${[...widths].join(', ')}`)
    sprite.rows.forEach((row, index) => {
      if (row.length !== Math.max(...widths)) {
        console.log(`        row ${index} (len ${row.length}): ${row}`)
      }
    })
  }
  const unknown = new Set()
  sprite.rows.forEach((row) => {
    row.split('').forEach((ch) => {
      if (ch === '.' || ch === ' ') return
      if (!sprite.palette[ch]) unknown.add(ch)
    })
  })
  if (unknown.size > 0) {
    problems += 1
    console.log(`NOPAL   ${sprite.label}: undefined palette keys -> ${[...unknown].join(', ')}`)
  }
}

console.log(`\nChecked ${all.length} sprites. ${problems === 0 ? 'ALL CLEAN ✓' : `${problems} problem(s) found.`}`)
process.exit(problems === 0 ? 0 : 1)

/**
 * Minimal dependency-free PNG encoder + pixel canvas.
 * Used by scripts/make-sprites.mjs to export sprite previews.
 */
import { deflateSync } from 'node:zlib'

const CRC_TABLE = (() => {
  const table = new Uint32Array(256)
  for (let n = 0; n < 256; n += 1) {
    let c = n
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    table[n] = c >>> 0
  }
  return table
})()

function crc32(buffer) {
  let c = 0xffffffff
  for (let i = 0; i < buffer.length; i += 1) c = CRC_TABLE[(c ^ buffer[i]) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const length = Buffer.alloc(4)
  length.writeUInt32BE(data.length, 0)
  const typeBuffer = Buffer.from(type, 'ascii')
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 0)
  return Buffer.concat([length, typeBuffer, data, crc])
}

export function encodePNG(width, height, rgba) {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 6 // RGBA
  ihdr[10] = 0
  ihdr[11] = 0
  ihdr[12] = 0
  const stride = width * 4
  const raw = Buffer.alloc((stride + 1) * height)
  for (let y = 0; y < height; y += 1) {
    raw[y * (stride + 1)] = 0 // filter: none
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride)
  }
  return Buffer.concat([
    signature,
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0))
  ])
}

export function hexToRgb(hex) {
  let value = hex.replace('#', '')
  if (value.length === 3) value = value.split('').map((c) => c + c).join('')
  return [
    parseInt(value.slice(0, 2), 16),
    parseInt(value.slice(2, 4), 16),
    parseInt(value.slice(4, 6), 16),
    255
  ]
}

export class Canvas {
  constructor(width, height) {
    this.w = width
    this.h = height
    this.data = Buffer.alloc(width * height * 4) // transparent
  }

  fill(colour) {
    this.fillRect(0, 0, this.w, this.h, colour)
  }

  setPixel(x, y, colour) {
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return
    const [r, g, b, a] = colour
    const offset = (y * this.w + x) * 4
    const alpha = a / 255
    const dstA = this.data[offset + 3] / 255
    const outA = alpha + dstA * (1 - alpha)
    if (outA === 0) return
    this.data[offset] = Math.round((r * alpha + this.data[offset] * dstA * (1 - alpha)) / outA)
    this.data[offset + 1] = Math.round((g * alpha + this.data[offset + 1] * dstA * (1 - alpha)) / outA)
    this.data[offset + 2] = Math.round((b * alpha + this.data[offset + 2] * dstA * (1 - alpha)) / outA)
    this.data[offset + 3] = Math.round(outA * 255)
  }

  fillRect(x, y, w, h, colour) {
    const rgb = Array.isArray(colour) ? colour : hexToRgb(colour)
    for (let j = 0; j < h; j += 1) {
      for (let i = 0; i < w; i += 1) this.setPixel(x + i, y + j, rgb)
    }
  }

  /** Draw a character-grid sprite with nearest-neighbour scaling. */
  blitSprite(sprite, x, y, scale) {
    const { rows, palette } = sprite
    rows.forEach((row, sy) => {
      for (let sx = 0; sx < row.length; sx += 1) {
        const key = row[sx]
        if (key === '.' || key === ' ') continue
        const colour = palette[key]
        if (!colour) continue
        const rgb = hexToRgb(colour)
        for (let py = 0; py < scale; py += 1) {
          for (let px = 0; px < scale; px += 1) {
            this.setPixel(x + sx * scale + px, y + sy * scale + py, rgb)
          }
        }
      }
    })
  }

  toPNG() {
    return encodePNG(this.w, this.h, this.data)
  }
}

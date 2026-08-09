// scripts/canvas.js
// Produces final PNG Blobs by compositing the user photo with brand assets.

const FRAME_A_SIZE  = 1080          // square
const CARD_W        = 1080
const CARD_H        = 1350

const BUILDER_TITLES = [
  'Prompt Whisperer', 'Founding Hacker', 'Vibe Architect',
  'Zero-to-One Enjoyer', 'Full-Stack Dreamer', 'Ship It or Skip It',
  'Context Window Surfer', 'Recursive Thinker', 'Chaos Engineer',
  'Async Adventurer', 'Serial Deployer', 'Edge Case Collector',
  'Latency Whisperer', 'Rubber Duck Wrangler', 'Git Push Philosopher',
]

export function randomBuilderTitle() {
  return BUILDER_TITLES[Math.floor(Math.random() * BUILDER_TITLES.length)]
}

/**
 * Load an image from src. On error, draws a placeholder via fallbackFn.
 */
async function loadImage(src, fallbackFn) {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => {
      const c = Object.assign(document.createElement('canvas'), { width: 1080, height: 1080 })
      fallbackFn(c.getContext('2d'), c)
      const fi = new Image()
      fi.onload = () => resolve(fi)
      fi.src = c.toDataURL()
    }
    img.src = src
  })
}

/**
 * Draw user photo centered + cropped (CSS object-fit: cover behaviour).
 */
function drawCover(ctx, img, x, y, w, h) {
  const imgRatio = img.width / img.height
  const targetRatio = w / h
  let sx, sy, sw, sh
  if (imgRatio > targetRatio) {
    sh = img.height; sw = sh * targetRatio
    sx = (img.width - sw) / 2; sy = 0
  } else {
    sw = img.width; sh = sw / targetRatio
    sx = 0; sy = (img.height - sh) / 2
  }
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h)
}

/** Draw rounded rect clip path */
function roundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, r)
}

// ─── FORMAT A ─────────────────────────────────────────────────────────────────

function drawFrameAFallback(ctx, canvas) {
  canvas.width = FRAME_A_SIZE; canvas.height = FRAME_A_SIZE
  // Transparent center, yellow border
  ctx.clearRect(0, 0, FRAME_A_SIZE, FRAME_A_SIZE)
  // Border ring
  const bw = 40
  ctx.fillStyle = '#F0E040'
  // Top
  ctx.fillRect(0, 0, FRAME_A_SIZE, bw)
  // Bottom
  ctx.fillRect(0, FRAME_A_SIZE - bw - 120, FRAME_A_SIZE, bw + 120)
  // Left
  ctx.fillRect(0, bw, bw, FRAME_A_SIZE - bw * 2 - 120)
  // Right
  ctx.fillRect(FRAME_A_SIZE - bw, bw, bw, FRAME_A_SIZE - bw * 2 - 120)
  // Bottom text strip
  ctx.fillStyle = '#F0E040'
  ctx.fillRect(0, FRAME_A_SIZE - 120, FRAME_A_SIZE, 120)
  ctx.fillStyle = '#0A0A0A'
  ctx.font = '700 48px Inter, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('HH GOA 2026', FRAME_A_SIZE / 2, FRAME_A_SIZE - 55)
  ctx.font = '500 24px Inter, sans-serif'
  ctx.textAlign = 'right'
  ctx.fillText('#FrameInGoa', FRAME_A_SIZE - 24, FRAME_A_SIZE - 20)
}

/**
 * @param {ImageBitmap} userPhoto
 * @returns {Promise<Blob>}
 */
export async function compositeFrameA(userPhoto) {
  const canvas = document.createElement('canvas')
  canvas.width = FRAME_A_SIZE; canvas.height = FRAME_A_SIZE
  const ctx = canvas.getContext('2d')

  // 1. Draw user photo (cover-fit square)
  drawCover(ctx, userPhoto, 0, 0, FRAME_A_SIZE, FRAME_A_SIZE)

  // 2. Draw frame overlay on top
  const frame = await loadImage('assets/frame-a/overlay.png', drawFrameAFallback)
  ctx.drawImage(frame, 0, 0, FRAME_A_SIZE, FRAME_A_SIZE)

  return new Promise((res) => canvas.toBlob(res, 'image/png'))
}

// ─── FORMAT B ─────────────────────────────────────────────────────────────────

function drawCardBgFallback(ctx, canvas) {
  canvas.width = CARD_W; canvas.height = CARD_H
  // Forest green gradient bg
  const grad = ctx.createLinearGradient(0, 0, 0, CARD_H)
  grad.addColorStop(0, '#1C5E2A'); grad.addColorStop(1, '#174F23')
  ctx.fillStyle = grad; ctx.fillRect(0, 0, CARD_W, CARD_H)
  // Header bar
  ctx.fillStyle = '#F0E040'
  ctx.fillRect(0, 0, CARD_W, 200)
  ctx.fillStyle = '#0A0A0A'
  ctx.font = '800 56px Inter, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('HH GOA 2026', CARD_W / 2, 90)
  ctx.font = '600 32px Inter, sans-serif'
  ctx.fillText('BUILDER PASS', CARD_W / 2, 148)
  // Footer bar
  ctx.fillStyle = '#F0E040'
  ctx.fillRect(0, CARD_H - 100, CARD_W, 100)
  ctx.fillStyle = '#0A0A0A'
  ctx.font = '500 28px Inter, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('GOA · AUGUST 2026  |  #HHGoa2026', CARD_W / 2, CARD_H - 38)
}

/**
 * @param {ImageBitmap} userPhoto
 * @param {{ name: string, stack: string, builderTitle: string }} fields
 * @returns {Promise<Blob>}
 */
export async function compositeFrameB(userPhoto, fields) {
  // Ensure fonts are loaded before drawing text on canvas
  await Promise.all([
    document.fonts.load('800 64px Inter'),
    document.fonts.load('700 40px Inter'),
    document.fonts.load('500 36px Inter'),
  ])

  const canvas = document.createElement('canvas')
  canvas.width = CARD_W; canvas.height = CARD_H
  const ctx = canvas.getContext('2d')

  // 1. Background card
  const bg = await loadImage('assets/frame-b/card-bg.png', drawCardBgFallback)
  ctx.drawImage(bg, 0, 0, CARD_W, CARD_H)

  // 2. User photo — left 42% of card, vertically centered in the middle zone
  const photoX = 40, photoY = 240
  const photoW = 400, photoH = 400
  ctx.save()
  roundedRect(ctx, photoX, photoY, photoW, photoH, 24)
  ctx.clip()
  drawCover(ctx, userPhoto, photoX, photoY, photoW, photoH)
  ctx.restore()

  // 3. Text — right side
  const textX = 480
  ctx.textAlign = 'left'

  // Name
  ctx.fillStyle = '#F0E040'  // yellow
  ctx.font = '800 56px Inter, sans-serif'
  wrapText(ctx, fields.name || 'Your Name', textX, 310, 560, 68)

  // Stack / role
  ctx.fillStyle = '#FFFFFF'
  ctx.font = '500 32px Inter, sans-serif'
  wrapText(ctx, fields.stack || 'Builder', textX, 420, 560, 44)

  // Divider line
  ctx.strokeStyle = 'rgba(255,255,255,0.15)'
  ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(textX, 490); ctx.lineTo(CARD_W - 40, 490); ctx.stroke()

  // Builder title
  ctx.fillStyle = '#F0E040'
  ctx.font = 'italic 700 36px Inter, sans-serif'
  ctx.fillText('"' + (fields.builderTitle || 'Builder') + '"', textX, 545)

  return new Promise((res) => canvas.toBlob(res, 'image/png'))
}

/**
 * Simple text wrapping for canvas.
 */
function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ')
  let line = ''
  for (const word of words) {
    const test = line ? line + ' ' + word : word
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, y); y += lineHeight; line = word
    } else { line = test }
  }
  ctx.fillText(line, x, y)
}

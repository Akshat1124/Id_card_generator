// scripts/canvas.js
// Produces final PNG Blobs by compositing the user photo with brand assets.

const FRAME_A_SIZE = 1080          // square
const CARD_W = 1080
const CARD_H = 1350

const imageCache = new Map()

/**
 * Load an image from src. On error, draws a placeholder via fallbackFn.
 */
async function loadImage(src, fallbackFn) {
  if (imageCache.has(src)) return imageCache.get(src)

  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      imageCache.set(src, img)
      resolve(img)
    }
    img.onerror = () => {
      const c = Object.assign(document.createElement('canvas'), { width: 1080, height: 1080 })
      if (fallbackFn) fallbackFn(c.getContext('2d'), c)
      const fi = new Image()
      fi.onload = () => {
        imageCache.set(src, fi)
        resolve(fi)
      }
      fi.src = c.toDataURL()
    }
    img.src = src
  })
}

/**
 * Draw user photo centered + cropped (CSS object-fit: cover behaviour).
 */
function drawCover(ctx, img, x, y, w, h, zoom = 1, offsetX = 0, offsetY = 0) {
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

  const zsw = sw / zoom
  const zsh = sh / zoom
  sx += (sw - zsw) / 2
  sy += (sh - zsh) / 2

  const srcOffsetX = offsetX * (zsw / w)
  const srcOffsetY = offsetY * (zsh / h)
  
  sx -= srcOffsetX
  sy -= srcOffsetY

  ctx.drawImage(img, sx, sy, zsw, zsh, x, y, w, h)
}

/** Draw rounded rect clip path */
function roundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, r)
}

/** Draw rounded rect clip path with different radii */
function roundedRectAdvanced(ctx, x, y, w, h, tl, tr, br, bl) {
  ctx.beginPath()
  ctx.moveTo(x + tl, y)
  ctx.lineTo(x + w - tr, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + tr)
  ctx.lineTo(x + w, y + h - br)
  ctx.quadraticCurveTo(x + w, y + h, x + w - br, y + h)
  ctx.lineTo(x + bl, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - bl)
  ctx.lineTo(x, y + tl)
  ctx.quadraticCurveTo(x, y, x + tl, y)
  ctx.closePath()
}

function drawSparkle(ctx, x, y, size, color) {
  ctx.save()
  ctx.fillStyle = color
  ctx.translate(x, y)
  ctx.beginPath()
  ctx.moveTo(0, -size)
  ctx.quadraticCurveTo(0, 0, size, 0)
  ctx.quadraticCurveTo(0, 0, 0, size)
  ctx.quadraticCurveTo(0, 0, -size, 0)
  ctx.quadraticCurveTo(0, 0, 0, -size)
  ctx.closePath()
  ctx.fill()
  ctx.restore()
}

// ─── FORMAT A ─────────────────────────────────────────────────────────────────

function drawFrameAFallback(ctx, canvas) {
  canvas.width = FRAME_A_SIZE; canvas.height = FRAME_A_SIZE
  // Transparent center, yellow border
  ctx.clearRect(0, 0, FRAME_A_SIZE, FRAME_A_SIZE)
  // Border ring
  const bw = 40
  ctx.fillStyle = '#FEE101'
  // Top
  ctx.fillRect(0, 0, FRAME_A_SIZE, bw)
  // Bottom
  ctx.fillRect(0, FRAME_A_SIZE - bw - 120, FRAME_A_SIZE, bw + 120)
  // Left
  ctx.fillRect(0, bw, bw, FRAME_A_SIZE - bw * 2 - 120)
  // Right
  ctx.fillRect(FRAME_A_SIZE - bw, bw, bw, FRAME_A_SIZE - bw * 2 - 120)
  // Bottom text strip
  ctx.fillStyle = '#FEE101'
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
 * @param {object} fields
 * @returns {Promise<Blob>}
 */
export async function compositeFrameA(userPhoto, fields = {}) {
  const zoom = fields.zoom || 1
  const offsetX = fields.offsetX || 0
  const offsetY = fields.offsetY || 0

  const canvas = document.createElement('canvas')
  canvas.width = FRAME_A_SIZE; canvas.height = FRAME_A_SIZE
  const ctx = canvas.getContext('2d')

  // 1. Draw user photo (cover-fit square)
  drawCover(ctx, userPhoto, 0, 0, FRAME_A_SIZE, FRAME_A_SIZE, zoom, offsetX, offsetY)

  // 2. Draw frame overlay on top
  const frame = await loadImage('assets/frame-a/overlay.png', drawFrameAFallback)
  ctx.drawImage(frame, 0, 0, FRAME_A_SIZE, FRAME_A_SIZE)

  // 3. goa_hindi watermark — bottom-left, matching hhgoa.com usage
  const goaHindi = await loadImage('assets/brand/goa_hindi.svg', () => { })
  ctx.save()
  ctx.globalAlpha = 0.85
  ctx.drawImage(goaHindi, 40, FRAME_A_SIZE - 100, 80, 80)
  ctx.restore()

  return new Promise((res) => canvas.toBlob(res, 'image/png'))
}

// ─── FORMAT B ─────────────────────────────────────────────────────────────────

/**
 * @param {ImageBitmap} userPhoto
 * @param {{ name: string, stack: string, builderTitle: string, zoom: number, offsetX: number, offsetY: number }} fields
 * @returns {Promise<Blob>}
 */
export async function compositeFrameB(userPhoto, fields = {}) {
  const zoom = fields.zoom || 1
  const offsetX = fields.offsetX || 0
  const offsetY = fields.offsetY || 0

  // Ensure fonts are loaded before drawing text on canvas
  await Promise.all([
    document.fonts.load('800 64px Inter'),
    document.fonts.load('700 40px Inter'),
    document.fonts.load('600 32px Inter'),
    document.fonts.load('500 24px Inter'),
    document.fonts.load('800 70px "Playfair Display"'),
    document.fonts.load('700 70px Caveat'),
  ])

  const canvas = document.createElement('canvas')
  canvas.width = CARD_W; canvas.height = CARD_H
  const ctx = canvas.getContext('2d')

  // Colors
  const BG_COLOR = '#1C5E2A'
  const YELLOW = '#FEE101'
  const PINK = '#FF0080'

  // 1. Background
  ctx.fillStyle = BG_COLOR
  ctx.fillRect(0, 0, CARD_W, CARD_H)

  // 2. Background Texture
  const bgTexture = await loadImage('assets/brand/sunrise_illustration.png', () => {})
  if (bgTexture) {
    ctx.save()
    ctx.globalAlpha = 0.08
    ctx.globalCompositeOperation = 'lighten'
    ctx.drawImage(bgTexture, 0, 0, CARD_W, CARD_H)
    ctx.restore()
  }

  // 3. Header Assets
  // Top-left logo (247pm)
  const logo247 = await loadImage('assets/brand/logo_247pm.svg', () => {})
  if (logo247) {
    ctx.save()
    ctx.translate(140, 140)
    ctx.rotate(-15 * Math.PI / 180)
    ctx.drawImage(logo247, -70, -70, 140, 140)
    ctx.restore()
  }

  // Top-center Hacker House Wordmark
  const wordmark = await loadImage('assets/brand/hacker_house_wordmark_lg.svg', () => {})
  if (wordmark) {
    const wmH = 120
    const wmW = wordmark.width > 0 ? (wordmark.width / wordmark.height) * wmH : 200
    ctx.drawImage(wordmark, (CARD_W - wmW) / 2, 40, wmW, wmH)
  }

  // "2026"
  ctx.fillStyle = YELLOW
  ctx.font = '800 32px Inter, sans-serif'
  ctx.textAlign = 'center'
  ctx.letterSpacing = '8px'
  ctx.fillText('2026', CARD_W / 2, 210)
  ctx.letterSpacing = '0px'

  // Lines beside 2026
  ctx.strokeStyle = YELLOW
  ctx.lineWidth = 2
  ctx.beginPath(); ctx.moveTo(CARD_W / 2 - 130, 200); ctx.lineTo(CARD_W / 2 - 50, 200); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(CARD_W / 2 + 50, 200); ctx.lineTo(CARD_W / 2 + 130, 200); ctx.stroke();

  // Goa Hindi
  const goaHindi = await loadImage('assets/brand/goa_hindi.svg', () => {})
  if (goaHindi) {
    // Small over wordmark
    ctx.save()
    ctx.translate(CARD_W / 2, 110)
    ctx.rotate(-10 * Math.PI / 180)
    ctx.drawImage(goaHindi, -40, -40, 80, 80)
    ctx.restore()
    // Large top-right
    ctx.save()
    ctx.translate(CARD_W - 140, 120)
    ctx.rotate(15 * Math.PI / 180)
    ctx.drawImage(goaHindi, -80, -80, 160, 160)
    ctx.restore()
  }

  // 4. Photo Container (Arched)
  const photoW = 460, photoH = 460
  const photoX = (CARD_W - photoW) / 2, photoY = 280
  const radiusTop = 200, radiusBottom = 40

  // Draw Photo
  ctx.save()
  roundedRectAdvanced(ctx, photoX, photoY, photoW, photoH, radiusTop, radiusTop, radiusBottom, radiusBottom)
  ctx.clip()
  if (userPhoto) {
    drawCover(ctx, userPhoto, photoX, photoY, photoW, photoH, zoom, offsetX, offsetY)
  }
  ctx.restore()

  // Draw Neon Glow Stroke
  ctx.save()
  roundedRectAdvanced(ctx, photoX, photoY, photoW, photoH, radiusTop, radiusTop, radiusBottom, radiusBottom)
  ctx.strokeStyle = YELLOW
  ctx.lineWidth = 8
  ctx.shadowColor = YELLOW
  ctx.shadowBlur = 30
  ctx.stroke()
  ctx.shadowBlur = 10
  ctx.stroke() // double stroke for intense center
  ctx.restore()



  // 6. Typography
  let cursorY = 890
  
  // Name
  ctx.fillStyle = '#FFFFFF'
  ctx.font = '800 75px "Playfair Display", serif'
  ctx.textAlign = 'center'
  ctx.fillText(fields.name || 'Your Name', CARD_W / 2, cursorY)

  // Stack/Role
  cursorY += 60
  ctx.font = '700 24px Inter, sans-serif'
  ctx.letterSpacing = '4px'
  const stackText = fields.stack || 'FULL-STACK  •  BUILDER  •  FOUNDER'
  const stackParts = stackText.split(/·|•/g).map(s => s.trim())
  
  ctx.textAlign = 'left'
  let totalW = 0
  const metrics = []
  ctx.font = '700 24px Inter, sans-serif'
  stackParts.forEach((part, i) => {
    const w = ctx.measureText(part).width
    metrics.push({text: part, w})
    totalW += w
    if (i < stackParts.length - 1) totalW += 40
  })
  
  let currentX = (CARD_W - totalW) / 2
  stackParts.forEach((part, i) => {
    ctx.fillStyle = '#FFFFFF'
    ctx.fillText(part, currentX, cursorY)
    currentX += metrics[i].w
    if (i < stackParts.length - 1) {
      ctx.fillStyle = YELLOW
      ctx.beginPath()
      ctx.arc(currentX + 20, cursorY - 8, 5, 0, Math.PI * 2)
      ctx.fill()
      currentX += 40
    }
  })
  ctx.letterSpacing = '0px'

  // Divider
  cursorY += 50
  const border = await loadImage('assets/brand/decorative_border.svg', () => {})
  if (border) {
    ctx.drawImage(border, (CARD_W - 800) / 2, cursorY, 800, 20)
  }

  // Team Name (formerly Builder Title)
  cursorY += 90
  ctx.fillStyle = YELLOW
  ctx.textAlign = 'center'
  ctx.font = '700 70px Caveat, cursive'
  const titleStr = fields.teamName || 'Your Team Name'
  ctx.fillText(titleStr, CARD_W / 2, cursorY)

  // Lightning bolts around title
  const titleW = ctx.measureText(titleStr).width
  ctx.font = '40px Inter'
  ctx.fillText('⚡', (CARD_W / 2) - (titleW / 2) - 40, cursorY - 10)
  ctx.fillText('⚡', (CARD_W / 2) + (titleW / 2) + 40, cursorY - 10)

  // Pink Swoosh under title
  ctx.strokeStyle = PINK
  ctx.lineWidth = 6
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo((CARD_W / 2) - 150, cursorY + 20)
  ctx.quadraticCurveTo(CARD_W / 2, cursorY + 40, (CARD_W / 2) + 150, cursorY + 10)
  ctx.stroke()

  // 7. Footer

  // Footer Text
  ctx.font = '700 20px Inter, sans-serif'
  ctx.letterSpacing = '2px'
  
  const ftextY = CARD_H - 60
  ctx.textAlign = 'center'
  
  const goaW = ctx.measureText('GOA').width
  const augW = ctx.measureText('AUGUST 2026').width
  const pipeW = ctx.measureText('||').width
  const hashW = ctx.measureText('#HHGOA2026').width
  
  const totalFooterW = goaW + 30 + augW + 40 + pipeW + 40 + hashW
  let fX = (CARD_W - totalFooterW) / 2

  ctx.textAlign = 'left'
  ctx.fillStyle = '#FFFFFF'
  ctx.fillText('GOA', fX, ftextY); fX += goaW + 15
  ctx.fillStyle = YELLOW
  ctx.beginPath(); ctx.arc(fX, ftextY - 6, 4, 0, Math.PI*2); ctx.fill(); fX += 15
  ctx.fillStyle = '#FFFFFF'
  ctx.fillText('AUGUST 2026', fX, ftextY); fX += augW + 40
  ctx.fillText('||', fX, ftextY); fX += pipeW + 40
  ctx.fillStyle = PINK
  ctx.fillText('#HHGOA2026', fX, ftextY)
  ctx.letterSpacing = '0px'

  // Corner Sparkles
  drawSparkle(ctx, 40, 40, 16, PINK) // top-left
  drawSparkle(ctx, CARD_W - 40, CARD_H - 40, 16, PINK) // bottom-right
  drawSparkle(ctx, 40, CARD_H - 40, 16, PINK) // bottom-left
  // Add some inner sparkles
  drawSparkle(ctx, photoX - 30, photoY + 150, 12, PINK)
  drawSparkle(ctx, photoX + photoW + 30, photoY + 150, 12, PINK)

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

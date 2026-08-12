// scripts/share.js

// ─── TWEET COPY ───────────────────────────────────────────────────────────────
// Replace GENERATOR_URL with the live Vercel URL after first deploy.
const GENERATOR_URL = 'https://hh-goa-2026-frame-tau.vercel.app'

// Format A — PFP frame
const TWEET_TEXT_A = [
  `Here's my HH Goa 2026 Builder ID Card 🪪✨`,
  ``,
  `HH Goa — 4 days, 247 builders, one beach resort in Goa. AI × Crypto. Oct 28–31.`,
  ``,
  `Make your own ID card → ${GENERATOR_URL}`,
  ``,
  `#FrameInGoa #HHGoa2026 #BuildInPublic`,
].join('\n')

// Format B — ID card
const TWEET_TEXT_B = [
  `Here's my HH Goa 2026 Builder ID Card 🪪✨`,
  ``,
  `HH Goa — 4 days, 247 builders, one beach resort in Goa. AI × Crypto. Oct 28–31.`,
  ``,
  `Make your own ID card → ${GENERATOR_URL}`,
  ``,
  `#FrameInGoa #HHGoa2026 #BuildInPublic`,
].join('\n')
const DOWNLOAD_FILENAME_A = 'HH-Goa-2026-frame.png'
const DOWNLOAD_FILENAME_B = 'HH-Goa-2026-id-card.png'

/**
 * Trigger a PNG download.
 * @param {Blob} blob
 * @param {string} filename
 */
export function downloadImage(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = Object.assign(document.createElement('a'), {
    href: url,
    download: filename,
  })
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 10_000)
}

/**
 * Copy a PNG Blob to the system clipboard so the user can paste it into the
 * X composer. Best-effort — returns false if the Clipboard API is unavailable.
 * @param {Blob} blob
 * @returns {Promise<boolean>}
 */
export async function copyImageToClipboard(blob) {
  try {
    if (!navigator.clipboard || typeof ClipboardItem === 'undefined') return false
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
    return true
  } catch (e) {
    console.warn('Clipboard image copy failed', e)
    return false
  }
}

/**
 * Share to X.
 *
 * Primary path: Web Share API with the PNG file attached. On iOS/Android the X
 * app opens a composer with the image + caption ready to post. On Windows/Mac
 * the native OS share sheet opens (works when the X app is a share target).
 *
 * Fallback: Twitter Intent URL. The Intent API can ONLY pre-fill text — it can
 * never auto-attach a local image. So we also copy the PNG to the clipboard so
 * the user can paste it into the tweet.
 *
 * @param {Blob} blob
 * @param {'a'|'b'} format
 * @returns {Promise<'shared'|'cancelled'|'intent'>}
 */
export async function shareToX(blob, format) {
  const filename = format === 'a' ? DOWNLOAD_FILENAME_A : DOWNLOAD_FILENAME_B
  const tweetText = format === 'a' ? TWEET_TEXT_A : TWEET_TEXT_B
  const file = new File([blob], filename, { type: 'image/png' })

  // Primary: native share with the image attached — try on mobile platforms.
  // We skip this on desktop because the OS share sheet interrupts the flow,
  // and we prefer going straight to the Twitter intent.
  const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)
  if (isMobile && navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file], text: tweetText, title: 'HH Goa 2026' })
      return 'shared'
    } catch (err) {
      if (err.name === 'AbortError') return 'cancelled'   // user dismissed the sheet
      console.warn('Share with image failed, falling back', err)
    }
  }

  // Fallback: copy the image to the clipboard so the X composer can be made
  // "ready to post" with a single paste.
  await copyImageToClipboard(blob)

  const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`
  window.open(url, '_blank', 'noopener')
  return 'intent'
}

export { DOWNLOAD_FILENAME_A, DOWNLOAD_FILENAME_B }

// scripts/upload.js
// Handles file selection, validation, HEIC conversion, and ImageBitmap creation.

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/heic', 'image/heif']
const MAX_SIZE_BYTES = 20 * 1024 * 1024  // 20 MB

/**
 * Validate a File object. Returns null if valid, or an error message string.
 * @param {File} file
 * @returns {string|null}
 */
export function validateFile(file) {
  const isHeic = file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif')
  const typeOk = ACCEPTED_TYPES.includes(file.type) || isHeic
  if (!typeOk) return 'Unsupported file type. Please use JPG, PNG, or HEIC.'
  if (file.size > MAX_SIZE_BYTES) return 'File is too large. Maximum size is 20 MB.'
  return null
}

/**
 * Convert a File to an ImageBitmap, handling HEIC conversion via heic2any.
 * @param {File} file
 * @returns {Promise<ImageBitmap>}
 */
export async function fileToImageBitmap(file) {
  let blob = file
  const isHeic = file.type === 'image/heic' || file.type === 'image/heif'
                 || file.name.toLowerCase().endsWith('.heic')
                 || file.name.toLowerCase().endsWith('.heif')

  if (isHeic) {
    // ADR-010: guard against CDN load failure
    if (typeof heic2any === 'undefined') {
      throw new Error(
        'HEIC conversion library failed to load. ' +
        'Please convert your photo to JPG on your device and try again.'
      )
    }
    blob = await heic2any({ blob: file, toType: 'image/png', quality: 0.92 })
    if (Array.isArray(blob)) blob = blob[0]
  }

  return createImageBitmap(blob)
}

// scripts/ui.js
// DOM helpers, step navigation, toasts.

/**
 * Show a step by ID, hide all others.
 * @param {'step-upload'|'step-config'|'step-output'} stepId
 */
export function showStep(stepId) {
  document.querySelectorAll('.step').forEach((el) => {
    const isTarget = el.id === stepId
    el.hidden = !isTarget
    el.classList.toggle('step--active', isTarget)
  })
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

/**
 * Show / hide the loading overlay.
 */
export function setLoading(visible) {
  document.getElementById('loading-overlay').hidden = !visible
}

/**
 * Show a toast notification that auto-dismisses.
 * @param {string} message
 * @param {'success'|'error'|'info'} type
 */
export function showToast(message, type = 'info') {
  const existing = document.querySelector('.toast')
  if (existing) existing.remove()

  const toast = document.createElement('div')
  toast.className = `toast toast--${type}`
  toast.textContent = message
  toast.setAttribute('role', 'status')
  document.body.appendChild(toast)

  requestAnimationFrame(() => toast.classList.add('toast--visible'))
  setTimeout(() => {
    toast.classList.remove('toast--visible')
    setTimeout(() => toast.remove(), 300)
  }, 3000)
}

/** Show an inline error under the upload zone */
export function showUploadError(message) {
  const el = document.getElementById('upload-error')
  el.textContent = message
  el.hidden = false
}
export function clearUploadError() {
  const el = document.getElementById('upload-error')
  el.textContent = ''
  el.hidden = true
}

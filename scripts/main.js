// scripts/main.js
// App bootstrap. Wires all modules together.

import { validateFile, fileToImageBitmap } from './upload.js'
import { compositeFrameA, compositeFrameB, randomBuilderTitle } from './canvas.js'
import { downloadImage, shareToX, DOWNLOAD_FILENAME_A, DOWNLOAD_FILENAME_B } from './share.js'
import { showStep, setLoading, showToast, showUploadError, clearUploadError } from './ui.js'

// ─── STATE ────────────────────────────────────────────────────────────────────
let currentImageBitmap = null
let currentBlob = null
let currentFormat = 'a'  // 'a' | 'b'
let currentBuilderTitle = randomBuilderTitle()

// ─── DOM REFS ─────────────────────────────────────────────────────────────────
const uploadZone       = document.getElementById('upload-zone')
const fileInput        = document.getElementById('file-input')
const photoPreview     = document.getElementById('photo-preview')
const btnChangePhoto   = document.getElementById('btn-change-photo')
const btnFormatA       = document.getElementById('btn-format-a')
const btnFormatB       = document.getElementById('btn-format-b')
const fieldsB          = document.getElementById('fields-b')
const inputName        = document.getElementById('input-name')
const inputStack       = document.getElementById('input-stack')
const builderTitleDisp = document.getElementById('builder-title-display')
const btnReroll        = document.getElementById('btn-reroll')
const btnGenerate      = document.getElementById('btn-generate')
const outputPreview    = document.getElementById('output-preview')
const btnDownload      = document.getElementById('btn-download')
const btnShareX        = document.getElementById('btn-share-x')
const btnStartOver     = document.getElementById('btn-start-over')

// ─── UPLOAD HANDLING ──────────────────────────────────────────────────────────
async function handleFile(file) {
  clearUploadError()
  const err = validateFile(file)
  if (err) { showUploadError(err); return }

  setLoading(true)
  try {
    currentImageBitmap = await fileToImageBitmap(file)  // throws if heic2any missing

    // ADR-009: use regular canvas (not OffscreenCanvas) for Safari compatibility
    const previewCanvas = document.createElement('canvas')
    previewCanvas.width = currentImageBitmap.width
    previewCanvas.height = currentImageBitmap.height
    previewCanvas.getContext('2d').drawImage(currentImageBitmap, 0, 0)
    const previewObjectURL = await new Promise((resolve) => {
      previewCanvas.toBlob((blob) => resolve(URL.createObjectURL(blob)), 'image/jpeg', 0.8)
    })
    photoPreview.src = previewObjectURL
    showStep('step-config')
  } catch (e) {
    // Show the specific error message if it came from our guards, otherwise generic
    const msg = e.message && e.message.includes('HEIC')
      ? e.message
      : 'Could not process your photo. Please try a different file.'
    showUploadError(msg)
    console.error(e)
  } finally {
    setLoading(false)
  }
}

uploadZone.addEventListener('click', () => fileInput.click())
uploadZone.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') fileInput.click() })

fileInput.addEventListener('change', (e) => {
  if (e.target.files[0]) handleFile(e.target.files[0])
})

// Drag and drop
uploadZone.addEventListener('dragover', (e) => { e.preventDefault(); uploadZone.classList.add('upload-zone--drag-over') })
uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('upload-zone--drag-over'))
uploadZone.addEventListener('drop', (e) => {
  e.preventDefault()
  uploadZone.classList.remove('upload-zone--drag-over')
  if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0])
})

// ─── FORMAT TOGGLE ────────────────────────────────────────────────────────────
function setFormat(fmt) {
  currentFormat = fmt
  btnFormatA.classList.toggle('format-toggle__btn--active', fmt === 'a')
  btnFormatB.classList.toggle('format-toggle__btn--active', fmt === 'b')
  fieldsB.hidden = fmt !== 'b'
}

btnFormatA.addEventListener('click', () => setFormat('a'))
btnFormatB.addEventListener('click', () => setFormat('b'))

// ─── BUILDER TITLE RE-ROLL ────────────────────────────────────────────────────
btnReroll.addEventListener('click', () => {
  currentBuilderTitle = randomBuilderTitle()
  builderTitleDisp.textContent = currentBuilderTitle
})

// ─── GENERATE ─────────────────────────────────────────────────────────────────
btnGenerate.addEventListener('click', async () => {
  if (!currentImageBitmap) return
  setLoading(true)
  try {
    if (currentFormat === 'a') {
      currentBlob = await compositeFrameA(currentImageBitmap)
    } else {
      currentBlob = await compositeFrameB(currentImageBitmap, {
        name: inputName.value.trim(),
        stack: inputStack.value.trim(),
        builderTitle: currentBuilderTitle,
      })
    }
    outputPreview.src = URL.createObjectURL(currentBlob)
    showStep('step-output')
  } catch (e) {
    showToast('Generation failed. Please try again.', 'error')
    console.error(e)
  } finally {
    setLoading(false)
  }
})

// ─── DOWNLOAD ─────────────────────────────────────────────────────────────────
btnDownload.addEventListener('click', () => {
  if (!currentBlob) return
  const filename = currentFormat === 'a' ? DOWNLOAD_FILENAME_A : DOWNLOAD_FILENAME_B
  downloadImage(currentBlob, filename)
  showToast('Downloading your graphic! 🎉', 'success')
})

// ─── SHARE TO X ───────────────────────────────────────────────────────────────
btnShareX.addEventListener('click', async () => {
  if (!currentBlob) return
  try {
    const result = await shareToX(currentBlob, currentFormat)
    if (result === 'shared') {
      showToast('Composer opened with your graphic ready to post! 🚀', 'success')
    } else if (result === 'intent') {
      showToast('Image copied to clipboard — paste it in the tweet, then hit Post.', 'info')
    }
  } catch (e) {
    showToast('Could not share. Try downloading and posting manually.', 'error')
  }
})

// ─── NAVIGATION ───────────────────────────────────────────────────────────────
btnChangePhoto.addEventListener('click', () => {
  fileInput.value = ''
  showStep('step-upload')
})

btnStartOver.addEventListener('click', () => {
  currentImageBitmap = null
  currentBlob = null
  currentFormat = 'a'
  fileInput.value = ''
  inputName.value = ''
  inputStack.value = ''
  currentBuilderTitle = randomBuilderTitle()
  builderTitleDisp.textContent = currentBuilderTitle
  setFormat('a')
  showStep('step-upload')
})

// ─── INIT ─────────────────────────────────────────────────────────────────────
showStep('step-upload')
builderTitleDisp.textContent = currentBuilderTitle

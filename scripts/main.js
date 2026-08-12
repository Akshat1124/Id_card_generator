// scripts/main.js
// App bootstrap. Wires all modules together.

import { validateFile, fileToImageBitmap } from './upload.js'
import { compositeFrameA, compositeFrameB } from './canvas.js'
import { downloadImage, shareToX, DOWNLOAD_FILENAME_A, DOWNLOAD_FILENAME_B } from './share.js'
import { showStep, setLoading, showToast, showUploadError, clearUploadError } from './ui.js'

// ─── STATE ────────────────────────────────────────────────────────────────────
let currentImageBitmap = null
let currentBlob = null
let currentFormat = 'b'  // 'a' | 'b'

let previewDebounceTimeout = null
async function updateLivePreview() {
  if (!currentImageBitmap) return
  try {
    let blob
    const fields = {
      name: inputName.value.trim(),
      stack: inputStack.value.trim(),
      teamName: inputTeam.value.trim() || 'Your Team Name',
      zoom: parseFloat(sliderZoom.value) / 100,
      offsetX: parseFloat(sliderOffsetX.value),
      offsetY: parseFloat(sliderOffsetY.value),
    }

    if (currentFormat === 'a') {
      blob = await compositeFrameA(currentImageBitmap, fields)
    } else {
      blob = await compositeFrameB(currentImageBitmap, fields)
    }
    const oldUrl = photoPreview.src
    photoPreview.src = URL.createObjectURL(blob)
    if (oldUrl.startsWith('blob:')) URL.revokeObjectURL(oldUrl)
  } catch (e) {
    console.error('Live preview error:', e)
  }
}

function debouncedUpdateLivePreview() {
  clearTimeout(previewDebounceTimeout)
  previewDebounceTimeout = setTimeout(updateLivePreview, 150)
}

// ─── DOM REFS ─────────────────────────────────────────────────────────────────
const uploadZone = document.getElementById('upload-zone')
const fileInput = document.getElementById('file-input')
const photoPreview = document.getElementById('photo-preview')
const btnChangePhoto = document.getElementById('btn-change-photo')
const btnFormatA = document.getElementById('btn-format-a')
const btnFormatB = document.getElementById('btn-format-b')
const fieldsB = document.getElementById('fields-b')
const inputName = document.getElementById('input-name')
const inputStack = document.getElementById('input-stack')
const inputTeam = document.getElementById('input-team')
const sliderZoom = document.getElementById('slider-zoom')
const valZoom = document.getElementById('val-zoom')
const sliderOffsetX = document.getElementById('slider-offset-x')
const valOffsetX = document.getElementById('val-offset-x')
const sliderOffsetY = document.getElementById('slider-offset-y')
const valOffsetY = document.getElementById('val-offset-y')
const btnResetPhoto = document.getElementById('btn-reset-photo')
const btnGenerate = document.getElementById('btn-generate')
const outputPreview = document.getElementById('output-preview')
const btnDownload = document.getElementById('btn-download')
const btnShareX = document.getElementById('btn-share-x')
const btnStartOver = document.getElementById('btn-start-over')

// ─── UPLOAD HANDLING ──────────────────────────────────────────────────────────
async function handleFile(file) {
  clearUploadError()
  const err = validateFile(file)
  if (err) { showUploadError(err); return }

  setLoading(true)
  try {
    currentImageBitmap = await fileToImageBitmap(file)  // throws if heic2any missing
    await updateLivePreview()
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
  debouncedUpdateLivePreview()
}

btnFormatA.addEventListener('click', () => setFormat('a'))
btnFormatB.addEventListener('click', () => setFormat('b'))

inputName.addEventListener('input', debouncedUpdateLivePreview)
inputStack.addEventListener('input', debouncedUpdateLivePreview)
inputTeam.addEventListener('input', debouncedUpdateLivePreview)

// ─── PHOTO CONTROLS ───────────────────────────────────────────────────────────
function updateSliderBackground(slider) {
  const min = parseFloat(slider.min) || 0
  const max = parseFloat(slider.max) || 100
  const val = parseFloat(slider.value) || 0
  const percentage = ((val - min) / (max - min)) * 100
  slider.style.setProperty('--progress', `${percentage}%`)
}

function handleSliderInput(slider, labelEl, unit) {
  slider.addEventListener('input', () => {
    labelEl.textContent = `${slider.value}${unit}`
    updateSliderBackground(slider)
    debouncedUpdateLivePreview()
  })
  updateSliderBackground(slider) // Init
}

handleSliderInput(sliderZoom, valZoom, '%')
handleSliderInput(sliderOffsetX, valOffsetX, 'px')
handleSliderInput(sliderOffsetY, valOffsetY, 'px')

btnResetPhoto.addEventListener('click', () => {
  sliderZoom.value = 100; valZoom.textContent = '100%'
  sliderOffsetX.value = 0; valOffsetX.textContent = '0px'
  sliderOffsetY.value = 0; valOffsetY.textContent = '0px'
  updateSliderBackground(sliderZoom)
  updateSliderBackground(sliderOffsetX)
  updateSliderBackground(sliderOffsetY)
  debouncedUpdateLivePreview()
})

// ─── GENERATE ─────────────────────────────────────────────────────────────────
btnGenerate.addEventListener('click', async () => {
  if (!currentImageBitmap) return
  setLoading(true)
  try {
    const fields = {
      name: inputName.value.trim(),
      stack: inputStack.value.trim(),
      teamName: inputTeam.value.trim() || 'Your Team Name',
      zoom: parseFloat(sliderZoom.value) / 100,
      offsetX: parseFloat(sliderOffsetX.value),
      offsetY: parseFloat(sliderOffsetY.value),
    }

    if (currentFormat === 'a') {
      currentBlob = await compositeFrameA(currentImageBitmap, fields)
    } else {
      currentBlob = await compositeFrameB(currentImageBitmap, fields)
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
  setFormat('a')
  showStep('step-upload')
})

// ─── INIT ─────────────────────────────────────────────────────────────────────
showStep('step-upload')

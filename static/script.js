// Element References
const loader = document.getElementById("loader");
const dropZone = document.getElementById("drop-zone");
const fileInput = document.getElementById("file-input");
const filesInput = document.getElementById("files-input");
const btnConvert = document.getElementById("btn-convert");
const targetFormatSelect = document.getElementById("target-format");
const fileLabel = document.getElementById("file-label");
const mergeOutputName = document.getElementById("merge-output-name");
const splitPages = document.getElementById("split-pages");
const selectedOperation = document.getElementById("selected-operation");
const selectedOperationText = document.getElementById("selected-operation-text");
const operationCards = document.querySelectorAll('.operation-card');

// Current selected operation (default to 'convert')
let currentOperation = 'convert';

// --- Operation type handling ---
function selectOperation(operation) {
  // Update current operation
  currentOperation = operation;

  // Update visual selection
  operationCards.forEach(card => {
    if (card.dataset.operation === operation) {
      card.classList.add('selected', 'border-indigo-500', 'bg-indigo-50');
      card.classList.remove('border-slate-200');
    } else {
      card.classList.remove('selected', 'border-indigo-500', 'bg-indigo-50');
      card.classList.add('border-slate-200');
    }
  });

  // Update selected operation display
  updateSelectedOperationDisplay(operation);

  // Hide all operation options
  document.querySelectorAll('.operation-option').forEach(el => el.classList.add('hidden'));

  // Show relevant option
  const optionEl = document.getElementById(`${operation}-options`);
  if (optionEl) {
    optionEl.classList.remove('hidden');
  }

  // Update file input accept attribute and label
  updateFileInput(operation);

  // Update button text
  updateButtonText(operation);

  // Reset file selection
  resetFileSelection();
}

function updateSelectedOperationDisplay(operation) {
  const operationNames = {
    'convert': 'Chuyển đổi định dạng',
    'compress': 'Nén PDF',
    'merge': 'Gộp PDF',
    'split': 'Tách PDF',
    'image-to-pdf': 'Hình ảnh sang PDF',
    'ocr': 'Trích xuất văn bản (OCR)'
  };

  selectedOperationText.textContent = operationNames[operation] || operation;
  selectedOperation.classList.remove('hidden');
}

function updateFileInput(operation) {
  let accept = "";
  let label = "";

  switch (operation) {
    case 'convert':
      accept = ".pdf,.docx";
      label = "Kéo thả file PDF/DOCX vào đây hoặc click để chọn";
      break;
    case 'compress':
      accept = ".pdf";
      label = "Kéo thả file PDF vào đây hoặc click để chọn";
      break;
    case 'merge':
      accept = ".pdf";
      label = "Kéo thả nhiều file PDF vào đây hoặc click để chọn";
      break;
    case 'split':
      accept = ".pdf";
      label = "Kéo thả file PDF vào đây hoặc click để chọn";
      break;
    case 'image-to-pdf':
      accept = ".jpg,.jpeg,.png";
      label = "Kéo thả file hình ảnh vào đây hoặc click để chọn";
      break;
    case 'ocr':
      accept = ".pdf,.jpg,.jpeg,.png";
      label = "Kéo thả file PDF hoặc hình ảnh vào đây hoặc click để chọn";
      break;
  }

  fileInput.accept = accept;
  filesInput.accept = accept;
  fileLabel.innerText = label;
}

function updateButtonText(operation) {
  let text = "Bắt đầu xử lý";

  switch (operation) {
    case 'convert':
      text = "Bắt đầu chuyển đổi";
      break;
    case 'compress':
      text = "Bắt đầu nén";
      break;
    case 'merge':
      text = "Bắt đầu gộp";
      break;
    case 'split':
      text = "Bắt đầu tách";
      break;
    case 'image-to-pdf':
      text = "Chuyển đổi";
      break;
    case 'ocr':
      text = "Trích xuất văn bản";
      break;
  }

  btnConvert.innerText = text;
}

function resetFileSelection() {
  fileInput.value = "";
  filesInput.value = "";
  fileLabel.innerText = getDefaultLabel();
  validateOperation();
}

function getDefaultLabel() {
  switch (currentOperation) {
    case 'merge':
      return "Kéo thả nhiều file PDF vào đây hoặc click để chọn";
    default:
      return "Kéo thả file vào đây hoặc click để chọn";
  }
}

// --- Check file format ---
function validateOperation() {
  const operation = currentOperation;
  const file = fileInput.files[0];
  const files = filesInput.files;

  if (operation === 'merge') {
    if (files.length < 2) {
      btnConvert.disabled = true;
      btnConvert.innerText = "Cần ít nhất 2 file";
      btnConvert.style.backgroundColor = "#ccc";
      btnConvert.style.cursor = "not-allowed";
      fileLabel.style.color = "red";
      return;
    }
  } else {
    if (!file) {
      btnConvert.disabled = true;
      return;
    }
  }

  // Check specific validations
  if (operation === 'convert') {
    const targetFormat = targetFormatSelect.value;
    const fileExt = file.name.split(".").pop().toLowerCase();

    if (fileExt === targetFormat) {
      btnConvert.disabled = true;
      btnConvert.innerText = "Định dạng không hợp lệ";
      btnConvert.style.backgroundColor = "#ccc";
      btnConvert.style.cursor = "not-allowed";
      fileLabel.style.color = "red";
      return;
    }
  }

  // Get back to normal state
  btnConvert.disabled = false;
  updateButtonText(operation);
  btnConvert.style.backgroundColor = "";
  btnConvert.style.cursor = "pointer";
  fileLabel.style.color = "";
}

// --- Operation card click handlers ---
operationCards.forEach(card => {
  card.addEventListener('click', () => {
    const operation = card.dataset.operation;
    selectOperation(operation);
  });
});

// Initialize UI on load - select 'convert' by default
document.addEventListener('DOMContentLoaded', () => {
  selectOperation('convert');
});

// --- Choose file ---
dropZone.onclick = () => {
  if (currentOperation === 'merge') {
    filesInput.click();
  } else {
    fileInput.click();
  }
};

fileInput.onchange = (e) => {
  if (e.target.files.length > 0) {
    const file = e.target.files[0];
    const fileExt = file.name.split(".").pop().toLowerCase();

    fileLabel.innerText = file.name;

    // Auto-select target format for convert operation
    if (currentOperation === 'convert') {
      if (fileExt === "pdf") {
        targetFormatSelect.value = "docx";
      } else if (fileExt === "docx") {
        targetFormatSelect.value = "pdf";
      }
    }

    validateOperation();
  }
};

filesInput.onchange = (e) => {
  if (e.target.files.length > 0) {
    const files = e.target.files;
    if (files.length === 1) {
      fileLabel.innerText = files[0].name;
    } else {
      fileLabel.innerText = `${files.length} files selected`;
    }
    validateOperation();
  }
};

targetFormatSelect.onchange = validateOperation;

// --- Convert file ---
btnConvert.onclick = async () => {
  const operation = currentOperation;
  const formData = new FormData();
  formData.append("operation", operation);

  let fileName = "";

  if (operation === 'merge') {
    const files = filesInput.files;
    if (!files || files.length < 2) return;

    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }
    fileName = mergeOutputName.value || "merged_pdf";

    // Add output name
    formData.append("output_name", fileName);
  } else {
    const file = fileInput.files[0];
    if (!file) return;

    formData.append("file", file);
    fileName = file.name;
  }

  // Add operation-specific parameters
  if (operation === 'convert') {
    formData.append("format", targetFormatSelect.value);
  } else if (operation === 'split') {
    formData.append("pages", splitPages.value);
  }

  showLoader(true);
  try {
    const resp = await fetch("/api/convert", {
      method: "POST",
      body: formData,
    });

    if (!resp.ok) {
      const errorText = await resp.text();
      throw new Error(`Xử lý thất bại: ${errorText}`);
    }

    const blob = await resp.blob();

    // Determine file extension based on operation
    let extension = "";
    switch (operation) {
      case 'convert':
        extension = targetFormatSelect.value;
        break;
      case 'compress':
        extension = "pdf";
        break;
      case 'merge':
        extension = "pdf";
        break;
      case 'split':
        extension = "zip";
        break;
      case 'image-to-pdf':
        extension = "pdf";
        break;
      case 'ocr':
        extension = "txt";
        break;
    }

    // Create download filename
    const lastDotIndex = fileName.lastIndexOf(".");
    const baseName = lastDotIndex !== -1 ? fileName.substring(0, lastDotIndex) : fileName;
    const newFileName = operation === 'merge' ? `${fileName}.${extension}` : `${baseName}.${extension}`;

    downloadBlob(blob, newFileName);
  } catch (err) {
    alert(err.message);
  } finally {
    showLoader(false);
  }
};

// --- Handle TTS ---
const btnTTS =
  document.getElementById("btn-tts");
btnTTS.onclick = async () => {
  const text =
    document.getElementById("tts-text").value;
  if (!text)
    return alert("Vui lòng nhập văn bản!");

  const formData = new FormData();
  formData.append("text", text);

  showLoader(true);
  try {
    const resp = await fetch("/api/tts", {
      method: "POST",
      body: formData,
    });
    if (!resp.ok)
      throw new Error("Tạo giọng nói thất bại");

    const blob = await resp.blob();
    downloadBlob(blob, "speech.mp3");
  } catch (err) {
    alert(err.message);
  } finally {
    showLoader(false);
  }
};

// --- Helpers functions ---
function showLoader(show) {
  loader.classList.toggle("hidden", !show);
}

// --- Drag and drop handling ---
dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.classList.add('border-indigo-500');
});

dropZone.addEventListener('dragleave', (e) => {
  e.preventDefault();
  dropZone.classList.remove('border-indigo-500');
});

dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('border-indigo-500');

  const files = e.dataTransfer.files;

  if (currentOperation === 'merge') {
    // Handle multiple files for merge
    if (files.length < 2) {
      alert('Cần ít nhất 2 file để gộp!');
      return;
    }

    // Create a DataTransfer object to set multiple files
    const dt = new DataTransfer();
    for (let i = 0; i < files.length; i++) {
      dt.items.add(files[i]);
    }
    filesInput.files = dt.files;

    fileLabel.innerText = `${files.length} files selected`;
    validateOperation();
  } else {
    // Handle single file
    if (files.length > 0) {
      const file = files[0];
      const dt = new DataTransfer();
      dt.items.add(file);
      fileInput.files = dt.files;

      fileLabel.innerText = file.name;
      validateOperation();
    }
  }
});

function downloadBlob(blob, filename) {
  const url = globalThis.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.style.display = "none";
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();

  setTimeout(() => {
    document.body.removeChild(a);
    globalThis.URL.revokeObjectURL(url);
  }, 100);
}

// Element References
const loader =
  document.getElementById("loader");
const dropZone =
  document.getElementById("drop-zone");
const fileInput =
  document.getElementById("file-input");
const filesInput = document.getElementById(
  "files-input"
);
const btnConvert = document.getElementById(
  "btn-convert"
);
const targetFormatSelect =
  document.getElementById("target-format");
const fileLabel =
  document.getElementById("file-label");
const mergeOutputName = document.getElementById(
  "merge-output-name"
);
const splitPages = document.getElementById(
  "split-pages"
);
const selectedOperation =
  document.getElementById("selected-operation");
const selectedOperationText =
  document.getElementById(
    "selected-operation-text"
  );
const operationCards =
  document.querySelectorAll(".operation-card");
const conversionCard = document.querySelector(
  ".main-container > div:first-child"
); // Assuming the first card is the conversion card

// Current selected operation (default to 'convert')
let currentOperation = "convert";

// --- Operation type handling ---
function selectOperation(operation) {
  // Update current operation
  currentOperation = operation;

  // Update visual selection
  operationCards.forEach((card) => {
    if (card.dataset.operation === operation) {
      card.classList.add(
        "selected",
        "border-indigo-500",
        "bg-indigo-50"
      );
      card.classList.remove("border-slate-200");
    } else {
      card.classList.remove(
        "selected",
        "border-indigo-500",
        "bg-indigo-50"
      );
      card.classList.add("border-slate-200");
    }
  });

  // Update selected operation display
  updateSelectedOperationDisplay(operation);

  // Hide all operation options
  document
    .querySelectorAll(".operation-option")
    .forEach((el) =>
      el.classList.add("hidden")
    );

  // Show relevant option
  const optionEl = document.getElementById(
    `${operation}-options`
  );
  if (optionEl) {
    optionEl.classList.remove("hidden");
  }

  // Update file input accept attribute and label
  updateFileInput(operation);

  // Update button text
  updateButtonText(operation);

  // Reset file selection
  resetFileSelection();
}

function updateSelectedOperationDisplay(
  operation
) {
  const operationNames = {
    convert: "Chuyển đổi định dạng",
    compress: "Nén PDF",
    merge: "Gộp PDF",
    split: "Tách PDF",
    "image-to-pdf": "Hình ảnh sang PDF",
    ocr: "Trích xuất văn bản (OCR)",
  };

  selectedOperationText.textContent =
    operationNames[operation] || operation;
  selectedOperation.classList.remove("hidden");
}

function updateFileInput(operation) {
  let accept = "";
  let label = "";

  switch (operation) {
    case "convert":
      accept = ".pdf,.docx";
      label =
        "Kéo thả file PDF/DOCX vào đây hoặc click để chọn";
      break;
    case "compress":
      accept = ".pdf";
      label =
        "Kéo thả file PDF vào đây hoặc click để chọn";
      break;
    case "merge":
      accept = ".pdf";
      label =
        "Kéo thả nhiều file PDF vào đây hoặc click để chọn";
      break;
    case "split":
      accept = ".pdf";
      label =
        "Kéo thả file PDF vào đây hoặc click để chọn";
      break;
    case "image-to-pdf":
      accept = ".jpg,.jpeg,.png";
      label =
        "Kéo thả file hình ảnh vào đây hoặc click để chọn";
      break;
    case "ocr":
      accept = ".jpg,.jpeg,.png";
      label =
        "Kéo thả file ảnh vào đây hoặc click để chọn";
      break;
  }

  fileInput.accept = accept;
  filesInput.accept = accept;
  fileLabel.innerText = label;
}

function updateButtonText(operation) {
  let text = "Bắt đầu xử lý";

  switch (operation) {
    case "convert":
      text = "Bắt đầu chuyển đổi";
      break;
    case "compress":
      text = "Bắt đầu nén";
      break;
    case "merge":
      text = "Bắt đầu gộp";
      break;
    case "split":
      text = "Bắt đầu tách";
      break;
    case "image-to-pdf":
      text = "Chuyển đổi";
      break;
    case "ocr":
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
    case "merge":
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

  if (operation === "merge") {
    if (files.length < 2) {
      btnConvert.disabled = true;
      btnConvert.innerText =
        "Cần ít nhất 2 file";
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
  if (operation === "convert") {
    const targetFormat =
      targetFormatSelect.value;
    const fileExt = file.name
      .split(".")
      .pop()
      .toLowerCase();

    if (fileExt === targetFormat) {
      btnConvert.disabled = true;
      btnConvert.innerText =
        "Định dạng không hợp lệ";
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
operationCards.forEach((card) => {
  card.addEventListener("click", () => {
    const operation = card.dataset.operation;
    selectOperation(operation);
  });
});

// Initialize UI on load - select 'convert' by default
document.addEventListener(
  "DOMContentLoaded",
  () => {
    selectOperation("convert");
    // Initialize page load animations
    if (
      window.animation &&
      window.animation.initPageLoadAnimations
    ) {
      window.animation.initPageLoadAnimations();
    }
    // Apply button effects
    if (
      window.animation &&
      window.animation.applyButtonPressEffect
    ) {
      window.animation.applyButtonPressEffect(
        btnConvert
      );
    }
    if (
      window.animation &&
      window.animation.applyButtonHoverGlow
    ) {
      window.animation.applyButtonHoverGlow(
        btnConvert
      );
    }
  }
);

// --- Choose file ---
dropZone.onclick = () => {
  if (currentOperation === "merge") {
    filesInput.click();
  } else {
    fileInput.click();
  }
};

fileInput.onchange = (e) => {
  if (e.target.files.length > 0) {
    const file = e.target.files[0];
    const fileExt = file.name
      .split(".")
      .pop()
      .toLowerCase();

    fileLabel.innerText = file.name;

    // Auto-select target format for convert operation
    if (currentOperation === "convert") {
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

  // Special handling for OCR - client-side processing
  if (operation === "ocr") {
    await handleOCR();
    return;
  }

  const formData = new FormData();
  formData.append("operation", operation);

  let fileName = "";

  if (operation === "merge") {
    const files = filesInput.files;
    if (!files || files.length < 2) return;

    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }
    fileName =
      mergeOutputName.value || "merged_pdf";

    // Add output name
    formData.append("output_name", fileName);
  } else {
    const file = fileInput.files[0];
    if (!file) return;

    formData.append("file", file);
    fileName = file.name;
  }

  // Add operation-specific parameters
  if (operation === "convert") {
    formData.append(
      "format",
      targetFormatSelect.value
    );
  } else if (operation === "split") {
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
      throw new Error(
        `Xử lý thất bại: ${errorText}`
      );
    }

    const blob = await resp.blob();

    // Determine file extension based on operation
    let extension = "";
    switch (operation) {
      case "convert":
        extension = targetFormatSelect.value;
        break;
      case "compress":
        extension = "pdf";
        break;
      case "merge":
        extension = "pdf";
        break;
      case "split":
        extension = "zip";
        break;
      case "image-to-pdf":
        extension = "pdf";
        break;
      case "ocr":
        extension = "txt";
        break;
    }

    // Create download filename
    const lastDotIndex =
      fileName.lastIndexOf(".");
    const baseName =
      lastDotIndex !== -1
        ? fileName.substring(0, lastDotIndex)
        : fileName;
    const newFileName =
      operation === "merge"
        ? `${fileName}.${extension}`
        : `${baseName}.${extension}`;

    downloadBlob(blob, newFileName);
  } catch (err) {
    window.animation.showToast(
      err.message,
      "error"
    );
  } finally {
    showLoader(false);
  }
};

// --- OCR Processing ---
async function handleOCR() {
  const file = fileInput.files[0];
  if (!file)
    return alert("Vui lòng chọn file trước!");

  // Check network connectivity first
  try {
    await fetch("https://unpkg.com/", {
      mode: "no-cors",
      timeout: 5000,
    });
  } catch (e) {
    window.animation.showToast(
      "Không thể kết nối tới CDN. Vui lòng kiểm tra kết nối internet.",
      "error"
    );
    return;
  }

  // Check if Tesseract.js is available
  if (typeof Tesseract === "undefined") {
    window.animation.showToast(
      "Tesseract.js chưa được tải. Có thể do:\n1. Kết nối internet chậm\n2. Firewall chặn CDN\n3. Browser không hỗ trợ\n\nVui lòng thử:\n- Refresh trang (F5)\n- Kiểm tra kết nối internet\n- Tắt VPN hoặc proxy\n- Sử dụng Chrome/Edge browser",
      "error",
      7
    );
    return;
  }

  // Show OCR-specific loading message
  showLoader(
    true,
    "Đang tải OCR... (10-60 giây lần đầu, tải mô hình nhận diện chữ)"
  );

  try {
    // Only support images for OCR
    if (!file.type.startsWith("image/")) {
      window.animation.showToast(
        "OCR chỉ hỗ trợ file ảnh (JPG, PNG). Vui lòng chọn file ảnh.",
        "error"
      );
    }

    console.log("Starting OCR processing...");
    const extractedText = await performOCR(
      file
    );

    console.log(
      "OCR completed, sending to server..."
    );
    showLoader(
      true,
      "Đang gửi kết quả lên server..."
    );

    // Send extracted text to server
    await sendOCRTextToServer(
      extractedText,
      file.name
    );
  } catch (error) {
    console.error(
      "OCR processing failed:",
      error
    );
    window.animation.showToast(
      `Lỗi OCR: ${error.message}`,
      "error"
    );
  } finally {
    showLoader(false);
  }
}

async function performOCR(imageFile) {
  try {
    console.log(
      "Starting OCR processing with Tesseract.js v5..."
    );

    showLoader(
      true,
      "Đang tải mô hình OCR... (10-30 giây lần đầu)"
    );

    // Create Tesseract worker for better control
    const worker =
      await Tesseract.createWorker();

    try {
      showLoader(
        true,
        "Đang khởi tạo engine OCR..."
      );

      // Load Vietnamese language for better Vietnamese text recognition
      await worker.loadLanguage("vie");
      await worker.initialize("vie");

      showLoader(
        true,
        "Đang nhận diện văn bản..."
      );

      // Perform OCR
      const {
        data: { text },
      } = await worker.recognize(imageFile);

      console.log("OCR result:", text);

      return text || "No text found in image";
    } finally {
      // Always terminate the worker
      await worker.terminate();
    }
  } catch (error) {
    console.error("OCR Error:", error);
    throw new Error(
      `Không thể nhận diện văn bản: ${error.message}`
    );
  }
}

async function sendOCRTextToServer(
  text,
  originalFileName
) {
  const formData = new FormData();
  formData.append("operation", "ocr");
  formData.append("text", text);
  formData.append("filename", originalFileName);

  const response = await fetch("/api/convert", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    window.animation.showToast(
      `Lỗi từ server: ${errorText}`,
      "error"
    );
  }

  const blob = await response.blob();
  const baseName =
    originalFileName.split(".")[0];
  downloadBlob(blob, `${baseName}_ocr.txt`);
}

// --- Helpers functions ---
function showLoader(
  show,
  customMessage = null
) {
  // Animate global loader overlay
  if (
    window.animation &&
    window.animation.animateGlobalLoader
  ) {
    window.animation.animateGlobalLoader(
      loader,
      show
    );
  }
  // Animate the specific conversion card for pulsing effect
  if (
    window.animation &&
    window.animation.animateLoadingCard
  ) {
    window.animation.animateLoadingCard(
      conversionCard,
      show
    );
  }

  // Update message for global loader
  const messageElement =
    loader.querySelector("span");
  if (messageElement) {
    messageElement.textContent =
      customMessage ||
      "Đang xử lý, vui lòng đợi...";
  }
}

// --- Drag and drop handling ---
dropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropZone.classList.add("border-indigo-500");
});

dropZone.addEventListener("dragleave", (e) => {
  e.preventDefault();
  dropZone.classList.remove(
    "border-indigo-500"
  );
});

dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropZone.classList.remove(
    "border-indigo-500"
  );

  const files = e.dataTransfer.files;

  if (currentOperation === "merge") {
    // Handle multiple files for merge
    if (files.length < 2) {
      window.animation.showToast(
        "Cần ít nhất 2 file để gộp!",
        "error"
      );
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
  const url =
    globalThis.URL.createObjectURL(blob);
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

// Element References
const loader =
  document.getElementById("loader");
const dropZone =
  document.getElementById("drop-zone");
const fileInput =
  document.getElementById("file-input");
const btnConvert = document.getElementById(
  "btn-convert"
);
const targetFormatSelect =
  document.getElementById("target-format");
const fileLabel =
  document.getElementById("file-label");

// --- Check file format ---
function validateFormats() {
  const file = fileInput.files[0];
  const targetFormat = targetFormatSelect.value;

  if (!file) {
    btnConvert.disabled = true;
    return;
  }

  const fileExt = file.name
    .split(".")
    .pop()
    .toLowerCase();

  // Check if the selected file format matches the target format
  if (fileExt === targetFormat) {
    btnConvert.disabled = true;
    btnConvert.innerText =
      "Định dạng không hợp lệ";
    btnConvert.style.backgroundColor = "#ccc";
    btnConvert.style.cursor = "not-allowed"; // Warning cursor
    fileLabel.style.color = "red";
  } else {
    // Get back to normal state
    btnConvert.disabled = false;
    btnConvert.innerText = "Bắt đầu chuyển đổi";
    btnConvert.style.backgroundColor = "";
    btnConvert.style.cursor = "pointer";
    fileLabel.style.color = "";
  }
}

// --- Choose file ---
dropZone.onclick = () => fileInput.click();

fileInput.onchange = (e) => {
  if (e.target.files.length > 0) {
    const file = e.target.files[0];
    const fileExt = file.name
      .split(".")
      .pop()
      .toLowerCase();

    fileLabel.innerText = file.name;

    // Auto-select target format
    if (fileExt === "pdf") {
      targetFormatSelect.value = "docx";
    } else if (fileExt === "docx") {
      targetFormatSelect.value = "pdf";
    }

    // Call format validation
    validateFormats();
  }
};

targetFormatSelect.onchange = validateFormats;

// --- Convert file ---
btnConvert.onclick = async () => {
  const file = fileInput.files[0];
  const format = targetFormatSelect.value;

  if (!file || btnConvert.disabled) return;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("format", format);

  showLoader(true);
  try {
    const resp = await fetch("/api/convert", {
      method: "POST",
      body: formData,
    });

    if (!resp.ok)
      throw new Error("Chuyển đổi thất bại");

    const blob = await resp.blob();

    // Create new file name with correct extension
    const originalName = file.name;
    const lastDotIndex =
      originalName.lastIndexOf(".");
    const baseName =
      lastDotIndex !== -1
        ? originalName.substring(
            0,
            lastDotIndex
          )
        : originalName;
    const newFileName = `${baseName}.${format}`;

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

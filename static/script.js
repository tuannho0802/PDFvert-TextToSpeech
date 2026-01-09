const loader =
  document.getElementById("loader");

// Handle file conversion
const dropZone =
  document.getElementById("drop-zone");
const fileInput =
  document.getElementById("file-input");
const btnConvert = document.getElementById(
  "btn-convert"
);

dropZone.onclick = () => fileInput.click();

fileInput.onchange = (e) => {
  if (e.target.files.length > 0) {
    document.getElementById(
      "file-label"
    ).innerText = e.target.files[0].name;
  }
};

btnConvert.onclick = async () => {
  const file = fileInput.files[0];
  const format = document.getElementById(
    "target-format"
  ).value;

  if (!file)
    return alert("Vui lòng chọn file!");

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

    // get original file name without extension
    const originalName = file.name;
    // find last dot index
    const lastDotIndex =
      originalName.lastIndexOf(".");
    // get name without extension
    const baseName =
      lastDotIndex !== -1
        ? originalName.substring(
            0,
            lastDotIndex
          )
        : originalName;

    // create new file name with target format
    const newFileName = `${baseName}.${format}`;

    console.log(
      "Tên file sẽ tải về:",
      newFileName
    ); // Debug log for new file name

    downloadBlob(blob, newFileName);

    // get new file name with target format
    downloadBlob(blob, newFileName);
  } catch (err) {
    alert(err.message);
  } finally {
    showLoader(false);
  }
};

// Handle TTS
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

function showLoader(show) {
  loader.classList.toggle("hidden", !show);
}

function downloadBlob(blob, filename) {
  const url =
    globalThis.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.style.display = "none"; // hide the element
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();

  // delay removal to ensure download starts
  setTimeout(() => {
    document.body.removeChild(a);
    globalThis.URL.revokeObjectURL(url);
  }, 100);
}

// --- Handle TTS ---
// Get TTS UI elements
const btnTTS = document.getElementById("btn-tts");
const ttsVoice = document.getElementById("tts-voice");
const ttsRate = document.getElementById("tts-rate");
const rateValue = document.getElementById("rate-value");
const audioPreview = document.getElementById("audio-preview");
const ttsAudio = document.getElementById("tts-audio");
const btnPreview = document.getElementById("btn-preview");
const btnDownload = document.getElementById("btn-download");
const btnGenerateNew = document.getElementById("btn-generate-new");

// Store current audio blob
let currentAudioBlob = null;

// Initialize preview button as disabled
btnPreview.disabled = true;

// Update rate value display
ttsRate.addEventListener("input", () => {
  const value = ttsRate.value;
  rateValue.textContent = value + "%";
});

btnTTS.onclick = async () => {
  const text = document.getElementById("tts-text").value;
  if (!text) return alert("Vui lòng nhập văn bản!");

  const voice = ttsVoice.value;
  const rate = ttsRate.value + "%";

  const formData = new FormData();
  formData.append("text", text);
  formData.append("voice", voice);
  formData.append("rate", rate);

  showLoader(true, "Đang tạo giọng nói...");
  try {
    const resp = await fetch("/api/tts", {
      method: "POST",
      body: formData,
    });
    if (!resp.ok)
      throw new Error("Tạo giọng nói thất bại");

    const blob = await resp.blob();

    // Store blob for download
    currentAudioBlob = blob;

    // Create audio URL and show preview
    const audioUrl = URL.createObjectURL(blob);
    ttsAudio.src = audioUrl;

    // Show audio preview section
    audioPreview.classList.remove("hidden");

    // Update preview button text to indicate audio is ready
    btnPreview.textContent = "🔊 Nghe thử";
    btnPreview.disabled = false;

    // Auto-play the audio (can be muted by browser)
    ttsAudio.play().catch(() => {
      // Ignore autoplay errors (browsers may block autoplay)
    });
  } catch (err) {
    alert(err.message);
  } finally {
    showLoader(false);
  }
};

// Preview button - play/pause the audio
btnPreview.onclick = () => {
  if (ttsAudio.paused) {
    ttsAudio.play();
    btnPreview.textContent = "⏸️ Tạm dừng";
  } else {
    ttsAudio.pause();
    btnPreview.textContent = "🔊 Nghe thử";
  }
};

// Handle audio end event to reset button
ttsAudio.addEventListener("ended", () => {
  btnPreview.textContent = "🔊 Nghe thử";
});

// Download button
btnDownload.onclick = () => {
  if (currentAudioBlob) {
    downloadBlob(
      currentAudioBlob,
      "speech.mp3"
    );
  }
};

// Generate new button
btnGenerateNew.onclick = () => {
  audioPreview.classList.add("hidden");
  currentAudioBlob = null;
  ttsAudio.src = "";
  btnPreview.textContent = "🔊 Nghe thử";
  btnPreview.disabled = true;
};

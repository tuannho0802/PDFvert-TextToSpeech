// --- Handle TTS ---
// Get TTS UI elements
const ttsCard = document.querySelector(
  ".main-container > div:last-child"
); // Assuming the last card is the TTS card
const btnTTS =
  document.getElementById("btn-tts");
const ttsText =
  document.getElementById("tts-text");
const btnCopyText = document.getElementById(
  "btn-copy-text"
);
const ttsVoice =
  document.getElementById("tts-voice");
const ttsRate =
  document.getElementById("tts-rate");
const ttsPitch =
  document.getElementById("tts-pitch");
const rateValue =
  document.getElementById("rate-value");
const pitchValue = document.getElementById(
  "pitch-value"
);
const audioPreview = document.getElementById(
  "audio-preview"
);
const ttsAudio =
  document.getElementById("tts-audio");
const btnPreview = document.getElementById(
  "btn-preview"
);
const btnDownload = document.getElementById(
  "btn-download"
);
const btnGenerateNew = document.getElementById(
  "btn-generate-new"
);

// Store current audio blob
let currentAudioBlob = null;

// Initialize preview button as disabled
btnPreview.disabled = true;

// --- Event Listeners ---
document.addEventListener(
  "DOMContentLoaded",
  () => {
    if (window.animation) {
      // Apply button animations
      window.animation.applyButtonPressEffect(
        btnTTS
      );
      window.animation.applyButtonHoverGlow(
        btnTTS
      );
      window.animation.applyButtonPressEffect(
        btnPreview
      );
      window.animation.applyButtonHoverGlow(
        btnPreview
      );
      window.animation.applyButtonPressEffect(
        btnDownload
      );
      window.animation.applyButtonHoverGlow(
        btnDownload
      );
      window.animation.applyButtonPressEffect(
        btnGenerateNew
      );
      window.animation.applyButtonHoverGlow(
        btnGenerateNew
      );
      window.animation.applyButtonPressEffect(
        btnCopyText
      );
      window.animation.applyButtonHoverGlow(
        btnCopyText
      );
    }
  }
);

// Update rate value display
ttsRate.addEventListener("input", () => {
  const value = ttsRate.value;
  rateValue.textContent = value + "%";
});

// Update pitch value display
ttsPitch.addEventListener("input", () => {
  const value = ttsPitch.value;
  pitchValue.textContent = value + "Hz";
});

// Copy text to clipboard
btnCopyText.onclick = async () => {
  try {
    await navigator.clipboard.writeText(
      ttsText.value
    );
    window.animation.showToast(
      "Văn bản đã được sao chép!",
      "success"
    );
  } catch (err) {
    console.error("Failed to copy text:", err);
    window.animation.showToast(
      "Không thể sao chép văn bản.",
      "error"
    );
  }
};

btnTTS.onclick = async () => {
  const text = ttsText.value;
  if (!text)
    return window.animation.showToast(
      "Vui lòng nhập văn bản!",
      "error"
    );

  const voice = ttsVoice.value;
  // Always include sign for edge-tts compatibility
  const rateValue = parseInt(ttsRate.value);
  const pitchValue = parseInt(ttsPitch.value);
  const rate =
    (rateValue >= 0 ? "+" : "") +
    rateValue +
    "%";
  const pitch =
    (pitchValue >= 0 ? "+" : "") +
    pitchValue +
    "Hz";

  const formData = new FormData();
  formData.append("text", text);
  formData.append("voice", voice);
  formData.append("rate", rate);
  formData.append("pitch", pitch);

  showLoader(true, "Đang tạo giọng nói...");
  try {
    const resp = await fetch("/api/tts", {
      method: "POST",
      body: formData,
    });
    if (!resp.ok)
      window.animation.showToast(
        "Tạo giọng nói thất bại",
        "error"
      );

    const blob = await resp.blob();

    // Store blob for download
    currentAudioBlob = blob;

    // Create audio URL and show preview
    const audioUrl = URL.createObjectURL(blob);
    ttsAudio.src = audioUrl;

    // Animate audio player appearance
    if (
      window.animation &&
      window.animation.animateAudioPlayer
    ) {
      window.animation.animateAudioPlayer(
        audioPreview,
        true
      );
    } else {
      audioPreview.classList.remove("hidden");
    }

    // Update preview button text to indicate audio is ready
    btnPreview.textContent = "🔊 Nghe thử";
    btnPreview.disabled = false;

    // Auto-play the audio (can be muted by browser)
    ttsAudio.play().catch(() => {
      // Ignore autoplay errors (browsers may block autoplay)
    });
  } catch (err) {
    window.animation.showToast(
      err.message,
      "error"
    );
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
  // Animate audio player disappearance
  if (
    window.animation &&
    window.animation.animateAudioPlayer
  ) {
    window.animation.animateAudioPlayer(
      audioPreview,
      false
    );
  } else {
    audioPreview.classList.add("hidden");
  }
  currentAudioBlob = null;
  ttsAudio.src = "";
  btnPreview.textContent = "🔊 Nghe thử";
  btnPreview.disabled = true;
};

// --- Helpers functions (modified to use animation system) ---
function showLoader(
  show,
  customMessage = null
) {
  // Animate global loader overlay
  if (
    window.animation &&
    window.animation.animateGlobalLoader
  ) {
    const loaderElement =
      document.getElementById("loader");
    window.animation.animateGlobalLoader(
      loaderElement,
      show
    );
  }
  // Animate the specific TTS card for pulsing effect
  if (
    window.animation &&
    window.animation.animateLoadingCard
  ) {
    window.animation.animateLoadingCard(
      ttsCard,
      show
    );
  }

  // Update message for global loader
  const loaderElement =
    document.getElementById("loader");
  if (!loaderElement) return;
  const messageElement =
    loaderElement.querySelector("span");
  if (messageElement) {
    messageElement.textContent =
      customMessage ||
      "Đang xử lý, vui lòng đợi...";
  }
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

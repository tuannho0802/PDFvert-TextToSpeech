package services

import (
	"fmt"
	"os/exec"
)

// GenerateSpeech creates MP3 file with voice and rate options
// Currently uses gTTS (Google Text-to-Speech) as a reliable fallback
// Parameters voice and rate are accepted for future compatibility
func GenerateSpeech(text string, outputPath string, voice string, rate string) error {
    // For now, use gTTS which is more reliable than edge-tts
    // gTTS supports Vietnamese language but not specific voices or rate control
    // We keep the voice/rate parameters for future compatibility

    // Determine language based on voice selection
    lang := "vi" // Default to Vietnamese
    if voice == "en-US" {
        lang = "en"
    }

    // gTTS doesn't support rate control, but we accept the parameter for future use
    // For now, we'll use normal speed
    _ = rate // Mark as used for future compatibility

    // Build gTTS command
    script := fmt.Sprintf(`
import gtts
import sys
import os

text = """%s"""
lang = "%s"
output_path = r"""%s"""

try:
    # Create gTTS object
    tts = gtts.gTTS(text=text, lang=lang, slow=False)

    # Ensure directory exists
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    # Save to file
    tts.save(output_path)

    print("gTTS completed successfully")
except Exception as e:
    print("gTTS error:", str(e), file=sys.stderr)
    sys.exit(1)
`, text, lang, outputPath)

    cmd := exec.Command("python", "-c", script)

    output, err := cmd.CombinedOutput()
    if err != nil {
        return fmt.Errorf("lỗi TTS với gTTS: %v, chi tiết: %s", err, string(output))
    }
    return nil
}

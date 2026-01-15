package services

import (
	"fmt"
	"os"
	"os/exec"
	"strings"
)

// GenerateSpeech creates MP3 file using edge-tts with high-quality neural voices
func GenerateSpeech(text string, outputPath string, voice string, rate string) error {
    // Validate voice parameter - default to Vietnamese female voice if not provided
    if voice == "" {
        voice = "vi-VN-HoaiMyNeural"
    }

    // Validate and format rate parameter for edge-tts (expects format like "+0%", "-10%", "+25%")
    if rate == "" {
        rate = "+0%"
    }

    // Ensure rate has the % suffix if not present
    if !strings.Contains(rate, "%") {
        rate = rate + "%"
    }

    // Build edge-tts command with UTF-8 encoding support
    // Use python -m edge_tts for proper module execution
    cmd := exec.Command("python", "-m", "edge_tts",
        "--voice", voice,
        "--rate", rate,
        "--text", text,
        "--write-media", outputPath)

    // Set UTF-8 environment for proper Vietnamese character handling
    cmd.Env = append(os.Environ(), "PYTHONUTF8=1")

    output, err := cmd.CombinedOutput()
    if err != nil {
        return fmt.Errorf("lỗi TTS với edge-tts: %v, chi tiết: %s", err, string(output))
    }

    // Verify the file was actually created
    if _, err := os.Stat(outputPath); os.IsNotExist(err) {
        return fmt.Errorf("file TTS không được tạo thành công: %s", outputPath)
    }

    return nil
}

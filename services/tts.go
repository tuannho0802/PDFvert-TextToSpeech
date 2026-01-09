package services

import (
	"fmt"
	"os/exec"
)

// GenerateSpeech call edge-tts CLI to create file mp3
func GenerateSpeech(text string, outputPath string) error {
    voice := "vi-VN-HoaiMyNeural"
    
    // Use "python", "-m", "edge_tts" instead of calling "edge-tts" directly.
    // This helps avoid PATH errors if your python command is already working.
    cmd := exec.Command("python", "-m", "edge_tts", "--voice", voice, "--text", text, "--write-media", outputPath)
    
    output, err := cmd.CombinedOutput()
    if err != nil {
        return fmt.Errorf("lỗi: %v, chi tiết: %s", err, string(output))
    }
    return nil
}

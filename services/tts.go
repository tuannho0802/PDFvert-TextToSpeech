package services

import (
	"fmt"
	"os/exec"
)

// GenerateSpeech call edge-tts CLI to create file mp3
func GenerateSpeech(text string, outputPath string) error {
	// Use Vietnamese voice
	voice := "vi-VN-HoaiMyNeural"

	// Cmd: edge-tts --voice vi-VN-HoaiMyNeural --text "content" --write-media out.mp3
	cmd := exec.Command("edge-tts", "--voice", voice, "--text", text, "--write-media", outputPath)

	output, err := cmd.CombinedOutput()
	if err != nil {
		return fmt.Errorf("error edge-tts: %v, detail: %s", err, string(output))
	}

	return nil
}

package services

import (
	"fmt"
	"os"
	"os/exec"
	"strings"
)

// GenerateSpeech creates MP3 file using edge-tts with fallback to gTTS
func GenerateSpeech(text string, outputPath string, voice string, rate string) error {
    fmt.Printf("TTS: Starting generation - voice: %s, rate: %s\n", voice, rate)

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

    // First try edge-tts (high quality)
    fmt.Println("TTS: Attempting edge-tts...")
    err := tryEdgeTTS(text, outputPath, voice, rate)
    if err == nil {
        // edge-tts succeeded
        fmt.Println("TTS: Successfully generated audio using edge-tts")
        return nil
    }

    // Check if this is a service restriction error that should trigger fallback
    errMsg := err.Error()
    fmt.Printf("TTS: edge-tts failed: %s\n", errMsg)

    if strings.Contains(errMsg, "403") ||
       strings.Contains(errMsg, "Forbidden") ||
       strings.Contains(errMsg, "Invalid response status") ||
       strings.Contains(errMsg, "WSServerHandshakeError") {
        fmt.Printf("TTS: edge-tts blocked, falling back to gTTS\n")
    } else {
        fmt.Printf("TTS: edge-tts failed with unexpected error, still trying gTTS fallback\n")
    }

    // Always try gTTS as fallback regardless of error type
    fmt.Println("TTS: Attempting gTTS fallback...")
    return tryGTTTS(text, outputPath, voice, rate)
}

// tryEdgeTTS attempts to generate speech using edge-tts
func tryEdgeTTS(text string, outputPath string, voice string, rate string) error {
    // Build edge-tts command following the official documentation format
    // Use --rate=[VALUE] format as shown in the docs
    cmd := exec.Command("python", "-m", "edge_tts",
        "--voice", voice,
        fmt.Sprintf("--rate=%s", rate),
        "--text", text,
        fmt.Sprintf("--write-media=%s", outputPath))

    // Set UTF-8 environment for proper Vietnamese character handling
    cmd.Env = append(os.Environ(), "PYTHONUTF8=1")

    // Execute the command and get output
    output, err := cmd.CombinedOutput()

    // Check for execution errors
    if err != nil {
        return fmt.Errorf("edge-tts failed: %v, output: %s", err, string(output))
    }

    // Check if output contains error indicators
    outputStr := string(output)
    if strings.Contains(outputStr, "403") ||
       strings.Contains(outputStr, "Forbidden") ||
       strings.Contains(outputStr, "WSServerHandshakeError") ||
       strings.Contains(outputStr, "Invalid response status") {
        return fmt.Errorf("edge-tts service blocked: %s", outputStr)
    }

    // Verify the file was actually created and has content
    if info, err := os.Stat(outputPath); os.IsNotExist(err) {
        return fmt.Errorf("edge-tts file not created: %s", outputPath)
    } else if info.Size() == 0 {
        return fmt.Errorf("edge-tts created empty file: %s", outputPath)
    }

    return nil
}

// tryGTTTS provides fallback TTS using Google Text-to-Speech
func tryGTTTS(text string, outputPath string, voice string, rate string) error {
    // Determine language based on voice selection for gTTS
    lang := "vi" // Default to Vietnamese
    if voice == "en-US-AriaNeural" || voice == "en-US-GuyNeural" {
        lang = "en"
    }

    // gTTS doesn't support rate control, but we accept the parameter for future compatibility
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
        return fmt.Errorf("gTTS fallback failed: %v, details: %s", err, string(output))
    }

    // Verify the file was created
    if _, err := os.Stat(outputPath); os.IsNotExist(err) {
        return fmt.Errorf("gTTS file not created: %s", outputPath)
    }

    return nil
}

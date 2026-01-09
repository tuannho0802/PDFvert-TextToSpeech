package services

import (
	"fmt"
	"os/exec"
	"path/filepath"
)

// ConvertFile call LibreOffice to convert file formats
func ConvertFile(inputPath string, outputDir string, targetFormat string) (string, error) {
	// Cmd: libreoffice --headless --convert-to docx --outdir ./uploads input.pdf
	cmd := exec.Command("libreoffice", "--headless", "--convert-to", targetFormat, "--outdir", outputDir, inputPath)

	output, err := cmd.CombinedOutput()
	if err != nil {
		return "", fmt.Errorf("error converting: %v, detail: %s", err, string(output))
	}

	// LibreOffice auto names the output file
	// Example: input.pdf -> input.docx
	baseName := filepath.Base(inputPath)
	extension := filepath.Ext(baseName)
	nameWithoutExt := baseName[:len(baseName)-len(extension)]

	finalPath := filepath.Join(outputDir, nameWithoutExt+"."+targetFormat)
	return finalPath, nil
}

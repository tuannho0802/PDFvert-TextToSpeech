package services

import (
	"fmt"
	"os/exec"
	"path/filepath"
)

func ConvertFile(inputPath string, outputDir string, targetFormat string) (string, error) {
	absInput, _ := filepath.Abs(inputPath)
	absOutputDir, _ := filepath.Abs(outputDir)
	
	ext := filepath.Ext(absInput)
	nameWithoutExt := filepath.Base(absInput[:len(absInput)-len(ext)])
	finalPath := filepath.Join(absOutputDir, nameWithoutExt+"."+targetFormat)

	var script string

	// SESSION 1: PDF -> DOCX
	if ext == ".pdf" && targetFormat == "docx" {
		fmt.Printf("Đang convert PDF sang DOCX: %s\n", nameWithoutExt)
		// Use Python's f-string to wrap paths in r'' to avoid special character errors.
		script = fmt.Sprintf("from pdf2docx import Converter; cv = Converter(r'%s'); cv.convert(r'%s'); cv.close()", absInput, finalPath)
	} else if ext == ".docx" && targetFormat == "pdf" { 
		fmt.Printf("Đang convert DOCX sang PDF: %s\n", nameWithoutExt)
		script = fmt.Sprintf("from docx2pdf import convert; convert(r'%s', r'%s')", absInput, finalPath)
	} else { 
		return "", fmt.Errorf("định dạng %s sang %s chưa được hỗ trợ", ext, targetFormat)
	}

	// Execute the system's default Python command (currently version 3.12.8)
	cmd := exec.Command("python", "-c", script)
	
	// Get error output
	output, err := cmd.CombinedOutput()
	if err != nil {
		return "", fmt.Errorf("lỗi thực thi Python: %v | Log: %s", err, string(output))
	}

	return finalPath, nil
}
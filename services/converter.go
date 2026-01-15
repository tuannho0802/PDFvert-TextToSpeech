package services

import (
	"fmt"
	"os/exec"
	"path/filepath"
)

// CompressPDF compresses a PDF file using PyMuPDF
func CompressPDF(inputPath string, outputDir string) (string, error) {
	absInput, _ := filepath.Abs(inputPath)
	absOutputDir, _ := filepath.Abs(outputDir)

	ext := filepath.Ext(absInput)
	nameWithoutExt := filepath.Base(absInput[:len(absInput)-len(ext)])
	finalPath := filepath.Join(absOutputDir, nameWithoutExt+"_compressed.pdf")

	fmt.Printf("Đang nén PDF: %s\n", nameWithoutExt)

	// Python script for PDF compression using PyMuPDF (fitz)
	script := fmt.Sprintf(`
import fitz
import sys

try:
    # Open the PDF
    doc = fitz.open(r'%s')

    # Compress the PDF with garbage collection and defragmentation
    doc.save(r'%s',
             garbage=4,  # Remove unused objects
             deflate=True,  # Compress streams
             clean=True)  # Clean and sanitize

    doc.close()
    print("PDF compression completed successfully")
except Exception as e:
    print(f"Error compressing PDF: {e}", file=sys.stderr)
    sys.exit(1)
`, absInput, finalPath)

	cmd := exec.Command("python", "-c", script)
	output, err := cmd.CombinedOutput()
	if err != nil {
		return "", fmt.Errorf("lỗi nén PDF: %v | Log: %s", err, string(output))
	}

	return finalPath, nil
}

// MergePDFs merges multiple PDF files into one using PyPDF2
func MergePDFs(inputPaths []string, outputDir string, outputName string) (string, error) {
	if len(inputPaths) < 2 {
		return "", fmt.Errorf("cần ít nhất 2 file PDF để gộp")
	}

	absOutputDir, _ := filepath.Abs(outputDir)
	finalPath := filepath.Join(absOutputDir, outputName+".pdf")

	fmt.Printf("Đang gộp %d file PDF thành: %s\n", len(inputPaths), outputName)

	// Build Python script for merging PDFs
	script := `
import PyPDF2
import sys

try:
    merger = PyPDF2.PdfMerger()
`

	for _, path := range inputPaths {
		absPath, _ := filepath.Abs(path)
		script += fmt.Sprintf("    merger.append(r'%s')\n", absPath)
	}

	script += fmt.Sprintf(`
    merger.write(r'%s')
    merger.close()
    print("PDF merge completed successfully")
except Exception as e:
    print(f"Error merging PDFs: {e}", file=sys.stderr)
    sys.exit(1)
`, finalPath)

	cmd := exec.Command("python", "-c", script)
	output, err := cmd.CombinedOutput()
	if err != nil {
		return "", fmt.Errorf("lỗi gộp PDF: %v | Log: %s", err, string(output))
	}

	return finalPath, nil
}

// SplitPDF splits a PDF file into multiple files using PyPDF2
func SplitPDF(inputPath string, outputDir string, pages []int) (string, error) {
	absInput, _ := filepath.Abs(inputPath)
	absOutputDir, _ := filepath.Abs(outputDir)

	ext := filepath.Ext(absInput)
	nameWithoutExt := filepath.Base(absInput[:len(absInput)-len(ext)])

	fmt.Printf("Đang tách PDF: %s\n", nameWithoutExt)

	// Python script for PDF splitting
	script := fmt.Sprintf(`
import PyPDF2
import sys

try:
    with open(r'%s', 'rb') as file:
        reader = PyPDF2.PdfReader(file)
        total_pages = len(reader.pages)

        pages_to_split = %s
        if not pages_to_split:
            # Split all pages into separate files
            for i in range(total_pages):
                writer = PyPDF2.PdfWriter()
                writer.add_page(reader.pages[i])
                output_path = r'%s/%s_page_' + str(i + 1) + '.pdf'
                writer.write(output_path)
                writer.close()
        else:
            # Split specific pages
            for page_num in pages_to_split:
                if page_num < 1 or page_num > total_pages:
                    continue
                writer = PyPDF2.PdfWriter()
                writer.add_page(reader.pages[page_num - 1])  # Convert to 0-based index
                output_path = r'%s/%s_page_' + str(page_num) + '.pdf'
                writer.write(output_path)
                writer.close()

    print("PDF split completed successfully")
except Exception as e:
    print(f"Error splitting PDF: {e}", file=sys.stderr)
    sys.exit(1)
`, absInput, fmt.Sprintf("%v", pages), absOutputDir, nameWithoutExt)

	cmd := exec.Command("python", "-c", script)
	output, err := cmd.CombinedOutput()
	if err != nil {
		return "", fmt.Errorf("lỗi tách PDF: %v | Log: %s", err, string(output))
	}

	return absOutputDir, nil
}

// ConvertImageToPDF converts image files to PDF using Pillow
func ConvertImageToPDF(inputPath string, outputDir string) (string, error) {
	absInput, _ := filepath.Abs(inputPath)
	absOutputDir, _ := filepath.Abs(outputDir)

	ext := filepath.Ext(absInput)
	nameWithoutExt := filepath.Base(absInput[:len(absInput)-len(ext)])
	finalPath := filepath.Join(absOutputDir, nameWithoutExt+".pdf")

	fmt.Printf("Đang chuyển đổi hình ảnh sang PDF: %s\n", nameWithoutExt)

	// Python script for image to PDF conversion
	script := fmt.Sprintf(`
from PIL import Image
import sys

try:
    # Open image
    img = Image.open(r'%s')

    # Convert to RGB if necessary (for PNG with transparency)
    if img.mode in ("RGBA", "P"):
        img = img.convert("RGB")

    # Save as PDF
    img.save(r'%s', "PDF", resolution=100.0)
    print("Image to PDF conversion completed successfully")
except Exception as e:
    print(f"Error converting image to PDF: {e}", file=sys.stderr)
    sys.exit(1)
`, absInput, finalPath)

	cmd := exec.Command("python", "-c", script)
	output, err := cmd.CombinedOutput()
	if err != nil {
		return "", fmt.Errorf("lỗi chuyển đổi hình ảnh sang PDF: %v | Log: %s", err, string(output))
	}

	return finalPath, nil
}

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

package handlers

import (
	"archive/zip"
	"fmt"
	"go-converter-pro/services"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

func HandleConversion(c *gin.Context) {
	fmt.Println("--- BẮT ĐẦU XỬ LÝ CONVERT ---")

	operation := c.PostForm("operation")
	if operation == "" {
		operation = "convert" // Default operation
	}

	// Get the absolute path to the uploads folder.
	absOutputDir, _ := filepath.Abs("./uploads")
	// Tạo thư mục nếu chưa có
	os.MkdirAll(absOutputDir, os.ModePerm)

	var resultPath string
	var err error

	switch operation {
	case "compress":
		// PDF Compression
		file, err := c.FormFile("file")
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Không nhận được file"})
			return
		}

		srcPath := filepath.Join(absOutputDir, file.Filename)
		if err := c.SaveUploadedFile(file, srcPath); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Lưu file tạm thất bại"})
			return
		}

		fmt.Printf("Đang nén PDF: %s\n", file.Filename)
		resultPath, err = services.CompressPDF(srcPath, absOutputDir)

	case "merge":
		// PDF Merge
		form, err := c.MultipartForm()
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Không nhận được files"})
			return
		}

		files := form.File["files"]
		if len(files) < 2 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Cần ít nhất 2 file để gộp"})
			return
		}

		outputName := c.PostForm("output_name")
		if outputName == "" {
			outputName = "merged_pdf"
		}

		var inputPaths []string
		for _, file := range files {
			srcPath := filepath.Join(absOutputDir, file.Filename)
			if err := c.SaveUploadedFile(file, srcPath); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Lưu file tạm thất bại"})
				return
			}
			inputPaths = append(inputPaths, srcPath)
		}

		fmt.Printf("Đang gộp %d file PDF\n", len(files))
		resultPath, err = services.MergePDFs(inputPaths, absOutputDir, outputName)

	case "split":
		// PDF Split
		file, err := c.FormFile("file")
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Không nhận được file"})
			return
		}

		srcPath := filepath.Join(absOutputDir, file.Filename)
		if err := c.SaveUploadedFile(file, srcPath); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Lưu file tạm thất bại"})
			return
		}

		// Parse pages parameter (comma-separated)
		pagesStr := c.PostForm("pages")
		var pages []int
		if pagesStr != "" {
			// Parse pages like "1,3,5-7"
			parts := strings.Split(pagesStr, ",")
			for _, part := range parts {
				part = strings.TrimSpace(part)
				if strings.Contains(part, "-") {
					rangeParts := strings.Split(part, "-")
					if len(rangeParts) == 2 {
						start, err1 := strconv.Atoi(strings.TrimSpace(rangeParts[0]))
						end, err2 := strconv.Atoi(strings.TrimSpace(rangeParts[1]))
						if err1 == nil && err2 == nil {
							for i := start; i <= end; i++ {
								pages = append(pages, i)
							}
						}
					}
				} else {
					if pageNum, err := strconv.Atoi(part); err == nil {
						pages = append(pages, pageNum)
					}
				}
			}
		}

		fmt.Printf("Đang tách PDF: %s\n", file.Filename)
		resultPath, err = services.SplitPDF(srcPath, absOutputDir, pages)

	case "image-to-pdf":
		// Image to PDF conversion
		file, err := c.FormFile("file")
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Không nhận được file"})
			return
		}

		srcPath := filepath.Join(absOutputDir, file.Filename)
		if err := c.SaveUploadedFile(file, srcPath); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Lưu file tạm thất bại"})
			return
		}

		fmt.Printf("Đang chuyển đổi hình ảnh sang PDF: %s\n", file.Filename)
		resultPath, err = services.ConvertImageToPDF(srcPath, absOutputDir)

	case "ocr":
		// OCR Text Extraction
		file, err := c.FormFile("file")
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Không nhận được file"})
			return
		}

		srcPath := filepath.Join(absOutputDir, file.Filename)
		if err := c.SaveUploadedFile(file, srcPath); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Lưu file tạm thất bại"})
			return
		}

		fmt.Printf("Đang trích xuất văn bản bằng OCR: %s\n", file.Filename)
		resultPath, err = services.ExtractTextWithOCR(srcPath, absOutputDir)

	case "convert":
		// Original conversion functionality
		file, err := c.FormFile("file")
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Không nhận được file"})
			return
		}

		targetFormat := c.PostForm("format")
		if targetFormat == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Thiếu tham số format"})
			return
		}

		srcPath := filepath.Join(absOutputDir, file.Filename)
		if err := c.SaveUploadedFile(file, srcPath); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Lưu file tạm thất bại"})
			return
		}

		fmt.Printf("Đang chuyển đổi: %s -> %s\n", file.Filename, targetFormat)
		resultPath, err = services.ConvertFile(srcPath, absOutputDir, targetFormat)

	default:
		c.JSON(http.StatusBadRequest, gin.H{"error": "Operation không được hỗ trợ"})
		return
	}

	if err != nil {
		fmt.Println("LỖI TỪ SERVICES:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Delay a bit to ensure file system is updated
	time.Sleep(200 * time.Millisecond)

	// Check if the result file exists
	if _, err := os.Stat(resultPath); os.IsNotExist(err) {
		c.JSON(http.StatusNotFound, gin.H{"error": "Không tìm thấy file sau xử lý"})
		return
	}

	// For split operation, return zip file containing all split PDFs
	if operation == "split" {
		// Create a zip file containing all split PDFs
		zipName := "split_pdfs.zip"
		zipPath := filepath.Join(absOutputDir, zipName)

		if err := createZipFromDir(resultPath, zipPath); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Không thể tạo file ZIP"})
			return
		}
		resultPath = zipPath
	}

	// Set headers to prompt file download
	outputFileName := filepath.Base(resultPath)
	c.Header("Access-Control-Expose-Headers", "Content-Disposition")
	c.Header("Content-Disposition", fmt.Sprintf("attachment; filename=\"%s\"", outputFileName))
	c.Header("Content-Type", "application/octet-stream")

	c.File(resultPath)

	fmt.Println("XỬ LÝ THÀNH CÔNG!")
}

// createZipFromDir creates a ZIP file containing all files from the specified directory
func createZipFromDir(sourceDir, zipPath string) error {
	zipFile, err := os.Create(zipPath)
	if err != nil {
		return err
	}
	defer zipFile.Close()

	zipWriter := zip.NewWriter(zipFile)
	defer zipWriter.Close()

	return filepath.Walk(sourceDir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		// Skip directories and only include PDF files
		if info.IsDir() || !strings.HasSuffix(strings.ToLower(path), ".pdf") {
			return nil
		}

		// Get relative path
		relPath, err := filepath.Rel(sourceDir, path)
		if err != nil {
			return err
		}

		// Create zip entry
		zipEntry, err := zipWriter.Create(relPath)
		if err != nil {
			return err
		}

		// Copy file content
		fileContent, err := os.Open(path)
		if err != nil {
			return err
		}
		defer fileContent.Close()

		_, err = io.Copy(zipEntry, fileContent)
		return err
	})
}

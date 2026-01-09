package handlers

import (
	"fmt"
	"go-converter-pro/services"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"github.com/gin-gonic/gin"
)

func HandleConversion(c *gin.Context) {
	fmt.Println("--- BẮT ĐẦU XỬ LÝ CONVERT ---")

	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Không nhận được file"})
		return
	}

	targetFormat := c.PostForm("format")

	// Get the absolute path to the uploads folder.
	absOutputDir, _ := filepath.Abs("./uploads")
	// Tạo thư mục nếu chưa có
	os.MkdirAll(absOutputDir, os.ModePerm)

	// Temporary root file path
	srcPath := filepath.Join(absOutputDir, file.Filename)

	if err := c.SaveUploadedFile(file, srcPath); err != nil {
		fmt.Println("LỖI LƯU FILE:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Lưu file tạm thất bại"})
		return
	}

	fmt.Printf("Đang chuyển đổi: %s -> %s\n", file.Filename, targetFormat)

	// Call service to convert file
	resultPath, err := services.ConvertFile(srcPath, absOutputDir, targetFormat)
	if err != nil {
		fmt.Println("LỖI TỪ SERVICES:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Delay a bit to ensure file system is updated
	time.Sleep(200 * time.Millisecond)

	// Check if the result file exists
	if _, err := os.Stat(resultPath); os.IsNotExist(err) {
		c.JSON(http.StatusNotFound, gin.H{"error": "Không tìm thấy file sau chuyển đổi"})
		return
	}

	// Set headers to prompt file download
	outputFileName := filepath.Base(resultPath)
	c.Header("Access-Control-Expose-Headers", "Content-Disposition")
	c.Header("Content-Disposition", fmt.Sprintf("attachment; filename=\"%s\"", outputFileName))
	c.Header("Content-Type", "application/octet-stream")

	c.File(resultPath)

	fmt.Println("CHUYỂN ĐỔI THÀNH CÔNG!")
}

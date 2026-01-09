package handlers

import (
	"net/http"
	"path/filepath"

	"go-converter-pro/services"

	"github.com/gin-gonic/gin"
)

func HandleConversion(c *gin.Context) {
	file, _ := c.FormFile("file")
	targetFormat := c.PostForm("format") // "docx" or "pdf"

	// Save temp file
	srcPath := filepath.Join("./uploads", file.Filename)
	if err := c.SaveUploadedFile(file, srcPath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Không thể lưu file tạm"})
		return
	}

	// Call service convert
	outputDir := "./uploads"
	resultPath, err := services.ConvertFile(srcPath, outputDir, targetFormat)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Return the converted file
	c.File(resultPath)
}

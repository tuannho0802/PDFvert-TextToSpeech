package handlers

import (
	"fmt"
	"net/http"
	"path/filepath"
	"time"

	"go-converter-pro/services"

	"github.com/gin-gonic/gin"
)

func HandleTTS(c *gin.Context) {
	text := c.PostForm("text")
	if text == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Nội dung văn bản không được trống"})
		return
	}

	// Create file name and path
	fileName := fmt.Sprintf("tts_%d.mp3", time.Now().UnixNano())
	filePath := filepath.Join("./uploads", fileName)

	// Call service to generate speech
	err := services.GenerateSpeech(text, filePath)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Return the generated file
	c.File(filePath)

	// Note: Temporary file deletion will be handled by middleware/cronjob later
}

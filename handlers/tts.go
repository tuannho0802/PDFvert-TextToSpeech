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
	voice := c.PostForm("voice")
	rate := c.PostForm("rate")

	if text == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Nội dung văn bản không được trống"})
		return
	}

	// Set defaults if not provided
	if voice == "" {
		voice = "vi-VN-HoaiMyNeural"
	}
	if rate == "" {
		rate = "+0%"
	}

	// Create file name and path (same pattern as converter)
	fileName := fmt.Sprintf("tts_%d.mp3", time.Now().UnixNano())
	filePath := filepath.Join("./uploads", fileName)

	// Call service to generate speech with voice and rate
	err := services.GenerateSpeech(text, filePath, voice, rate)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Return the generated file
	c.File(filePath)

	// Note: File cleanup will be handled by the 5-minute auto-cleanup worker
}

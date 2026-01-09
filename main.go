package main

import (
	"log"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"github.com/gin-gonic/gin"

	"go-converter-pro/handlers"
)

const uploadDir = "./uploads"

func main() {
	// Create the uploads folder if it doesn't exist
	os.MkdirAll(uploadDir, os.ModePerm)

	r := gin.Default()

	// Limit file upload size (10MB) to protect RAM
	r.MaxMultipartMemory = 10 << 20 // 10 MiB

	// Load UI
	r.LoadHTMLGlob("templates/*")

	r.Static("/static", "./static")
	// Routes
	r.GET("/", func(c *gin.Context) {
		c.HTML(http.StatusOK, "index.html", nil)
	})

	// Group API routes
	api := r.Group("/api")
	{
		api.POST("/convert", handlers.HandleConversion)
		api.POST("/tts", handlers.HandleTTS)
	}

	log.Println("Listening on http://localhost:8080")
	r.Run(":8080")
}

// startCleanupTask starts a goroutine to periodically clean up the uploads folder
func startCleanupTask() {
	go func() {
		for {
			// Run cleanup every 30 minutes
			time.Sleep(30 * time.Minute)

			files, err := os.ReadDir(uploadDir)
			if err != nil {
				continue
			}

			for _, file := range files {
				// Remove files in uploads folder
				os.Remove(filepath.Join(uploadDir, file.Name()))
			}
			log.Println("Thư mục tạm đã được dọn dẹp sạch sẽ!")
		}
	}()
}

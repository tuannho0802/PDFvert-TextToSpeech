package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"github.com/gin-gonic/gin"

	"go-converter-pro/handlers"
)

const uploadDir = "./uploads"
const staticDir = "./static"

// startCleanupWorker starts a goroutine to periodically clean up the uploads folder
func startCleanupWorker(dir string, interval time.Duration) {
	ticker := time.NewTicker(interval)
	go func() {
		for range ticker.C {
			files, err := os.ReadDir(dir)
			if err != nil {
				continue
			}

			now := time.Now()
			for _, f := range files {
				info, err := f.Info()
				if err != nil {
					continue
				}

				// If file is older than the interval, delete it
				if now.Sub(info.ModTime()) > interval {
					path := filepath.Join(dir, f.Name())
					os.Remove(path)
					fmt.Printf("--- CLEANUP: Đã xóa file cũ: %s ---\n", f.Name())
				}
			}
		}
	}()
}

func main() {
	// Create the uploads folder if it doesn't exist
	os.MkdirAll(uploadDir, os.ModePerm)

	startCleanupWorker("./uploads", 1*time.Minute)

	r := gin.Default()

	// Limit file upload size (10MB) to protect RAM
	r.MaxMultipartMemory = 10 << 20 // 10 MiB

	// Load UI
	r.LoadHTMLGlob("templates/*")

	r.Static("/static", staticDir)
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
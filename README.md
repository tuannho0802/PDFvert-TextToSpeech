#  PDFvert & TTS Pro 🎙️

PDFvert & TTS Pro is a web-based application that allows you to convert files between PDF and DOCX formats and convert text to speech.

## ✨ Features

-   **📄 File Conversion:** Convert PDF files to DOCX and DOCX files to PDF.
-   **🗜️ PDF Compression:** Compress PDF files to reduce file size.
-   **🔗 PDF Merge:** Combine multiple PDF files into one.
-   **✂️ PDF Split:** Split PDF files into separate pages or selected page ranges.
-   **🖼️ Image to PDF:** Convert image files (JPG, PNG) to PDF format.
-   **📝 OCR Text Extraction:** Extract text from images using client-side Tesseract.js v5 (English support only).
-   **🗣️ Text-to-Speech:** Convert text into natural-sounding speech (MP3) with language selection, audio preview, and professional controls.
-   **💨 Drag & Drop:** Easily upload files using a drag-and-drop interface.
-   **🧹 Auto-Cleanup:** Automatically deletes old files from the server to save space.
-   **📱 Responsive UI:** The user interface is designed to work on both desktop and mobile devices.

## 🛠️ Tech Stack

-   **Backend:** Go (with Gin framework)
-   **Frontend:** HTML, CSS (with Tailwind CSS), and JavaScript
-   **PDF Processing:** Python (with PyMuPDF, PyPDF2, Pillow) + Client-side OCR (Tesseract.js v5)
-   **File Conversion:** Python (with `pdf2docx` and `docx2pdf` libraries)
-   **Text-to-Speech:** Python (with `gTTS` library)
-   **Containerization:** Docker

## 🚀 Getting Started

### ✅ Prerequisites

-   Go (version 1.21 or later)
-   Python (version 3.11 or later)
-   Required Python libraries: PyMuPDF, PyPDF2, Pillow, pdf2docx, docx2pdf, gTTS

### ⚙️ Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/your-username/pdfvert-tts-pro.git
    ```
2.  Install the required Python libraries:
    ```bash
    pip install -r requirements.txt
    ```
    Or manually:
    ```bash
    pip install PyMuPDF PyPDF2 Pillow pdf2docx docx2pdf gTTS
    ```
4.  Run the application:
    ```bash
    go run main.go
    ```
5.  Open your browser and navigate to `http://localhost:8080`.

### 📝 OCR Usage Notes

- **Client-side Processing**: OCR runs entirely in your browser - no server load or API costs
- **First-time Setup**: Initial OCR may take 10-30 seconds to download English language models
- **Performance**: Subsequent OCR operations are much faster (2-5 seconds)
- **Language Support**: English text recognition only
- **File Types**: Supports JPG, PNG images only (no PDFs)
- **Privacy**: Images never leave your browser - complete privacy protection

## 📡 API Endpoints

-   `GET /`: Serves the main HTML page.
-   `POST /api/convert`: Handles file conversion.
-   `POST /api/tts`: Handles text-to-speech conversion.

## 📂 File Structure

```
.
├── Dockerfile
├── go.mod
├── main.go
├── handlers
│   ├── conversion.go
│   └── tts.go
├── services
│   ├── converter.go
│   └── tts.go
├── static
│   ├── script.js
│   ├── tts.js
│   └── style.css
├── templates
│   └── index.html
└── uploads
```

## 🐳 Docker

You can also run the application using Docker.

1.  Build the Docker image:
    ```bash
    docker build -t pdfvert-tts-pro .
    ```
2.  Run the Docker container:
    ```bash
    docker run -p 8080:8080 pdfvert-tts-pro
    ```
3.  Open your browser and navigate to `http://localhost:8080`.
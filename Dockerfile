# Build Go application
FROM golang:1.21-alpine AS builder
WORKDIR /app
COPY . .
RUN go mod download
RUN go build -o main .

# Runtime environment
FROM python:3.11-slim-bookworm

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install Python packages
RUN pip install --no-cache-dir \
    pdf2docx \
    docx2pdf \
    edge-tts

WORKDIR /root/

# Copy built Go application and other necessary files
COPY --from=builder /app/main .
COPY --from=builder /app/static ./static
COPY --from=builder /app/templates ./templates
RUN mkdir ./uploads

# Environment variables 
ENV PYTHONUNBUFFERED=1

EXPOSE 8080

CMD ["./main"]
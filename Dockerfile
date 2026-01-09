# Build app Go
FROM golang:1.21-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN go build -o main .

# Run with full environment
FROM debian:bookworm-slim

# Install LibreOffice, Python and pip
RUN apt-get update && apt-get install -y \
    libreoffice \
    python3 \
    python3-pip \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install edge-tts through pip (use --break-system-packagesif new Debian/Python version causes issues)
RUN pip3 install edge-tts --break-system-packages

WORKDIR /root/
# Copy binary from builder
COPY --from=builder /app/main .
# Copy folders
COPY --from=builder /app/templates ./templates
COPY --from=builder /app/uploads ./uploads

EXPOSE 8080

CMD ["./main"]
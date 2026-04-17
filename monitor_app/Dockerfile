# 1. Build Stage
FROM golang:alpine AS builder

WORKDIR /app

# Copy Go mod files and download dependencies first (caching layer)
COPY backend/go.mod backend/go.sum ./backend/
RUN cd backend && go mod download

# Copy the rest of the backend source code
COPY backend/ ./backend/

# Build the standalone binary for Linux
RUN cd backend && CGO_ENABLED=0 GOOS=linux go build -o monitor_server .


# 2. Run Stage (siêu nhỏ gọn với Alpine)
FROM alpine:latest
RUN apk --no-cache add ca-certificates tzdata

WORKDIR /app

# Copy the built Go binary from the builder stage
COPY --from=builder /app/backend/monitor_server /app/backend/monitor_server

# Copy the frontend folder (required by the Go server's relative path "../frontend")
COPY frontend/ /app/frontend/

# Navigate to backend directory so the executable runs from the correct context
WORKDIR /app/backend

# Expose both backend and frontend ports
EXPOSE 2700
EXPOSE 2701

# Start the server
CMD ["./monitor_server"]

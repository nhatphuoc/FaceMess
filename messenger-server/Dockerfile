FROM golang:1.24-alpine
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN go build -o main . || { echo "Build failed"; exit 1; }
RUN [ -f main ] || { echo "Executable 'main' not found"; exit 1; }
EXPOSE 8080
CMD ["./main"]
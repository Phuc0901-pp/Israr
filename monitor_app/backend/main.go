package main

import (
	"log"
	"net/http"

	"monitor_app/handlers"
)

func main() {
	hub := handlers.NewHub()
	go hub.Run()

	// 1. Backend Server (Port 2700)
	backendMux := http.NewServeMux()

	// REST endpoint for Node-RED to push data
	backendMux.HandleFunc("/api/ingest", func(w http.ResponseWriter, r *http.Request) {
		handlers.IngestData(hub, w, r)
	})

	// WebSocket endpoint for Frontend to connect
	backendMux.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		handlers.ServeWs(hub, w, r)
	})

	go func() {
		log.Println("Backend API Server running on http://localhost:2700")
		err := http.ListenAndServe(":2700", backendMux)
		if err != nil {
			log.Fatal("Backend ListenAndServe: ", err)
		}
	}()

	// 2. Frontend Server (Port 2701)
	frontendMux := http.NewServeMux()

	// Serve the frontend static files
	fs := http.FileServer(http.Dir("../frontend"))
	frontendMux.Handle("/", fs)

	log.Println("Frontend Web Server running on http://localhost:2701")
	err := http.ListenAndServe(":2701", frontendMux)
	if err != nil {
		log.Fatal("Frontend ListenAndServe: ", err)
	}
}

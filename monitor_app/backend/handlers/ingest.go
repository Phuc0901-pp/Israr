package handlers

import (
	"bytes"
	"encoding/json"
	"io"
	"log"
	"net/http"
	"time"
)

// IngestPayload is the expected body from Node-RED
type IngestPayload struct {
	// Stage identifies what phase the data is from:
	// "raw"       = data just read from InfluxDB (before transform)
	// "formatted" = the final tags payload ready for customer API
	// "status"    = result after POSTing to customer API
	Stage     string          `json:"stage"`
	Timestamp string          `json:"timestamp,omitempty"`
	Data      json.RawMessage `json:"data"`
}

// IngestData receives data from Node-RED and fans it out to all WebSocket clients
func IngestData(hub *Hub, w http.ResponseWriter, r *http.Request) {
	// CORS headers for local dev
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Cannot read body", http.StatusBadRequest)
		return
	}
	defer r.Body.Close()

	var payload IngestPayload
	err = json.Unmarshal(body, &payload)
	
	// Nếu không parse được chuẩn wrapper (stage, data) HOẶC Node-RED gửi chay (không có Stage/Data)
	if err != nil || payload.Stage == "" || len(payload.Data) == 0 {
		stage := "raw"
		
		// Auto-detect stage thông minh bằng cách đọc nội dung chuỗi JSON
		if bytes.Contains(body, []byte(`"ProjectPrefix"`)) || bytes.Contains(body, []byte(`"tags":`)) {
			stage = "formatted"
		} else if bytes.Contains(body, []byte(`"status_code"`)) || bytes.Contains(body, []byte(`"latency_ms"`)) {
			stage = "status"
		}

		payload = IngestPayload{
			Stage:     stage,
			Timestamp: time.Now().Format(time.RFC3339),
			Data:      body, // Giữ nguyên toàn bộ nội dung JSON gốc đưa vào trường Data
		}
	}

	log.Printf("[Ingest] Stage=%s len=%d", payload.Stage, len(payload.Data))

	// Build enriched message with timestamp
	type enriched struct {
		Timestamp string          `json:"timestamp"`
		Data      json.RawMessage `json:"data"`
	}
	enrichedMsg, _ := json.Marshal(enriched{Timestamp: payload.Timestamp, Data: payload.Data})

	switch payload.Stage {
	case "formatted":
		hub.BroadcastFormatted(enrichedMsg)
	case "status":
		hub.BroadcastStatus(enrichedMsg)
	default: // "raw"
		hub.BroadcastRaw(enrichedMsg)
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"ok":true}`))
}

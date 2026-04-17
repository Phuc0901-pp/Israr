package handlers

import (
	"encoding/json"
	"log"
	"sync"
)

// Client represents a connected WebSocket frontend client
type Client struct {
	hub  *Hub
	send chan []byte
	conn interface{ WriteMessage(int, []byte) error }
}

// Hub maintains the set of active clients and broadcasts messages to them
type Hub struct {
	clients    map[*Client]bool
	broadcast  chan []byte
	register   chan *Client
	unregister chan *Client
	mu         sync.Mutex

	// Latest state snapshots for new clients
	latestRaw       json.RawMessage
	latestFormatted json.RawMessage
	latestStatus    json.RawMessage
}

func NewHub() *Hub {
	return &Hub{
		broadcast:  make(chan []byte, 256),
		register:   make(chan *Client),
		unregister: make(chan *Client),
		clients:    make(map[*Client]bool),
	}
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.register:
			h.mu.Lock()
			h.clients[client] = true
			// Send latest snapshot to new client
			if h.latestRaw != nil {
				client.send <- wrapEnvelope("raw_data", h.latestRaw)
			}
			if h.latestFormatted != nil {
				client.send <- wrapEnvelope("formatted_data", h.latestFormatted)
			}
			if h.latestStatus != nil {
				client.send <- wrapEnvelope("push_status", h.latestStatus)
			}
			h.mu.Unlock()
			log.Printf("[Hub] Client connected. Total: %d", len(h.clients))

		case client := <-h.unregister:
			h.mu.Lock()
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				close(client.send)
			}
			h.mu.Unlock()
			log.Printf("[Hub] Client disconnected. Total: %d", len(h.clients))

		case message := <-h.broadcast:
			h.mu.Lock()
			for client := range h.clients {
				select {
				case client.send <- message:
				default:
					close(client.send)
					delete(h.clients, client)
				}
			}
			h.mu.Unlock()
		}
	}
}

// BroadcastRaw broadcasts raw data and saves snapshot
func (h *Hub) BroadcastRaw(data json.RawMessage) {
	h.mu.Lock()
	h.latestRaw = data
	h.mu.Unlock()
	h.broadcast <- wrapEnvelope("raw_data", data)
}

// BroadcastFormatted broadcasts formatted/transformed data and saves snapshot
func (h *Hub) BroadcastFormatted(data json.RawMessage) {
	h.mu.Lock()
	h.latestFormatted = data
	h.mu.Unlock()
	h.broadcast <- wrapEnvelope("formatted_data", data)
}

// BroadcastStatus broadcasts push/forwarding status and saves snapshot
func (h *Hub) BroadcastStatus(data json.RawMessage) {
	h.mu.Lock()
	h.latestStatus = data
	h.mu.Unlock()
	h.broadcast <- wrapEnvelope("push_status", data)
}

type Envelope struct {
	Type    string          `json:"type"`
	Payload json.RawMessage `json:"payload"`
}

func wrapEnvelope(msgType string, data json.RawMessage) []byte {
	env := Envelope{Type: msgType, Payload: data}
	b, _ := json.Marshal(env)
	return b
}

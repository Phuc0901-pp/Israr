/**
 * websocket.js — Module quản lý kết nối WebSocket tới Go Backend
 * Cung cấp: kết nối, tự động reconnect, dispatch sự kiện tới UI
 */

const WS_URL = `ws://${location.hostname}:2700/ws`;
const RECONNECT_DELAY_MS = 3000;
const MAX_RECONNECT_ATTEMPTS = 20;

let ws = null;
let reconnectAttempts = 0;
let reconnectTimer = null;
let _onMessageCb = null;
let _onStatusCb = null;

/**
 * Đăng ký callback nhận message
 * @param {function({ type: string, payload: any })} cb
 */
function onMessage(cb) { _onMessageCb = cb; }

/**
 * Đăng ký callback nhận thay đổi trạng thái kết nối
 * @param {function('connecting'|'connected'|'disconnected')} cb
 */
function onStatus(cb) { _onStatusCb = cb; }

function notifyStatus(state) {
  if (_onStatusCb) _onStatusCb(state);
}

function connect() {
  notifyStatus('connecting');
  ws = new WebSocket(WS_URL);

  ws.onopen = () => {
    reconnectAttempts = 0;
    notifyStatus('connected');
    console.info('[WS] Connected to', WS_URL);
  };

  ws.onmessage = (event) => {
    try {
      const envelope = JSON.parse(event.data);
      if (_onMessageCb && envelope.type && envelope.payload !== undefined) {
        _onMessageCb(envelope);
      }
    } catch (err) {
      console.warn('[WS] Failed to parse message:', err);
    }
  };

  ws.onerror = (err) => {
    console.warn('[WS] Error:', err);
  };

  ws.onclose = () => {
    notifyStatus('disconnected');
    ws = null;
    if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      reconnectAttempts++;
      console.info(`[WS] Reconnect attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS} in ${RECONNECT_DELAY_MS}ms…`);
      reconnectTimer = setTimeout(connect, RECONNECT_DELAY_MS);
    } else {
      console.error('[WS] Max reconnect attempts reached.');
    }
  };
}

function disconnect() {
  clearTimeout(reconnectTimer);
  if (ws) { ws.close(); ws = null; }
}

function isConnected() {
  return ws && ws.readyState === WebSocket.OPEN;
}

// Export public API
window.AppWS = { connect, disconnect, isConnected, onMessage, onStatus };

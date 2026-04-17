/**
 * main.js — App entry point
 * Lắp ghép WebSocket module và UI module lại với nhau.
 */

(function () {
  'use strict';

  /* ======================================================
     Khởi động ứng dụng sau khi DOM sẵn sàng
     ====================================================== */
  document.addEventListener('DOMContentLoaded', () => {
    const WS = window.AppWS;
    const UI = window.AppUI;

    // 1) Khởi tạo các tính năng UI tĩnh
    UI.startClock();
    UI.initNav();
    UI.initJsonToolbar();
    UI.appendLog('ETL Monitor khởi động. Đang kết nối WebSocket…', 'info');

    // 2) Đăng ký callback trạng thái WebSocket
    WS.onStatus((state) => {
      UI.setWsBadge(state);
      const msgs = {
        connecting:   'Đang kết nối tới Gateway Server…',
        connected:    'WebSocket đã kết nối tới Go Backend.',
        disconnected: 'Mất kết nối. Đang thử kết nối lại…'
      };
      UI.appendLog(msgs[state] || state, state === 'disconnected' ? 'warn' : 'info');
    });

    // 3) Đăng ký callback nhận message từ Go Backend (qua WebSocket)
    WS.onMessage((envelope) => {
      const { type, payload } = envelope;

      // Mỗi loại dữ liệu được điều phối tới đúng renderer
      switch (type) {

        case 'raw_data':
          // Dữ liệu thô từ InfluxDB
          UI.renderRawData(payload);
          UI.appendLog('Nhận Raw Data từ InfluxDB.', 'info');
          break;

        case 'formatted_data':
          // Dữ liệu đã transform, sẵn sàng gửi
          UI.setLastFormattedData(payload.data || payload);
          UI.renderFormattedData(payload);
          // Cập nhật tag count trên cards
          const tags = (payload.data || payload).tags || (payload.data || payload).payload || [];
          UI.setVal('val-tags-count', Array.isArray(tags) ? tags.length : '—');
          UI.appendLog(`Nhận Formatted Payload. ${Array.isArray(tags) ? tags.length : '?'} tags.`, 'info');
          break;

        case 'push_status':
          // Kết quả sau khi đẩy lên API khách hàng
          UI.renderPushStatus(payload);
          break;

        default:
          UI.appendLog(`Unknown message type: ${type}`, 'warn');
          break;
      }
    });

    // 4) Bắt đầu kết nối WebSocket
    WS.connect();

    // ======================================================
    // DEMO MODE: Inject mock data mỗi 5s nếu chưa có dữ liệu thật
    // Xóa đoạn này khi Node-RED đã kết nối đầy đủ
    // ======================================================
    if (window.location.search.includes('demo')) {
      startDemoMode(WS);
    }
  });

  /* ======================================================
     DEMO MODE — Tạo dữ liệu giả để xem giao diện
     ====================================================== */
  function startDemoMode() {
    const UI = window.AppUI;
    UI.appendLog('🎭 DEMO MODE đang chạy — Dữ liệu giả được inject mỗi 6 giây.', 'warn');

    const rand = (min, max, dec = 2) => +(Math.random() * (max - min) + min).toFixed(dec);
    const ts   = () => new Date().toISOString();

    function injectRaw() {
      const payload = {
        timestamp: ts(),
        data: {
          vn_bhpp_sensorsdata: {
            AmbientTemperature01: rand(28, 42),
            AmbientTemperature02: rand(27, 41),
            ModuleTemperature01: rand(35, 65),
            Irradiance01: rand(400, 1000, 1),
            Irradiance02: rand(380, 980, 1),
          },
          vn_bhpp_metersdata: {
            Meter01_ActivePowerTotal: rand(-150, -80),
            Meter01_ActiveEnergyReceived: rand(1000, 9999, 1),
            Meter01_ActiveEnergyDelivered: rand(5000, 50000, 1),
            Meter01_CurrentA: rand(100, 250, 1),
            Meter01_CurrentB: rand(98, 248, 1),
            Meter01_CurrentC: rand(99, 249, 1),
            Meter01_VoltageAB: rand(370, 395, 1),
            Meter01_ReactivePowerTotal: rand(-30, -5),
          },
          scb_by_device: Object.fromEntries(
            Array.from({ length: 32 }, (_, i) => {
              const name = `S${String(i + 1).padStart(2, '0')}`;
              const online = Math.random() > 0.1; // 90% online
              return [name, online ? { time_iso: ts(), Voltage: rand(700, 760, 1) } : null];
            }).filter(([, v]) => v)
          )
        }
      };
      UI.renderRawData(payload);
      UI.appendLog('[DEMO] Raw data injected.', 'info');
    }

    function injectFormatted() {
      const numTags = rand(60, 120, 0);
      const mockTags = Array.from({ length: numTags }, (_, i) => ({
        name: `sensorsdata.Tag${i}`,
        type: 'float',
        value: String(rand(0, 999)),
        unit: ['kW', '°C', 'A', 'V', 'W/m2'][i % 5],
        scale: '1.0'
      }));
      const payload = {
        timestamp: ts(),
        data: {
          TimeStamp: ts().replace('T', ' ').slice(0, 19),
          ProjectPrefix: 'vn_bhpp',
          Country: 'Vietnam',
          Client: 'RAITEK',
          tags: mockTags,
          payload: mockTags
        }
      };
      UI.setLastFormattedData(payload.data);
      UI.renderFormattedData(payload);
      UI.setVal('val-tags-count', numTags);
      UI.appendLog(`[DEMO] Formatted payload injected. ${numTags} tags.`, 'info');
    }

    function injectStatus() {
      const ok = Math.random() > 0.1;
      const payload = {
        timestamp: ts(),
        data: {
          ok,
          status_code: ok ? 200 : [500, 503, 408][Math.floor(Math.random() * 3)],
          latency_ms: rand(80, 600, 0),
          payload_bytes: rand(4000, 20000, 0),
          endpoint: 'https://api.issrar.app/Ingest/store-dataOfProjects',
          response: ok ? { message: 'Success', stored: true } : { error: 'Internal Server Error' }
        }
      };
      UI.renderPushStatus(payload);
    }

    // Stagger injections to simulate real pipeline timing
    setInterval(() => { injectRaw(); }, 6000);
    setInterval(() => { setTimeout(injectFormatted, 1500); }, 6000);
    setInterval(() => { setTimeout(injectStatus, 3000); }, 6000);

    // Initial inject
    setTimeout(injectRaw, 500);
    setTimeout(injectFormatted, 2000);
    setTimeout(injectStatus, 3500);
  }

})();

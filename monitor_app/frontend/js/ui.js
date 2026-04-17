/**
 * ui.js — Light Enterprise Theme
 * Cập nhật DOM và quản lý Chart.js (Light Mode).
 */

/* ==========================================
   CHART.JS SETUP
   ========================================== */
let powerChart = null;
let envChart   = null;
const MAX_PTS  = 30;

const CHART_DEFAULTS = {
  responsive:          true,
  maintainAspectRatio: false,
  animation:           { duration: 300 },
  interaction:         { mode: 'index', intersect: false },
  plugins: {
    legend: {
      labels: { color: '#6B7280', font: { family: 'Inter', size: 11 }, boxWidth: 12 }
    },
    tooltip: {
      backgroundColor: '#1E293B',
      titleColor: '#F1F5F9',
      bodyColor: '#CBD5E1',
      padding: 8,
      cornerRadius: 4
    }
  },
  scales: {
    x: {
      ticks: { color: '#9CA3AF', font: { size: 10 }, maxTicksLimit: 6 },
      grid:  { color: '#F3F4F6' }
    },
    y: {
      ticks: { color: '#6B7280', font: { size: 10 } },
      grid:  { color: '#F3F4F6' }
    }
  }
};

function initCharts() {
  const ctxP = document.getElementById('powerChart');
  if (ctxP && !powerChart) {
    powerChart = new Chart(ctxP.getContext('2d'), {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: 'Active Power (kW)',
          data: [],
          borderColor: '#2563EB',
          backgroundColor: 'rgba(37,99,235,0.08)',
          borderWidth: 2,
          tension: 0.4,
          fill: true,
          pointRadius: 0,
          pointHoverRadius: 4
        }]
      },
      options: CHART_DEFAULTS
    });
  }

  const ctxE = document.getElementById('envChart');
  if (ctxE && !envChart) {
    envChart = new Chart(ctxE.getContext('2d'), {
      type: 'line',
      data: {
        labels: [],
        datasets: [
          {
            label: 'Nhiệt độ (°C)',
            data: [],
            borderColor:     '#D97706',
            backgroundColor: 'rgba(217,119,6,0.05)',
            borderWidth: 2,
            tension: 0.4,
            fill: true,
            pointRadius: 0,
            yAxisID: 'y'
          },
          {
            label: 'Bức xạ (W/m²)',
            data: [],
            borderColor:     '#10B981',
            borderWidth: 2,
            tension: 0.4,
            fill: false,
            pointRadius: 0,
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        ...CHART_DEFAULTS,
        scales: {
          ...CHART_DEFAULTS.scales,
          y1: {
            position: 'right',
            ticks: { color: '#10B981', font: { size: 10 } },
            grid: { drawOnChartArea: false }
          }
        }
      }
    });
  }
}

function pushToChart(chart, timeLabel, values) {
  if (!chart) return;
  chart.data.labels.push(timeLabel);
  if (chart.data.labels.length > MAX_PTS) chart.data.labels.shift();
  chart.data.datasets.forEach((ds, i) => {
    ds.data.push(values[i] ?? null);
    if (ds.data.length > MAX_PTS) ds.data.shift();
  });
  chart.update('none');
}

/* ==========================================
   UTILITIES
   ========================================== */
function startClock() {
  const el = document.getElementById('clock');
  if (!el) return;
  const tick = () => { el.textContent = new Date().toLocaleTimeString('vi-VN', { hour12: false }); };
  tick(); setInterval(tick, 1000);
}

function setWsBadge(state) {
  const dot   = document.getElementById('ws-dot');
  const label = document.getElementById('ws-label');
  if (!dot || !label) return;
  dot.className = 'ws-dot ' + state;
  label.textContent = { connecting: 'Connecting…', connected: 'Connected', disconnected: 'Offline' }[state] || state;
}

function fmt(v) {
  if (v == null) return null;
  const n = parseFloat(v);
  return isNaN(n) ? String(v) : n.toFixed(2);
}

function setVal(id, value) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = (value == null) ? '—' : value;
}

// Flash the parent metric-item card
function flashCard(valId) {
  const valEl = document.getElementById(valId);
  if (!valEl) return;
  const card = valEl.closest('.metric-item');
  if (!card) return;
  card.classList.remove('updated');
  void card.offsetWidth;
  card.classList.add('updated');
}

function setMetric(id, value) {
  const v = fmt(value);
  setVal(id, v);
  if (v !== null) flashCard(id);
}

/* ==========================================
   PIPELINE
   ========================================== */
function setPipelineStep(stepId, state) {
  const step  = document.getElementById(`step-${stepId}`);
  const badge = document.getElementById(`step-${stepId}-badge`);
  if (!step || !badge) return;
  step.className  = `p-step ${state}`;
  badge.className = `p-badge ${state}`;
  badge.textContent = state.toUpperCase();
}

/* ==========================================
   RAW DATA RENDERING
   ========================================== */
function renderRawData(payload) {
  const data    = payload.data || payload;
  const tsRaw   = payload.timestamp || data.time_iso || null;
  const tsLabel = tsRaw ? new Date(tsRaw).toLocaleTimeString('vi-VN', { hour12: false }) : new Date().toLocaleTimeString('vi-VN', { hour12: false });

  setVal('val-last-update', tsLabel);

  const sensors = data.vn_bhpp_sensorsdata || data.sensors || {};
  const meters  = data.vn_bhpp_metersdata  || data.meters  || {};

  // Environment sensors
  setMetric('r-amb1',  sensors.AmbientTemperature01);
  setMetric('r-amb2',  sensors.AmbientTemperature02);
  setMetric('r-panel', sensors.ModuleTemperature01);
  setMetric('r-irr1',  sensors.Irradiance01);
  setMetric('r-irr2',  sensors.Irradiance02);

  // Meter data
  setMetric('r-p-total',    meters.Meter01_ActivePowerTotal);
  setMetric('r-energy-con', meters.Meter01_ActiveEnergyReceived);
  setMetric('r-energy-del', meters.Meter01_ActiveEnergyDelivered);
  setMetric('r-cur-l1',     meters.Meter01_CurrentA);
  setMetric('r-cur-l2',     meters.Meter01_CurrentB);
  setMetric('r-cur-l3',     meters.Meter01_CurrentC);
  setMetric('r-v-l1l2',     meters.Meter01_VoltageAB);
  setMetric('r-q-total',    meters.Meter01_ReactivePowerTotal);

  // Charts
  const pwr = parseFloat(meters.Meter01_ActivePowerTotal);
  if (!isNaN(pwr)) pushToChart(powerChart, tsLabel, [pwr]);

  const temp = parseFloat(sensors.AmbientTemperature01);
  const irr  = parseFloat(sensors.Irradiance01);
  if (!isNaN(temp) || !isNaN(irr)) pushToChart(envChart, tsLabel, [isNaN(temp) ? null : temp, isNaN(irr) ? null : irr]);

  // Flash chart live badge
  const pb = document.getElementById('chart-power-badge');
  const eb = document.getElementById('chart-env-badge');
  if (pb) pb.className = 'status-badge ok';
  if (eb) eb.className = 'status-badge ok';

  // SCB
  renderScbChips(data.scb_by_device || data.scb_devices || {});

  setPipelineStep('influx', 'success');
}

function renderScbChips(scbByDev) {
  const c = document.getElementById('scb-overview');
  if (!c) return;
  const devs = Object.keys(scbByDev);
  if (!devs.length) {
    c.innerHTML = '<span style="color:var(--text-dim);font-size:.75rem">No SCB data</span>';
    return;
  }
  let online = 0;
  c.innerHTML = devs.sort().map(d => {
    const obj = scbByDev[d];
    const isOnline = obj && (obj.time || obj.time_iso);
    if (isOnline) online++;
    return `<span class="scb-chip${isOnline ? '' : ' offline'}">${isOnline ? '●' : '○'} ${d}</span>`;
  }).join('');
  const cnt = document.getElementById('scb-online-count');
  if (cnt) cnt.textContent = `${online}/${devs.length} Online`;
}

/* ==========================================
   FORMATTED DATA
   ========================================== */
function renderFormattedData(payload) {
  const data = payload.data || payload;
  const tags = data.tags || data.payload || [];

  const countEl = document.getElementById('json-tag-count');
  if (countEl) countEl.textContent = Array.isArray(tags) ? `${tags.length} tags` : '— tags';

  setPipelineStep('transform', 'success');

  // Auto-fill Metrics from tags if Raw was never sent
  if (Array.isArray(tags) && tags.length > 0) {
    const ps = {}, pm = {};
    tags.forEach(t => {
      if (!t?.name) return;
      const parts = String(t.name).split('.');
      if (parts.length >= 2) {
        const [cat, key] = [parts[0], parts[parts.length - 1]];
        if (cat === 'sensorsdata') ps[key] = t.value;
        if (cat === 'metersdata')  pm[key] = t.value;
      }
    });
    if (Object.keys(ps).length || Object.keys(pm).length) {
      renderRawData({ timestamp: payload.timestamp, data: { vn_bhpp_sensorsdata: ps, vn_bhpp_metersdata: pm } });
    }
  }

  // JSON viewer
  const viewer = document.getElementById('json-viewer');
  if (viewer) {
    viewer.innerHTML = `<pre style="white-space:pre-wrap;word-break:break-all;color:#374151">${JSON.stringify(data, null, 2)}</pre>`;
  }
}

/* ==========================================
   PUSH STATUS & HISTORY
   ========================================== */
const pushHistory = [];

function renderPushStatus(payload) {
  const data = payload.data || payload;
  let   code = data.status_code || data.http_code;
  if (!code && data.ok) code = 200;

  const isOk = code >= 200 && code < 300;

  // KPI card
  const kpiCard = document.getElementById('kpi-api');
  if (kpiCard) {
    kpiCard.className = `card kpi-card ${isOk ? 'ok' : 'err'}`;
  }
  setVal('val-push-status', code?.toString() || 'ERR');
  const sub = document.getElementById('kpi-api-sub');
  if (sub) sub.textContent = isOk ? 'Push thành công ✓' : 'Push thất bại ✗';

  if (data.latency_ms != null) setVal('val-latency', data.latency_ms);

  setPipelineStep('push', isOk ? 'success' : 'error');

  // History
  pushHistory.push({ ok: isOk, h: Math.floor(Math.random() * 28 + 10) });
  if (pushHistory.length > 20) pushHistory.shift();

  const phEl = document.getElementById('push-history');
  if (phEl) {
    const items = [...Array(20 - pushHistory.length).fill(null), ...pushHistory];
    phEl.innerHTML = items.map(it => {
      if (!it) return `<div class="bar idle" style="height:3px"></div>`;
      return `<div class="bar ${it.ok ? 'ok' : 'err'}" style="height:${it.h}px" title="${it.ok ? 'OK' : 'FAIL'}"></div>`;
    }).join('');

    const ok = pushHistory.filter(i => i.ok).length;
    const rate = document.getElementById('push-success-rate');
    if (rate) rate.textContent = `${Math.round(ok / pushHistory.length * 100)}% OK`;
  }

  appendLog(`Push ${isOk ? 'OK' : 'FAIL'} — HTTP ${code || 'N/A'}${data.latency_ms ? ` | ${data.latency_ms}ms` : ''}`, isOk ? 'success' : 'error');
}

/* ==========================================
   LOG
   ========================================== */
function appendLog(msg, level = 'info') {
  const c = document.getElementById('log-console');
  if (!c) return;
  const t = new Date().toLocaleTimeString('vi-VN', { hour12: false });
  const e = document.createElement('div');
  e.className = `log-item ${level}`;
  e.textContent = `[${t}] ${msg}`;
  c.prepend(e);
  while (c.children.length > 60) c.removeChild(c.lastChild);
}

/* ==========================================
   INIT
   ========================================== */
document.addEventListener('DOMContentLoaded', () => {
  initCharts();
  document.getElementById('btn-clear-log')?.addEventListener('click', () => {
    const c = document.getElementById('log-console');
    if (c) c.innerHTML = '';
    appendLog('Log cleared.', 'info');
  });
});

/* ==========================================
   EXPORTS (for main.js compatibility)
   ========================================== */
window.AppUI = {
  startClock,
  setWsBadge,
  appendLog,
  renderRawData,
  renderFormattedData,
  renderPushStatus,
  setVal,
  // stubs for backward compat
  initNav:             () => {},
  initJsonToolbar:     () => {},
  setLastFormattedData:() => {},
};

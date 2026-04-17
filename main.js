[
    {
        "id": "cd6944ec074d2725",
        "type": "tab",
        "label": "ISRAR SOLAR BINH HOA",
        "disabled": false,
        "info": "",
        "env": []
    },
    {
        "id": "inj_login",
        "type": "inject",
        "z": "cd6944ec074d2725",
        "name": "Login (test)",
        "props": [
            {
                "p": "payload"
            }
        ],
        "repeat": "300",
        "crontab": "",
        "once": false,
        "onceDelay": 0.1,
        "topic": "",
        "payload": "",
        "payloadType": "str",
        "x": 210,
        "y": 220,
        "wires": [
            [
                "fn_build_login_json"
            ]
        ]
    },
    {
        "id": "fn_build_login_json",
        "type": "function",
        "z": "cd6944ec074d2725",
        "name": "Build body login (JSON)",
        "func": "// Điền email/password ở đây\nconst email = \"raitek@issrar.com\";\nconst password = \"RaiTek@Wayu2468\";\n\n// Header đúng theo tài liệu\nmsg.headers = {\n    \"Content-Type\": \"application/x-www-form-urlencoded\"\n};\n\n// Body dạng x-www-form-urlencoded\nmsg.payload =\n    \"email=\"    + encodeURIComponent(email) +\n    \"&password=\"+ encodeURIComponent(password);\n\nreturn msg;\n",
        "outputs": 1,
        "timeout": 0,
        "noerr": 0,
        "initialize": "",
        "finalize": "",
        "libs": [],
        "x": 450,
        "y": 220,
        "wires": [
            [
                "http_login"
            ]
        ]
    },
    {
        "id": "http_login",
        "type": "http request",
        "z": "cd6944ec074d2725",
        "name": "POST /api/login",
        "method": "POST",
        "ret": "obj",
        "paytoqs": "ignore",
        "url": "https://api.issrar.app/auth/login/",
        "tls": "",
        "persist": false,
        "proxy": "",
        "insecureHTTPParser": false,
        "authType": "",
        "senderr": true,
        "headers": [],
        "x": 690,
        "y": 220,
        "wires": [
            [
                "dbg_login_resp",
                "fn_save_token"
            ]
        ]
    },
    {
        "id": "dbg_login_resp",
        "type": "debug",
        "z": "cd6944ec074d2725",
        "name": "Login response",
        "active": false,
        "tosidebar": true,
        "console": false,
        "tostatus": false,
        "complete": "payload",
        "targetType": "msg",
        "statusVal": "",
        "statusType": "auto",
        "x": 920,
        "y": 180,
        "wires": []
    },
    {
        "id": "fn_save_token",
        "type": "function",
        "z": "cd6944ec074d2725",
        "name": "Lưu token vào flow",
        "func": "// Tự động bắt các field thường gặp\nlet p = msg.payload || {};\nlet token = p.token || p.access_token || p.jwt || (p.data && (p.data.token || p.data.access_token || p.data.jwt));\n\nif (!token && typeof p === 'string') {\n  try { const o = JSON.parse(p); token = o.token || o.access_token || o.jwt; } catch(e){}\n}\n\nif (!token) {\n  node.error(\"Không tìm thấy token trong response\", msg);\n  return null;\n}\n\nflow.set(\"issrar_token\", token);\n\n// (tuỳ chọn) parse exp nếu là JWT để xem hết hạn\ntry {\n  const parts = token.split('.');\n  if (parts.length === 3) {\n    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());\n    if (payload.exp) msg.token_exp = new Date(payload.exp * 1000).toISOString();\n  }\n} catch(e){}\n\nmsg.payload = { ok: true, saved: true, tokenPreview: token.slice(0,16) + \"...\" , exp: msg.token_exp };\nreturn msg;",
        "outputs": 1,
        "timeout": 0,
        "noerr": 0,
        "initialize": "",
        "finalize": "",
        "libs": [],
        "x": 940,
        "y": 220,
        "wires": [
            [
                "dbg_saved",
                "fn_auth_header"
            ]
        ]
    },
    {
        "id": "dbg_saved",
        "type": "debug",
        "z": "cd6944ec074d2725",
        "name": "Đã lưu token",
        "active": false,
        "tosidebar": true,
        "console": false,
        "tostatus": false,
        "complete": "payload",
        "targetType": "msg",
        "statusVal": "",
        "statusType": "auto",
        "x": 1150,
        "y": 220,
        "wires": []
    },
    {
        "id": "fn_auth_header",
        "type": "function",
        "z": "cd6944ec074d2725",
        "name": "Add Authorization: Bearer <token>",
        "func": "const token = flow.get(\"issrar_token\");\nif (!token) {\n  node.error(\"Chưa có token trong flow. Hãy chạy bước login để lưu flow.issrar_token trước.\");\n  return null;\n}\nmsg.headers = Object.assign({}, msg.headers, {\n  Authorization: `Bearer ${token}`,\n  Accept: \"application/json\"\n});\n// Không gửi body cho GET\nmsg.payload = undefined;\nreturn msg;",
        "outputs": 1,
        "timeout": 0,
        "noerr": 0,
        "initialize": "",
        "finalize": "",
        "libs": [],
        "x": 520,
        "y": 340,
        "wires": [
            [
                "http_me"
            ]
        ]
    },
    {
        "id": "http_me",
        "type": "http request",
        "z": "cd6944ec074d2725",
        "name": "GET /api/user",
        "method": "GET",
        "ret": "obj",
        "paytoqs": "ignore",
        "url": "https://api.issrar.app/api/user",
        "tls": "",
        "persist": false,
        "proxy": "",
        "insecureHTTPParser": false,
        "authType": "",
        "senderr": true,
        "headers": [],
        "x": 700,
        "y": 420,
        "wires": [
            [
                "dbg_user",
                "a3ac92f99bf3c59b",
                "a55ad0202eb9c2a9",
                "4bf845b1062616d1",
                "4c739b78a4c6dd15"
            ]
        ]
    },
    {
        "id": "dbg_user",
        "type": "debug",
        "z": "cd6944ec074d2725",
        "name": "User response",
        "active": false,
        "tosidebar": true,
        "console": false,
        "tostatus": false,
        "complete": "payload",
        "targetType": "msg",
        "statusVal": "",
        "statusType": "auto",
        "x": 1080,
        "y": 360,
        "wires": []
    },
    {
        "id": "a3ac92f99bf3c59b",
        "type": "function",
        "z": "cd6944ec074d2725",
        "name": "Build query meter_data (latest 5m)",
        "func": "msg.query = \"SELECT * FROM \\\"meter_data\\\" WHERE time >= now() - 5m ORDER BY time DESC LIMIT 1\";\nreturn msg;",
        "outputs": 1,
        "timeout": "",
        "noerr": 0,
        "initialize": "",
        "finalize": "",
        "libs": [],
        "x": 1120,
        "y": 520,
        "wires": [
            [
                "703354a2d7571f74"
            ]
        ]
    },
    {
        "id": "703354a2d7571f74",
        "type": "influxdb in",
        "z": "cd6944ec074d2725",
        "influxdb": "a015f1bc98a32e1e",
        "name": "Influx 1.x",
        "query": "",
        "rawOutput": false,
        "precision": "ms",
        "retentionPolicy": "",
        "org": "",
        "x": 1400,
        "y": 520,
        "wires": [
            [
                "8ded5c56b288e13e"
            ]
        ]
    },
    {
        "id": "8ded5c56b288e13e",
        "type": "function",
        "z": "cd6944ec074d2725",
        "name": "Save meter_data → flow.set(<field>)",
        "func": "// Helper: lấy 1 row từ payload\nfunction pickRow(payload) {\n  if (Array.isArray(payload)) {\n    const first = payload[0];\n    if (first && !first.columns && !first.values) return first; // đã là object field\n    if (first && first.columns && first.values && first.values[0]) {\n      const row = {}; first.columns.forEach((c,i)=> row[c] = first.values[0][i]);\n      return row;\n    }\n  }\n  if (payload && typeof payload === 'object' && payload.time) return payload;\n  return null;\n}\n\nconst row = pickRow(msg.payload);\n\nconst KEYS = [\n  'Energy_Consumed_Total_kWh',\n  'Energy_Delivered_Total_kWh',\n  'Energy_Reactive_Cap_Total_kvarh',\n  'Energy_Reactive_Ind_Total_kvarh',\n  'Current_L1','Current_L2','Current_L3',\n  'Voltage_L1_L2','Voltage_L2_L3','Voltage_L3_L1',\n  'Voltage_L2_N','Voltage_L3_N',\n  'Power_L1_kW','Power_L2_kW','Power_L3_kW','Power_Total_kW'\n];\n\n// Chuẩn hoá time/time_iso\nlet time_iso = null;\nif (row && row.time) {\n  time_iso = (typeof row.time === 'number') ? new Date(row.time).toISOString() : row.time;\n}\nflow.set('time_meter', row ? (row.time || null) : null);\nflow.set('time_meter_iso', time_iso);\n// (tuỳ chọn) time chung\nflow.set('time', row ? (row.time || null) : null);\nflow.set('time_iso', time_iso);\n\n// Lưu từng field đúng tên\nKEYS.forEach(k => flow.set(k, row ? (row[k] ?? null) : null));\n\nmsg.payload = { saved: 'meter_data', count: KEYS.length, time_iso };\nreturn msg;",
        "outputs": 1,
        "timeout": "",
        "noerr": 0,
        "initialize": "",
        "finalize": "",
        "libs": [],
        "x": 1680,
        "y": 520,
        "wires": [
            [
                "c1aab489d134f2c4",
                "003351b353afa41c"
            ]
        ]
    },
    {
        "id": "c1aab489d134f2c4",
        "type": "debug",
        "z": "cd6944ec074d2725",
        "name": "Đã lưu meter → flow",
        "active": false,
        "tosidebar": true,
        "console": false,
        "tostatus": false,
        "complete": "payload",
        "targetType": "msg",
        "statusVal": "",
        "statusType": "auto",
        "x": 1680,
        "y": 440,
        "wires": []
    },
    {
        "id": "a55ad0202eb9c2a9",
        "type": "function",
        "z": "cd6944ec074d2725",
        "name": "Build query solar_station_data (latest 5m)",
        "func": "msg.query = \"SELECT * FROM \\\"solar_station_data\\\" WHERE time >= now() - 5m ORDER BY time DESC LIMIT 1\";\nreturn msg;",
        "outputs": 1,
        "timeout": "",
        "noerr": 0,
        "initialize": "",
        "finalize": "",
        "libs": [],
        "x": 1070,
        "y": 680,
        "wires": [
            [
                "5cdb432002652a71"
            ]
        ]
    },
    {
        "id": "5cdb432002652a71",
        "type": "influxdb in",
        "z": "cd6944ec074d2725",
        "influxdb": "a015f1bc98a32e1e",
        "name": "Influx 1.x",
        "query": "",
        "rawOutput": false,
        "precision": "ms",
        "retentionPolicy": "",
        "org": "",
        "x": 1340,
        "y": 680,
        "wires": [
            [
                "dd1663aa9226868a"
            ]
        ]
    },
    {
        "id": "dd1663aa9226868a",
        "type": "function",
        "z": "cd6944ec074d2725",
        "name": "Save solar_station_data → flow.set(<field>)",
        "func": "// Helper: lấy 1 row từ payload\nfunction pickRow(payload) {\n  if (Array.isArray(payload)) {\n    const first = payload[0];\n    if (first && !first.columns && !first.values) return first; // đã là object field\n    if (first && first.columns && first.values && first.values[0]) {\n      const row = {}; first.columns.forEach((c,i)=> row[c] = first.values[0][i]);\n      return row;\n    }\n  }\n  if (payload && typeof payload === 'object' && payload.time) return payload;\n  return null;\n}\n\nconst row = pickRow(msg.payload);\n\nconst KEYS = [\n  'Sensor_Temperature1',\n  'Sensor_Temperature2',\n  'Panel_Temperature',\n  'Radiation1',\n  'Radiation2'\n];\n\nlet time_iso = null;\nif (row && row.time) {\n  time_iso = (typeof row.time === 'number') ? new Date(row.time).toISOString() : row.time;\n}\nflow.set('time_station', row ? (row.time || null) : null);\nflow.set('time_station_iso', time_iso);\n\nKEYS.forEach(k => flow.set(k, row ? (row[k] ?? null) : null));\n\nmsg.payload = { saved: 'solar_station_data', count: KEYS.length, time_iso };\nreturn msg;",
        "outputs": 1,
        "timeout": "",
        "noerr": 0,
        "initialize": "",
        "finalize": "",
        "libs": [],
        "x": 1630,
        "y": 680,
        "wires": [
            [
                "147bbf2a65df83cc",
                "003351b353afa41c"
            ]
        ]
    },
    {
        "id": "147bbf2a65df83cc",
        "type": "debug",
        "z": "cd6944ec074d2725",
        "name": "Đã lưu station → flow",
        "active": true,
        "tosidebar": true,
        "console": false,
        "tostatus": false,
        "complete": "payload",
        "targetType": "msg",
        "statusVal": "",
        "statusType": "auto",
        "x": 1660,
        "y": 760,
        "wires": []
    },
    {
        "id": "003351b353afa41c",
        "type": "function",
        "z": "cd6944ec074d2725",
        "name": "Xem nhanh biến flow.*",
        "func": "// ==== base fields giữ nguyên như cũ ====\nconst NAMES = [\n  // station\n  'Sensor_Temperature1','Sensor_Temperature2','Panel_Temperature','Radiation1','Radiation2',\n  // meter\n  'Energy_Consumed_Total_kWh','Energy_Delivered_Total_kWh','Energy_Reactive_Cap_Total_kvarh','Energy_Reactive_Ind_Total_kvarh',\n  'Current_L1','Current_L2','Current_L3',\n  'Voltage_L1_L2','Voltage_L2_L3','Voltage_L3_L1','Voltage_L2_N','Voltage_L3_N',\n  'Power_L1_kW','Power_L2_kW','Power_L3_kW','Power_Total_kW',\n  // times\n  'time_meter','time_meter_iso','time_station','time_station_iso','time','time_iso'\n];\n\nconst out = {};\nNAMES.forEach(k => out[k] = flow.get(k));\n\n// ==== SCB (đa thiết bị hoặc đơn thiết bị) ====\nconst scbByDev = flow.get('scb_by_device'); // { S01:{Str01..Str32,Voltage,time,time_iso}, ...}\nif (scbByDev && typeof scbByDev === 'object') {\n  const keysStr = Array.from({length:32}, (_,i)=> `Str${String(i+1).padStart(2,'0')}`);\n  const keysAll = [...keysStr, 'Voltage', 'time', 'time_iso'];\n\n  // 1) Giữ nguyên theo device S01..S40 (như cũ)\n  const result = {};\n  Object.keys(scbByDev).sort().forEach(dev => {\n    const src = scbByDev[dev] || {};\n    const o = {}; keysAll.forEach(k => o[k] = (src[k] ?? null));\n    result[dev] = o;\n  });\n  out.scb_devices = result;\n  out.scb_device_count = Object.keys(result).length;\n\n  // 2) View đã remap theo inverter: InvXX → SCB01..SCB08\n  function pad2(n){ n = Number(n)||0; return n<10?`0${n}`:`${n}`; }\n  const grouped = {}; // {Inv01:{SCB01:{...}}, ...}\n\n  Object.keys(scbByDev).forEach(dev=>{\n    const num = parseInt(dev.slice(1),10);          // 1..40\n    const invIdx = Math.floor((num-1)/8)+1;         // 1..5\n    const scbIdx = ((num-1)%8)+1;                   // 1..8  (RESET mỗi inverter)\n    const invXX = `Inv${pad2(invIdx)}`;\n    const scbYY = `SCB${pad2(scbIdx)}`;\n    const src = scbByDev[dev] || {};\n    const o = {}; keysAll.forEach(k => o[k] = (src[k] ?? null));\n    if (!grouped[invXX]) grouped[invXX] = {};\n    grouped[invXX][scbYY] = o;\n  });\n\n  out.scb_by_inverter = grouped; // Dạng đã reset SCB 01..08 cho từng Inv\n} else {\n  // Đơn thiết bị (phẳng)\n  const STRS = Array.from({length:32}, (_,i)=> `Str${String(i+1).padStart(2,'0')}`);\n  STRS.forEach(k => out[k] = flow.get(k));\n  out['Voltage']      = flow.get('Voltage');\n  out['time_scb']     = flow.get('time_scb');\n  out['time_scb_iso'] = flow.get('time_scb_iso');\n}\n\nmsg.payload = out;\nreturn msg;\n",
        "outputs": 1,
        "timeout": "",
        "noerr": 0,
        "initialize": "",
        "finalize": "",
        "libs": [],
        "x": 2080,
        "y": 680,
        "wires": [
            [
                "04df36c32461c015",
                "fn_build_from_cache"
            ]
        ]
    },
    {
        "id": "04df36c32461c015",
        "type": "debug",
        "z": "cd6944ec074d2725",
        "name": "Preview biến flow.*",
        "active": true,
        "tosidebar": true,
        "console": false,
        "tostatus": false,
        "complete": "payload",
        "targetType": "msg",
        "x": 2450,
        "y": 740,
        "wires": []
    },
    {
        "id": "fn_build_from_cache",
        "type": "function",
        "z": "cd6944ec074d2725",
        "name": "Build vn_bhpp_* từ flow context",
        "func": "/***** helpers *****/\nconst g = (k) => flow.get(k);\nconst num = (v) => (v === null || v === undefined || v === \"\")\n  ? null : (typeof v === \"number\" ? v : (isFinite(+v) ? +v : null));\nfunction appPowerKV(ACT_kW, cosphi) {\n  ACT_kW = num(ACT_kW); cosphi = num(cosphi);\n  if (ACT_kW === null || cosphi === null || cosphi === 0) return null;\n  return Math.abs(ACT_kW / cosphi);\n}\nfunction avgNonNull(arr) { const vals = arr.map(num).filter(v => v !== null); return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null; }\nfunction pad2(n) { n = Number(n) || 0; return n < 10 ? `0${n}` : `${n}`; }\nfunction sumNonNull(arr) { return arr.map(num).filter(v => v !== null).reduce((a, b) => a + b, 0); }\nfunction pushTag(arr, name, type, value, unit) {\n  const v = num(value); if (v === null) return;\n  arr.push({ name, type, value: v, unit: unit || \"\", scale: \"1.0\" });\n}\n\n/* ---------- SENSORS ---------- */\nconst sensors = {\n  AmbientTemperature01: num(g(\"Sensor_Temperature1\")),\n  AmbientTemperature02: num(g(\"Sensor_Temperature2\")),\n  ModuleTemperature01: num(g(\"Panel_Temperature\")),\n  ModuleTemperature02: null,\n  Irradiance01: num(g(\"Radiation1\")),\n  Irradiance02: num(g(\"Radiation2\")),\n  //time_station: g(\"time_station_iso\") || g(\"time_station\") || null\n};\n\n/* ---------- METERS ---------- */\nconst P_A = num(g(\"Power_L1_kW\"));\nconst P_B = num(g(\"Power_L2_kW\"));\nconst P_C = num(g(\"Power_L3_kW\"));\nconst CosPhi_L1 = num(g(\"CosPhi_L1\"));\nconst CosPhi_L2 = num(g(\"CosPhi_L2\"));\nconst CosPhi_L3 = num(g(\"CosPhi_L3\"));\n\nconst apA = appPowerKV(P_A, CosPhi_L1);\nconst apB = appPowerKV(P_B, CosPhi_L2);\nconst apC = appPowerKV(P_C, CosPhi_L3);\n\nconst apFromCache = num(g(\"ApparentPower_Total_kVA\"));\nconst parts = [apA, apB, apC].filter(v => v !== null);\nconst apSum = parts.length ? parts.reduce((a, b) => a + b, 0) : null;\nconst apTotal = (apFromCache !== null && apFromCache !== undefined) ? apFromCache : apSum;\n\nconst meters = {\n  Meter01_ActiveEnergyReceived: num(g(\"Energy_Consumed_Total_kWh\")),\n  Meter01_ActiveEnergyDelivered: num(g(\"Energy_Delivered_Total_kWh\")),\n  Meter01_ReactiveEnergyDelivered: -num(g(\"Energy_Reactive_Cap_Total_kvarh\")),\n  Meter01_ReactiveEnergyReceived: -num(g(\"Energy_Reactive_Ind_Total_kvarh\")),\n  Meter01_CurrentA: num(g(\"Current_L1\")),\n  Meter01_CurrentB: num(g(\"Current_L2\")),\n  Meter01_CurrentC: num(g(\"Current_L3\")),\n  Meter01_VoltageAB: num(g(\"Voltage_L1_L2\")),\n  Meter01_VoltageBC: num(g(\"Voltage_L2_L3\")),\n  Meter01_VoltageCA: num(g(\"Voltage_L3_L1\")),\n  Meter01_VoltageBN: num(g(\"Voltage_L2_N\")),\n  Meter01_VoltageCN: num(g(\"Voltage_L3_N\")),\n  Meter01_ActivePowerA: -P_A,\n  Meter01_ActivePowerB: -P_B,\n  Meter01_ActivePowerC: -P_C,\n  Meter01_ActivePowerTotal: -num(g(\"Power_Total_kW\")),\n  Meter01_ReactivePowerTotal: -num(g(\"ReactivePower_Total_kvar\")),\n  Meter01_ApparentPowerA: apA,\n  Meter01_ApparentPowerB: apB,\n  Meter01_ApparentPowerC: apC,\n  Meter01_ApparentPowerTotal: apTotal,\n  Meter01_PowerFactorTotal: avgNonNull([CosPhi_L1, CosPhi_L2, CosPhi_L3]),\n  Meter01_Frequency: num(g(\"Frequency\")),\n  //time_meter: g(\"time_meter_iso\") || g(\"time_meter\") || null\n};\n\n/* ---------- SCB 40 thiết bị (reset 8/Inv) ---------- */\nconst scbByDev = flow.get('scb_by_device') || {};\nconst expected = Array.from({ length: 40 }, (_, i) => `S${pad2(i + 1)}`);\nconst scb_tags = [];\n\nfor (const dev of expected) {\n  const m = scbByDev[dev];\n  if (!m) continue;\n\n  const devNum = parseInt(dev.slice(1), 10);          // 1..40\n  const invIdx = Math.floor((devNum - 1) / 8) + 1;   // 1..5\n  const scbIdx = ((devNum - 1) % 8) + 1;             // 1..8\n  const invXX = pad2(invIdx);\n  const scbYY = pad2(scbIdx);\n\n  const table = `inv${invXX}scb${scbYY}data`;\n  const base = `Inv${invXX}_SCB${scbYY}`;\n\n  const currents = [];\n  for (let z = 1; z <= 32; z++) {\n    const key = `Str${pad2(z)}`;\n    const cur = num(m[key]);\n    currents.push(cur);\n    pushTag(scb_tags, `${table}.${base}_St${pad2(z)}_Current`, \"float\", cur, \"A\");\n  }\n\n  const V = num(m.Voltage);\n  pushTag(scb_tags, `${table}.${base}_Voltage`, \"float\", V, \"V\");\n\n  const I_sum = sumNonNull(currents);\n  const P = (V !== null && I_sum !== null) ? (I_sum * V) : null;\n  pushTag(scb_tags, `${table}.${base}_Power`, \"float\", P, \"W\");\n}\n\n/* ---------- INVERTER (build như hiện có) ---------- */\nlet inverter_tags = flow.get('vn_bhpp_inverter_tags');\nif (!Array.isArray(inverter_tags) || inverter_tags.length === 0) {\n  const invMap = flow.get('inv_pacq') || {}; // {Inv01:{Pdc_kW, Pac_kW, Q_kVAr, PF_used, Idc_A}, ...}\n  inverter_tags = [];\n  for (let i = 1; i <= 5; i++) {\n    const key = `Inv${pad2(i)}`;\n    const it = invMap[key] || {};\n    const table = `vn_bhpp_inverter${pad2(i)}data`;\n    pushTag(inverter_tags, `${table}.${key}_TotalInputPower`, \"float\", num(it.Pdc_kW), \"kW\");\n    pushTag(inverter_tags, `${table}.${key}_ActivePower`, \"float\", num(it.Pac_kW), \"kW\");\n    pushTag(inverter_tags, `${table}.${key}_ReactivePower`, \"float\", num(it.Q_kVAr), \"kVAr\");\n    pushTag(inverter_tags, `${table}.${key}_RealTimePowerFactor`, \"float\", num(it.PF_used), \"\");\n    pushTag(inverter_tags, `${table}.${key}_DCCurrent`, \"float\", num(it.Idc_A), \"A\");\n  }\n}\n\n/* ---------- PATCH GỬI ĐI ----------\n   Giữ tên trường là `vn_bhpp_inverter_tags`,\n   nhưng sửa name bên trong: bỏ tiền tố `vn_bhpp_` */\nflow.set(\"vn_bhpp_inverter_tags_raw\", inverter_tags); // (tuỳ chọn) lưu bản gốc\n\nconst inverter_tags_send = (inverter_tags || []).map(t => ({\n  ...t,\n  name: String(t.name || '').replace(/^vn_bhpp_/, '')\n}));\n// ví dụ: vn_bhpp_inverter01data.Inv01_ActivePower -> inverter01data.Inv01_ActivePower\n\n/* ---------- Lưu & trả ra ---------- */\nflow.set(\"vn_bhpp_sensorsdata\", sensors);\nflow.set(\"vn_bhpp_metersdata\", meters);\nflow.set(\"vn_bhpp_scb_tags\", scb_tags);\nflow.set(\"vn_bhpp_inverter_tags\", inverter_tags_send); // bản sẽ dùng để GỬI\n\nmsg.payload = {\n  vn_bhpp_sensorsdata: sensors,\n  vn_bhpp_metersdata: meters,\n  vn_bhpp_scb_tags: scb_tags,\n  vn_bhpp_inverter_tags: inverter_tags_send  // GIỮ TÊN TRƯỜNG, NAME ĐÃ BỎ PREFIX\n  // nếu cần kèm bản gốc để debug:\n  // , vn_bhpp_inverter_tags_raw: inverter_tags\n};\nreturn msg;\n",
        "outputs": 1,
        "timeout": 0,
        "noerr": 0,
        "initialize": "",
        "finalize": "",
        "libs": [],
        "x": 2410,
        "y": 680,
        "wires": [
            [
                "dbg_view_payload",
                "fn_build_and_post"
            ]
        ]
    },
    {
        "id": "dbg_view_payload",
        "type": "debug",
        "z": "cd6944ec074d2725",
        "name": "Xem object xuất ra",
        "active": false,
        "tosidebar": true,
        "complete": "payload",
        "targetType": "msg",
        "x": 2710,
        "y": 560,
        "wires": []
    },
    {
        "id": "fn_build_and_post",
        "type": "function",
        "z": "cd6944ec074d2725",
        "name": "Build sensors/meters → payload + headers",
        "func": "// ===== cấu hình chung =====\nconst BASE_URL = \"https://api.issrar.app\";\nconst ENDPOINT = \"/Ingest/store-dataOfProjects\";\nconst ProjectPrefix = \"vn_bhpp\";\nconst Country = \"Vietnam\";\nconst Client = \"RAITEK\";\n\n// ===== helpers =====\nconst g = (k) => flow.get(k);\nconst num = (v) => (v === null || v === undefined || v === \"\")\n  ? null : (typeof v === \"number\" ? v : (isFinite(+v) ? +v : null));\n\nfunction appPowerKV(ACT_kW, cosphi) {\n  ACT_kW = num(ACT_kW); cosphi = num(cosphi);\n  if (ACT_kW === null || cosphi === null || cosphi === 0) return null;\n  return Math.abs(ACT_kW / cosphi);\n}\nfunction avgNonNull(arr) {\n  const vals = arr.map(num).filter(v => v !== null);\n  return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;\n}\n// đặt ngay phía trên nơi bạn đang gọi toUtcMinute(ts)\nfunction pad(n) { return (n < 10 ? '0' : '') + n; }\nfunction toUtcMinute(ts) {\n  // Trả về time dạng yyyy-MM-dd HH:mm:00\n  let d = ts ? new Date(ts) : new Date();\n  if (isNaN(d)) d = new Date();\n  const v = new Date(d.getTime() + 7 * 60 * 60 * 1000); // dịch +7h\n  const y = v.getUTCFullYear(), m = pad(v.getUTCMonth() + 1), day = pad(v.getUTCDate());\n  const hh = pad(v.getUTCHours()), mm = pad(v.getUTCMinutes());\n  return `${y}-${m}-${day} ${hh}:${mm}:00`;\n}\n\n// !!! value bắt buộc là STRING\nfunction pushTag(tags, name, type, value, unit, scale) {\n  const v = num(value); if (v === null) return;\n  tags.push({\n    name,\n    type,\n    value: String(v),           // <<<<<<<<<<<<<<  BẮT BUỘC STRING\n    scale: scale || \"1.0\",\n    unit: unit || \"\"\n  });\n}\n\nfunction unitForMeter(key) {\n  if (/ActiveEnergy/.test(key)) return \"kWh\";\n  if (/ReactiveEnergy/.test(key)) return \"kvarh\";\n  if (/Current[ABC]$/.test(key)) return \"A\";\n  if (/Voltage(AB|BC|CA|BN|CN)$/.test(key)) return \"V\";\n  if (/ActivePower/.test(key)) return \"kW\";\n  if (/ReactivePower/.test(key)) return \"kvar\";\n  if (/ApparentPower/.test(key)) return \"kVA\";\n  if (/PowerFactor/.test(key)) return \"\";\n  if (/Frequency/.test(key)) return \"Hz\";\n  return \"\";\n}\n\n// ===== lấy token =====\nconst token = flow.get(\"issrar_token\");\nif (!token) { node.error(\"Thiếu issrar_token trong flow context\"); return null; }\n\n// ===== sensors / meters: lấy từ payload trước, thiếu thì lấy từ flow =====\nlet sensors = (msg.payload && msg.payload.vn_bhpp_sensorsdata) || flow.get(\"vn_bhpp_sensorsdata\");\nlet meters = (msg.payload && msg.payload.vn_bhpp_metersdata) || flow.get(\"vn_bhpp_metersdata\");\n\nif (!sensors) {\n  sensors = {\n    AmbientTemperature01: num(g(\"Sensor_Temperature1\")),\n    AmbientTemperature02: num(g(\"Sensor_Temperature2\")),\n    ModuleTemperature01: num(g(\"Panel_Temperature\")),\n    ModuleTemperature02: null,\n    Irradiance01: num(g(\"Radiation1\")),\n    Irradiance02: num(g(\"Radiation2\")),\n    time_station: g(\"time_station_iso\") || g(\"time_station\") || null\n  };\n}\n\nif (!meters) {\n  const P_A = num(g(\"Power_L1_kW\"));\n  const P_B = num(g(\"Power_L2_kW\"));\n  const P_C = num(g(\"Power_L3_kW\"));\n  const CosPhi_L1 = num(g(\"CosPhi_L1\"));\n  const CosPhi_L2 = num(g(\"CosPhi_L2\"));\n  const CosPhi_L3 = num(g(\"CosPhi_L3\"));\n\n  const apA = appPowerKV(P_A, CosPhi_L1);\n  const apB = appPowerKV(P_B, CosPhi_L2);\n  const apC = appPowerKV(P_C, CosPhi_L3);\n  const apFromCache = num(g(\"ApparentPower_Total_kVA\"));\n  const parts = [apA, apB, apC].filter(v => v !== null);\n  const apSum = parts.length ? parts.reduce((a, b) => a + b, 0) : null;\n  const apTotal = (apFromCache !== null && apFromCache !== undefined) ? apFromCache : apSum;\n\n  meters = {\n    Meter01_ActiveEnergyReceived: num(g(\"Energy_Consumed_Total_kWh\")),\n    Meter01_ActiveEnergyDelivered: num(g(\"Energy_Delivered_Total_kWh\")),\n    Meter01_ReactiveEnergyDelivered: num(g(\"Energy_Reactive_Cap_Total_kvarh\")),\n    Meter01_ReactiveEnergyReceived: num(g(\"Energy_Reactive_Ind_Total_kvarh\")),\n\n    Meter01_CurrentA: num(g(\"Current_L1\")),\n    Meter01_CurrentB: num(g(\"Current_L2\")),\n    Meter01_CurrentC: num(g(\"Current_L3\")),\n\n    Meter01_VoltageAB: num(g(\"Voltage_L1_L2\")),\n    Meter01_VoltageBC: num(g(\"Voltage_L2_L3\")),\n    Meter01_VoltageCA: num(g(\"Voltage_L3_L1\")),\n    Meter01_VoltageBN: num(g(\"Voltage_L2_N\")),\n    Meter01_VoltageCN: num(g(\"Voltage_L3_N\")),\n\n    Meter01_ActivePowerA: P_A,\n    Meter01_ActivePowerB: P_B,\n    Meter01_ActivePowerC: P_C,\n    Meter01_ActivePowerTotal: num(g(\"Power_Total_kW\")),\n\n    Meter01_ReactivePowerTotal: num(g(\"ReactivePower_Total_kvar\")),\n\n    Meter01_ApparentPowerA: apA,\n    Meter01_ApparentPowerB: apB,\n    Meter01_ApparentPowerC: apC,\n    Meter01_ApparentPowerTotal: apTotal,\n\n    Meter01_PowerFactorTotal: avgNonNull([CosPhi_L1, CosPhi_L2, CosPhi_L3]),\n    Meter01_Frequency: num(g(\"Frequency\"))\n  };\n}\n\n// Lưu lại vào flow\nflow.set(\"vn_bhpp_sensorsdata\", sensors);\nflow.set(\"vn_bhpp_metersdata\", meters);\n\n// ===== build tags theo tài liệu =====\nconst tags = [];\n\n// sensors\npushTag(tags, \"sensorsdata.AmbientTemperature01\", \"float\", sensors.AmbientTemperature01, \"°C\");\npushTag(tags, \"sensorsdata.AmbientTemperature02\", \"float\", sensors.AmbientTemperature02, \"°C\");\npushTag(tags, \"sensorsdata.ModuleTemperature01\", \"float\", sensors.ModuleTemperature01, \"°C\");\npushTag(tags, \"sensorsdata.ModuleTemperature02\", \"float\", sensors.ModuleTemperature02, \"°C\");\npushTag(tags, \"sensorsdata.Irradiance01\", \"float\", sensors.Irradiance01, \"W/m2\");\npushTag(tags, \"sensorsdata.Irradiance02\", \"float\", sensors.Irradiance02, \"W/m2\");\n\n// meters — duyệt tất cả key hiện có\nObject.keys(meters).forEach(k => {\n  const unit = unitForMeter(k);\n  pushTag(tags, `metersdata.${k}`, \"float\", meters[k], unit);\n});\n\n// ===== SCB tags =====\nconst scb_tags = flow.get(\"vn_bhpp_scb_tags\") || [];\nif (Array.isArray(scb_tags) && scb_tags.length) {\n  scb_tags.forEach(t => {\n    if (t && t.name && t.type && (t.value != null)) {\n      tags.push({\n        name: t.name,\n        type: t.type,\n        value: String(num(t.value)),      // ép string\n        scale: t.scale || \"1.0\",\n        unit: t.unit || \"\"\n      });\n    }\n  });\n}\n\n// ===== INVERTER tags =====\nlet inverter_tags = flow.get(\"vn_bhpp_inverter_tags\") || [];\nconst stripInvName = n =>\n  (typeof n === 'string')\n    ? n.replace(/^vn_bhpp_inverter/, 'inverter').replace(/^vn_bhpp_/, '')\n    : n;\n\nif (Array.isArray(inverter_tags) && inverter_tags.length) {\n  inverter_tags = inverter_tags\n    .filter(t => t && t.name && t.type && (t.value != null))\n    .map(t => ({\n      name: stripInvName(t.name),\n      type: t.type,\n      value: String(num(t.value)),       // ép string\n      scale: t.scale || \"1.0\",\n      unit: t.unit || \"\"\n    }));\n} else {\n  const invMap = flow.get('inv_pacq') || {};\n  inverter_tags = [];\n  for (let i = 1; i <= 5; i++) {\n    const XX = (i < 10 ? '0' : '') + i;\n    const key = `Inv${XX}`;\n    const it = invMap[key] || {};\n    const table = `inverter${XX}data`;\n\n    pushTag(inverter_tags, `${table}.${key}_TotalInputPower`, \"float\", num(it.Pdc_kW), \"kW\");\n    pushTag(inverter_tags, `${table}.${key}_ActivePower`, \"float\", num(it.Pac_kW), \"kW\");\n    pushTag(inverter_tags, `${table}.${key}_ReactivePower`, \"float\", num(it.Q_kVAr), \"kVAr\");\n    pushTag(inverter_tags, `${table}.${key}_RealTimePowerFactor`, \"float\", num(it.PF_used), \"\");\n    pushTag(inverter_tags, `${table}.${key}_DCCurrent`, \"float\", num(it.Idc_A), \"A\");\n  }\n}\ninverter_tags.forEach(t => { if (t && t.name && t.type && (t.value != null)) tags.push(t); });\n\n// ===== TimeStamp =====\nlet ts = flow.get(\"time_station_iso\") || sensors.time_station || null;\nconst scb_by_device = flow.get(\"scb_by_device\");\nif (!ts && scb_by_device && typeof scb_by_device === 'object') {\n  let latest = null;\n  Object.values(scb_by_device).forEach(o => {\n    const t = o && (o.time_iso || o.time);\n    if (t) {\n      const iso = typeof t === 'number' ? new Date(t).toISOString() : t;\n      if (!latest || new Date(iso) > new Date(latest)) latest = iso;\n    }\n  });\n  ts = latest || new Date().toISOString();\n}\nif (!ts) ts = new Date().toISOString();\nconst TimeStamp = toUtcMinute(ts);\n\n// ===== gán vào msg để http request gửi =====\nmsg.url = BASE_URL + ENDPOINT;\nmsg.headers = {\n  \"Authorization\": `Bearer ${token}`,\n  \"Content-Type\": \"application/json\",\n  \"Accept\": \"application/json\"\n};\n\n// !!! THÊM FIELD payload như backend yêu cầu\nmsg.payload = {\n  TimeStamp,\n  ProjectPrefix,\n  Country,\n  Client,\n  payload: tags,   // <<<<<<<<<<<<<<  BẮT BUỘC\n  tags              // để đúng như tài liệu mới\n};\n\nreturn msg;\n",
        "outputs": 1,
        "timeout": 0,
        "noerr": 0,
        "initialize": "",
        "finalize": "",
        "libs": [],
        "x": 2750,
        "y": 680,
        "wires": [
            [
                "http_store",
                "dbg_preview"
            ]
        ]
    },
    {
        "id": "http_store",
        "type": "http request",
        "z": "cd6944ec074d2725",
        "name": "POST https://api.issrar.app/Ingest/store-dataOfProjects",
        "method": "POST",
        "ret": "obj",
        "paytoqs": "ignore",
        "url": "",
        "tls": "",
        "persist": false,
        "proxy": "",
        "insecureHTTPParser": false,
        "authType": "",
        "senderr": true,
        "headers": [],
        "x": 3180,
        "y": 680,
        "wires": [
            [
                "dbg_resp"
            ]
        ]
    },
    {
        "id": "dbg_preview",
        "type": "debug",
        "z": "cd6944ec074d2725",
        "name": "Payload sẽ gửi",
        "active": false,
        "tosidebar": true,
        "console": false,
        "tostatus": false,
        "complete": "payload",
        "targetType": "msg",
        "statusVal": "",
        "statusType": "auto",
        "x": 2820,
        "y": 780,
        "wires": []
    },
    {
        "id": "dbg_resp",
        "type": "debug",
        "z": "cd6944ec074d2725",
        "name": "Phản hồi API",
        "active": false,
        "tosidebar": true,
        "console": false,
        "tostatus": false,
        "complete": "true",
        "targetType": "full",
        "statusVal": "",
        "statusType": "auto",
        "x": 3530,
        "y": 680,
        "wires": []
    },
    {
        "id": "d4c63e8b0b9c7ca8",
        "type": "influxdb in",
        "z": "cd6944ec074d2725",
        "influxdb": "a015f1bc98a32e1e",
        "name": "Influx 1.x",
        "query": "",
        "rawOutput": false,
        "precision": "ms",
        "retentionPolicy": "",
        "org": "",
        "x": 1340,
        "y": 880,
        "wires": [
            [
                "64e089df38212c92"
            ]
        ]
    },
    {
        "id": "4bf845b1062616d1",
        "type": "function",
        "z": "cd6944ec074d2725",
        "name": "Build query scb_data (latest 5m)",
        "func": "// lấy bản ghi mới nhất của MỖI thiết bị trong 15 phút gần nhất\nmsg.query = 'SELECT * FROM \"scb_data\" ' +\n            'WHERE time >= now() - 5m ' +\n            'GROUP BY \"device\" ' +\n            'ORDER BY time DESC ' +\n            'LIMIT 1';\nreturn msg;\n",
        "outputs": 1,
        "timeout": "",
        "noerr": 0,
        "initialize": "",
        "finalize": "",
        "libs": [],
        "x": 1050,
        "y": 880,
        "wires": [
            [
                "d4c63e8b0b9c7ca8"
            ]
        ]
    },
    {
        "id": "64e089df38212c92",
        "type": "function",
        "z": "cd6944ec074d2725",
        "name": "Save scb_data → flow.set(<field>)",
        "func": "// ===== helpers =====\nfunction toISO(t){ return (typeof t === 'number') ? new Date(t).toISOString() : t; }\nfunction norm(k){ return String(k).replace(/\\s+|_/g,'').toLowerCase(); }\nfunction emptyData(){\n  const o = {};\n  for (let i=1;i<=32;i++) o[`Str${String(i).padStart(2,'0')}`] = null;\n  o.Voltage = null;\n  o.time = null; o.time_iso = null;\n  return o;\n}\n\n// parse payload thành list các series per device\nfunction parseRows(payload){\n  const out = [];\n  if (Array.isArray(payload)) {\n    for (const it of payload) {\n      if (it && it.columns && it.values && it.values[0]) { // dạng columns/values (GROUP BY)\n        const row = {}; it.columns.forEach((c,i)=> row[c]=it.values[0][i]);\n        out.push({ device: (it.tags && it.tags.device) || row.device || row.Device || null,\n                   time: row.time, row });\n      } else if (it && typeof it==='object') { // dạng object\n        out.push({ device: it.device || it.Device || null, time: it.time, row: it });\n      }\n    }\n  } else if (payload && typeof payload==='object') {\n    out.push({ device: payload.device || payload.Device || null, time: payload.time, row: payload });\n  }\n  return out;\n}\n\n// build map Str01..Str32 + Voltage từ 1 row (chịu các biến thể tên field)\nfunction buildStrMap(row){\n  const map = {};\n  const nmap = {}; Object.keys(row).forEach(k=> nmap[norm(k)] = k);\n\n  function getStr(i){\n    const s2 = String(i).padStart(2,'0');\n    const tries = [`Str${s2}`,`Str${i}`,`Str_${s2}`,`Str_${i}`,`Str ${s2}`,`Str ${i}`];\n    for (const t of tries){ const rk = nmap[norm(t)]; if (rk!==undefined) return row[rk]; }\n    return null;\n  }\n  for (let i=1;i<=32;i++) map[`Str${String(i).padStart(2,'0')}`] = getStr(i);\n\n  const vKey = Object.keys(row).find(k => norm(k)==='voltage');\n  map.Voltage = vKey ? row[vKey] : null;\n  return map;\n}\n\n// ===== main =====\nconst rows = parseRows(msg.payload);\nif (!rows.length) {\n  node.status({fill:\"yellow\",shape:\"ring\",text:\"scb_data: no row\"});\n  msg.payload = { saved:'scb_data', error:'no row' };\n  return msg;\n}\n\n// gom theo thiết bị\nconst byDev = {};\nfor (const it of rows){\n  const dev = (it.device || 'UNKNOWN').toString();\n  const m = buildStrMap(it.row);\n  byDev[dev] = Object.assign({ time: it.time || null, time_iso: it.time ? toISO(it.time) : null }, m);\n}\n\n// danh sách kỳ vọng đủ 40 thiết bị\nconst expected = Array.from({length:40}, (_,i)=> `S${String(i+1).padStart(2,'0')}`);\n\n// build list 40 phần tử (thiếu thì fill null)\nconst list = expected.map(d => {\n  const obj = byDev[d] ? byDev[d] : emptyData();\n  return Object.assign({ device: d }, obj);\n});\n\n// Lưu vào flow nếu cần dùng lại\nflow.set('scb_all_devices', list);   // mảng 40 thiết bị\nflow.set('scb_by_device', byDev);    // map theo device có dữ liệu thật\n\n// Trả ra: đủ 40 thiết bị, mỗi cái có 32 Str + Voltage + time/time_iso\nmsg.payload = { saved: 'scb_data', device_count: list.length, devices: list };\nnode.status({fill:\"green\",shape:\"dot\",text:`scb saved ${list.length} devices`});\nreturn msg;\n",
        "outputs": 1,
        "timeout": "",
        "noerr": 0,
        "initialize": "",
        "finalize": "",
        "libs": [],
        "x": 1620,
        "y": 880,
        "wires": [
            [
                "71f3f4a501099403",
                "003351b353afa41c",
                "e29ceb4829c0f0b3"
            ]
        ]
    },
    {
        "id": "71f3f4a501099403",
        "type": "debug",
        "z": "cd6944ec074d2725",
        "name": "Đã lưu scb → flow",
        "active": false,
        "tosidebar": true,
        "console": false,
        "tostatus": false,
        "complete": "payload",
        "targetType": "msg",
        "statusVal": "",
        "statusType": "auto",
        "x": 2070,
        "y": 880,
        "wires": []
    },
    {
        "id": "4c739b78a4c6dd15",
        "type": "function",
        "z": "cd6944ec074d2725",
        "name": "Build query meter_data_Cosphi (latest 5m)",
        "func": "// Lấy bản ghi mới nhất trong 15 phút cho 2 field tổng\nmsg.query = `\nSELECT\n  LAST(\"Power_Total_kW\")            AS \"Power_Total_kW\",\n  LAST(\"ReactivePower_Total_kvar\")  AS \"ReactivePower_Total_kvar\"\nFROM \"meter_data\"\nWHERE time >= now() - 5m\n`;\nreturn msg;\n",
        "outputs": 1,
        "timeout": "",
        "noerr": 0,
        "initialize": "",
        "finalize": "",
        "libs": [],
        "x": 1010,
        "y": 1140,
        "wires": [
            [
                "c3dae5cd0d2ecc19"
            ]
        ]
    },
    {
        "id": "c3dae5cd0d2ecc19",
        "type": "influxdb in",
        "z": "cd6944ec074d2725",
        "influxdb": "a015f1bc98a32e1e",
        "name": "Influx 1.x",
        "query": "",
        "rawOutput": false,
        "precision": "ms",
        "retentionPolicy": "",
        "org": "",
        "x": 1380,
        "y": 1140,
        "wires": [
            [
                "2e6a6fea6087a754"
            ]
        ]
    },
    {
        "id": "2e6a6fea6087a754",
        "type": "function",
        "z": "cd6944ec074d2725",
        "name": "Save Cosphi_meter_data → flow.set(<field>)",
        "func": "// Trả về {P, Q, time}; hỗ trợ payload dạng series hoặc mảng row\nfunction extractPQ(payload){\n  // A) Dạng series [{series:[{columns, values, tags}]}]\n  let s = (Array.isArray(payload) && payload[0] && payload[0].series && payload[0].series[0])\n        ? payload[0].series[0]\n        : (payload.series && payload.series[0] ? payload.series[0] : null);\n  if (s && s.values && s.values[0]) {\n    const cols = s.columns || [];\n    const vals = s.values[0];\n    const P = vals[cols.indexOf(\"Power_Total_kW\")];\n    const Q = vals[cols.indexOf(\"ReactivePower_Total_kvar\")];\n    const t = vals[cols.indexOf(\"time\")];\n    const device = s.tags && s.tags.device ? s.tags.device : null;\n    return { P: Number(P), Q: Number(Q), time: t, device };\n  }\n\n  // B) Dạng mảng row: [ { time, Power_Total_kW, ReactivePower_Total_kvar } ]\n  if (Array.isArray(payload) && payload.length && typeof payload[0] === \"object\") {\n    const r = payload[0];\n    return { P: Number(r.Power_Total_kW), Q: Number(r.ReactivePower_Total_kvar), time: r.time || null, device: r.device || null };\n  }\n\n  // C) Dạng object đơn\n  if (payload && typeof payload === \"object\") {\n    return { P: Number(payload.Power_Total_kW), Q: Number(payload.ReactivePower_Total_kvar), time: payload.time || null, device: payload.device || null };\n  }\n  return { P: null, Q: null, time: null, device: null };\n}\n\nconst { P, Q, time, device } = extractPQ(msg.payload);\nconst time_iso = time ? (typeof time === 'number' ? new Date(time).toISOString() : time) : null;\n\n// Lưu vào flow\nflow.set('Power_Total_kW',            isFinite(P) ? P : null);\nflow.set('ReactivePower_Total_kvar',  isFinite(Q) ? Q : null);\nflow.set('time_meter', time || null);\nflow.set('time_meter_iso', time_iso);\n\n// (tuỳ chọn) tính PF tổng từ P & Q\nlet PF = null;\nif (isFinite(P) && isFinite(Q)) {\n  const S = Math.sqrt(P*P + Q*Q);\n  PF = S > 0 ? P/S : null;\n  flow.set('Cosphi', PF);\n}\n\nmsg.payload = {\n  device: device || null,\n  Power_Total_kW: flow.get('Power_Total_kW'),\n  ReactivePower_Total_kvar: flow.get('ReactivePower_Total_kvar'),\n  Cosphi_total: PF,\n  time: time, time_iso\n};\nreturn msg;\n",
        "outputs": 1,
        "timeout": 0,
        "noerr": 0,
        "initialize": "",
        "finalize": "",
        "libs": [],
        "x": 1690,
        "y": 1140,
        "wires": [
            [
                "b9426025584a68cd",
                "e29ceb4829c0f0b3"
            ]
        ]
    },
    {
        "id": "b9426025584a68cd",
        "type": "debug",
        "z": "cd6944ec074d2725",
        "name": "Đã lưu cosphi",
        "active": false,
        "tosidebar": true,
        "console": false,
        "tostatus": false,
        "complete": "payload",
        "targetType": "msg",
        "statusVal": "",
        "statusType": "auto",
        "x": 1980,
        "y": 1260,
        "wires": []
    },
    {
        "id": "e29ceb4829c0f0b3",
        "type": "function",
        "z": "cd6944ec074d2725",
        "name": "Xem test biến flow.*",
        "func": "/***** CONFIG *****/\nconst INV_COUNT = 5, SCB_PER_INV = 8, EPS = 1e-4;\n\n/***** HELPERS *****/\nconst pad2 = n => (n < 10 ? '0' : '') + n;\nconst num = v => (v == null || v === '') ? null : (isFinite(+v) ? +v : null);\n// Voltage: nếu >50 coi là Volt → đổi sang kV, còn lại coi sẵn là kV\nconst to_kV = Vraw => (Vraw == null) ? null : (Vraw > 50 ? Vraw / 1000 : Vraw);\n\n/***** INPUTS *****/\nconst scb = flow.get('scb_by_device') || {};       // S01..S40 {Str01..Str32, Voltage}\nlet P_meter = num(flow.get('Power_Total_kW'));       // kW (có thể âm hoặc đang là MW)\nconst PF_plant = num(flow.get('Cosphi'));               // PF tổng (fallback)\n\n/***** 1) Pdc theo SCB rồi cộng 8 SCB → mỗi inverter *****/\nconst Pdc_by_inv = {};   // kW (đúng theo Σ(V_scb*kV × I_scb))\nconst Vavg_by_inv = {};   // kV (tham khảo)\nconst Idc_by_inv = {};   // A  (tham khảo)\nlet Pdc_total = 0;\n\nfor (let i = 1; i <= INV_COUNT; i++) {\n  let Pdc_inv = 0, I_inv = 0, Vsum = 0, Vcnt = 0;\n\n  for (let j = 1; j <= SCB_PER_INV; j++) {\n    const dev = `S${pad2((i - 1) * SCB_PER_INV + j)}`;\n    const o = scb[dev]; if (!o) continue;\n\n    // I_scb = tổng 32 strings (không lọc)\n    let I_scb = 0;\n    for (let z = 1; z <= 32; z++) {\n      const a = num(o[`Str${pad2(z)}`]);\n      if (a != null) I_scb += a;                  // A\n    }\n    const V_kV = to_kV(num(o.Voltage));         // kV\n    if (V_kV != null) {\n      Pdc_inv += V_kV * I_scb;                  // kW = kV*A\n      Vsum += V_kV; Vcnt++;\n    }\n    I_inv += I_scb;\n  }\n\n  const key = `Inv${pad2(i)}`;\n  Pdc_by_inv[key] = Pdc_inv || null;\n  Vavg_by_inv[key] = Vcnt ? Vsum / Vcnt : null;\n  Idc_by_inv[key] = I_inv;\n  if (Pdc_inv) Pdc_total += Pdc_inv;\n}\n\n/***** 2) TÍNH η_plant MỖI LẦN (auto-scale MW→kW nếu cần) *****/\nlet eta = null;\nif (isFinite(P_meter) && Pdc_total > 0) {\n  // thử tỉ lệ thô\n  let eta_raw = Math.abs(P_meter) / Pdc_total;\n\n  // nếu quá nhỏ (~MW/kW), thử nhân 1000\n  if (eta_raw < 0.2) {\n    const eta_if_mw = Math.abs(P_meter * 1000) / Pdc_total;\n    if (eta_if_mw > 0.6 && eta_if_mw <= 1.05) {\n      P_meter *= 1000;     // MW → kW\n      eta_raw = eta_if_mw;\n    }\n  }\n  // clamp phạm vi hợp lý\n  eta = Math.max(0.6, Math.min(1.05, eta_raw));\n}\nflow.set('eta_plant', eta);  // luôn ghi đè để tránh dính η cũ\n\n// ... phần trên giữ nguyên tới hết bước tính eta & P_meter_used_kW ...\n/***** 3) Pac (mang cùng dấu với P_meter) & Q theo PF *****/\n/***** 3) Pac (luôn dương) & Q (luôn âm) *****/\nconst inv = {};\nconst inverter_tags = [];\nfunction pushInvTag(invXX, field, value, unit){\n  const v = num(value); if (v==null) return;\n  const table = `vn_bhpp_inverter${invXX}data`;\n  inverter_tags.push({ name: `${table}.Inv${invXX}_${field}`, type: \"float\", value: v, unit: unit||\"\", scale: \"1.0\" });\n}\n\n// vẫn tính Pac theo η * Pdc (không dùng dấu của meter nữa)\nfor (let i=1;i<=INV_COUNT;i++){\n  const XX = pad2(i), key = `Inv${XX}`;\n  const Pdc = num(Pdc_by_inv[key]);                 // kW\n\n  // Pac tính nội bộ rồi ép dương\n  const Pac_calc = (eta!=null && Pdc!=null) ? (eta * Pdc) : null;   // kW\n  const Pac_out  = (Pac_calc!=null) ? Math.abs(Pac_calc) : null;    // luôn dương\n\n  // PF: ưu tiên theo inverter, không có thì dùng PF plant (chỉ để tham khảo)\n  let PF = num(flow.get(`${key}_RealtimePowerFactor`));\n  if (PF==null) PF = PF_plant;\n\n  // Q tính theo |P| và |PF| nhưng khi xuất ra luôn âm\n  let Q_calc=null, PF_used=null;\n  if (Pac_out!=null && PF!=null && PF!==0){\n    const abspf = Math.abs(PF);\n    const tanphi = (abspf >= 1-EPS) ? 0 : Math.sqrt(1/(abspf*abspf) - 1);\n    Q_calc = Pac_out * tanphi;      // độ lớn Q (kVAr)\n    PF_used = PF;\n  }\n  const Q_out = (Q_calc!=null) ? -Math.abs(Q_calc) : null;  // luôn âm\n\n  inv[key] = {\n    Pdc_kW     : Pdc!=null ? +Pdc.toFixed(2) : null,\n    Pac_kW     : Pac_out!=null ? +Pac_out.toFixed(2) : null,   // luôn dương\n    Q_kVAr     : Q_out!=null   ? +Q_out.toFixed(2)   : null,   // luôn âm\n    PF_used    : PF_used!=null ? +PF_used.toFixed(4) : null,\n    Vdc_kV_avg : Vavg_by_inv[key]!=null ? +Vavg_by_inv[key].toFixed(3) : null,\n    Idc_A      : +Idc_by_inv[key].toFixed(1)\n  };\n\n  // tags\n  pushInvTag(XX, \"TotalInputPower\",     inv[key].Pdc_kW, \"kW\");\n  pushInvTag(XX, \"ActivePower\",         inv[key].Pac_kW, \"kW\");    // dương\n  pushInvTag(XX, \"ReactivePower\",       inv[key].Q_kVAr, \"kVAr\");  // âm\n  pushInvTag(XX, \"RealTimePowerFactor\", inv[key].PF_used, \"\");\n  pushInvTag(XX, \"DCCurrent\",           inv[key].Idc_A,  \"A\");\n}\n\n\n\n/***** 4) Trả kết quả & debug *****/\nflow.set('inv_Pdc_kW', Pdc_by_inv);\nflow.set('vn_bhpp_inverter_tags', inverter_tags);\nflow.set('inv_pacq', inv);\n\nmsg.payload = {\n  debug: {\n    Pdc_total_kW: +Pdc_total.toFixed(2),\n    P_meter_input: num(flow.get('Power_Total_kW')),\n    P_meter_used_kW: isFinite(P_meter) ? +P_meter.toFixed(2) : null,\n    eta_plant: eta\n  },\n  inv,\n  vn_bhpp_inverter_tags: inverter_tags\n};\nreturn msg;\n",
        "outputs": 1,
        "timeout": "",
        "noerr": 0,
        "initialize": "",
        "finalize": "",
        "libs": [],
        "x": 2050,
        "y": 1020,
        "wires": [
            [
                "cfeb5d938f2aafa3",
                "fn_build_from_cache"
            ]
        ]
    },
    {
        "id": "cfeb5d938f2aafa3",
        "type": "debug",
        "z": "cd6944ec074d2725",
        "name": "test1",
        "active": false,
        "tosidebar": true,
        "console": false,
        "tostatus": false,
        "complete": "payload",
        "targetType": "msg",
        "statusVal": "",
        "statusType": "auto",
        "x": 2250,
        "y": 1180,
        "wires": []
    },
    {
        "id": "a015f1bc98a32e1e",
        "type": "influxdb",
        "hostname": "115.78.73.3",
        "port": 8086,
        "protocol": "http",
        "database": "edgedb",
        "name": "",
        "usetls": false,
        "tls": "",
        "influxdbVersion": "1.x",
        "url": "http://localhost:8086",
        "timeout": 10,
        "rejectUnauthorized": true
    }
]
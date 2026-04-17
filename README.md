# DỰ ÁN: ISRAR SOLAR — ETL MONITORING DASHBOARD

> Hệ thống giám sát luồng dữ liệu (Data Pipeline) theo thời gian thực (Real-time) dành cho trạm điện mặt trời năng lượng sạch Binh Hoa Solar.

**Tác giả:** Phạm Hoàng Phúc  
**Phiên bản:** 1.0.0 (Enterprise Light Theme)

---

## GIỚI THIỆU CHUNG
Trong các hệ thống công nghiệp (SCADA), dữ liệu từ các thiết bị đo đếm (Inverter, Meteo Station) thường đi qua một "đường ống" (Pipeline) trước khi được định dạng và gửi lên Máy chủ Trung tâm (Cloud API). 

Dự án này là một **Hệ thống Giám sát Cửa ngõ (Gateway Monitor)**. Nó đóng vai trò "đứng giữa" luồng dữ liệu của phần mềm Node-RED để "nghe lén" và trực quan hóa toàn bộ dữ liệu đang chảy qua hệ thống dưới dạng đồ thị, số liệu và màn hình quản lý trạng thái máy chủ.  

**Ứng dụng thực tế của dự án ngắm tới việc giải quyết câu hỏi:**
> *"Hệ thống vừa gửi đi gói tin gì? Dữ liệu Trạm thời tiết có bình thường không? Việc đẩy dữ liệu lên API có báo lỗi chập chờn hay không?"*

---

## SƠ ĐỒ KHỐI KIẾN TRÚC TỔNG THỂ (ARCHITECTURE)

Toàn bộ hệ thống hoạt động thông qua một kiến trúc Event-Driven (Hướng sự kiện) một chiều gọn nhẹ để tối ưu hóa hiệu suất theo nguyên lý pub/sub.

```mermaid
graph TD
    %% Tác nhân bên ngoài
    A((Các Trạm \nInverter & Thời tiết)) -->|Điện áp, \n Nhiệt độ| B(InfluxDB / SCADA)
    B -->|Querying| C{Node-RED \n (Xử lý Data)}
    
    %% Tương tác với hệ thống Monitor
    C -->|1. POST Dữ liệu Gốc | D
    C -->|2. POST Dữ liệu Chuẩn hóa| D
    C -->|3. POST Trạng thái Push API| D
    
    subgraph BACKEND (Golang - Port 2700)
    D[API Endpoint \n `/api/ingest`] -->|Phân loại & Bọc gói| E(WebSocket Hub)
    end
    
    subgraph FRONTEND (Web Dashboard - Port 2701)
    E -->|Broadcast JSON| F[Khối Xử lý UI \n `websocket.js`]
    F --> G[Render Dom & Đồ thị \n `Chart.js`]
    end
    
    %% API Trung tâm
    C -.->|Đẩy dữ liệu thật| H((Cloud API \n Issrar App))
    H -.->|Trả về HTTP status| C
    
    classDef sys fill:#1E3A5F,stroke:#fff,stroke-width:2px,color:#fff;
    classDef ext fill:#F3F4F6,stroke:#D1D5DB,stroke-width:2px;
    class A,B,C,H ext;
    class D,E,F,G sys;
```

---

## PHÂN TÍCH CHUYÊN SÂU: BACKEND VÀ FRONTEND

### 1. Phân Tích Khối Backend (Được viết bằng Golang)
Golang được lựa chọn để viết Backend vì tính chất nhỏ gọn, thực thi siêu tốc độ (Compiled language) và quản lý tiến trình song song (Goroutines) cực kỳ tốt khi mở các luồng WebSocket.
- **Nhiệm vụ cốt lõi:** Làm trạm trung chuyển (Message Broker).
- Đoạn mã trọng tâm là `ingest.go`: Khi Node-RED bắn dữ liệu vào đường rẽ `/api/ingest`, Backend không cần hiểu Node-RED đang gửi mảng JSON rối rắm gì. Nó cung cấp một cái rập khuôn thông minh (Smart Wrapper). Nó tự phân tích gói tin đó là Data Thô (Raw), Date đã biến đổi (Formatted), hay chỉ là Kết Quả (Push Status) để bọc thêm thuộc tính rồi "ném thẳng" xuống cho mọi màn hình Web đang mở thông qua đường hầm **WebSocket**.

### 2. Phân Tích Khối Frontend (HTML / CSS / JS)
Được viết thuần túy theo phong cách **Vanilla (Không dùng Framework nặng như React/Vue)** để đảm bảo trang hiển thị tức thời trên các thiết bị máy tính công nghiệp cấu hình yếu.
- **`websocket.js`:** Là đường hầm tĩnh nghe dữ liệu rơi xuống.
- **`ui.js`:** Sở hữu "bộ não" Render. Ngay khi nhận được mảng số liệu, nó sẽ phân tách ra:
  + Cập nhật các bảng đồng hồ Điện áp, Công suất.
  + Đẩy tọa độ 1 điểm sáng mới vào bảng đồ thị `Chart.js`.
  + Phản ứng màu sắc: Nhấp nháy màu xanh khi cập nhật, báo lỗi màu Đỏ ở cột "ETL Pipeline".
- Giao diện được thiết kế theo tiêu chuẩn khoa học **Light Enterprise Grid**, áp đặt cứng kích thước biểu đồ (fix overflow) giúp mọi số liệu trên 1 màn hình được nhìn thấy toàn bộ cùng lúc.

---

## HƯỚNG DẪN CÀI ĐẶT DÀNH CHO NGƯỜI CHƯA BIẾT GÌ

Hệ thống đã được lập trình để "Tự động gói ghém ảo hóa" bằng công nghệ **Docker**. Nghĩa là bạn không cần cài thêm Golang hay ngôn ngữ môi trường vào máy tải. Toàn bộ nằm trong 1 File nén.

### Bước 1: Mang dữ liệu vào Server (Máy đích)
Bạn sẽ nhận được 1 file nén có tên là: `Israr_Monitor_Offline_Package.tar.gz`.
Hãy copy file này bằng USB hoặc FTP vào máy chủ (Máy Linux hoặc Windows đã có cài Docker).

### Bước 2: Kích hoạt ứng dụng
Mở hộp thoại dòng lệnh (Terminal) tại nơi chứa file nén và thực thi tuần tự 3 câu chú này:

```bash
# 1. Giải nén hệ rễ dự án
tar -xzf Israr_Monitor_Offline_Package.tar.gz

# 2. Bước vào trong kho lưu trữ triển khai
cd Offline_Deployment

# 3. Nạp gói Docker Image (Tốn khoảng 5 giây)
docker load -i monitor_image.tar

# 4. Phát lệnh cho Server chạy ngầm hệ thống
docker compose up -d
```

### Bước 3: Hưởng thụ thành quả
Mở trình duyệt Web (Google Chrome) trên bất kỳ máy tính nào cùng mạng với máy Server, gõ lên thanh địa chỉ:
**`http://<IP-Của-Máy-Server>:2701`** (Ví dụ: `http://192.168.31.254:2701`).

Màn hình SCADA chuyên nghiệp sáng màu sẽ hiện ra và nằm ngoan ngoãn chớp nháy chờ đón dòng dữ liệu truyền về!🎉

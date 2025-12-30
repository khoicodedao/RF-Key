# Test Cases - RF License Management System

## Mục lục
1. [Quản lý Đơn vị (Units Management)](#1-quản-lý-đơn-vị-units-management)
2. [Quản lý Người dùng (Users Management)](#2-quản-lý-người-dùng-users-management)
3. [Quản lý License](#3-quản-lý-license)
4. [Định danh Thiết bị (Device Identification)](#4-định-danh-thiết-bị-device-identification)
5. [Xác thực và Phân quyền (Authentication & Authorization)](#5-xác-thực-và-phân-quyền-authentication--authorization)

---

## 1. Quản lý Đơn vị (Units Management)

### TC-UNIT-001: Xem danh sách đơn vị dạng cây
**Mô tả**: Kiểm tra hiển thị danh sách đơn vị theo cấu trúc cây phân cấp

**Điều kiện tiên quyết**: 
- Đã đăng nhập với quyền admin
- Có dữ liệu đơn vị trong hệ thống

**Các bước thực hiện**:
1. Truy cập trang Units (`/units`)
2. Quan sát cấu trúc hiển thị

**Kết quả mong đợi**:
- Hiển thị danh sách đơn vị dạng cây (tree structure)
- Các đơn vị con được lồng dưới đơn vị cha
- Hiển thị đầy đủ thông tin: Tên đơn vị, Mã đơn vị, Miền, Level
- Có thể mở rộng/thu gọn các node
- Sắp xếp theo level và tên đơn vị

---

### TC-UNIT-002: Thêm đơn vị mới (root level)
**Mô tả**: Tạo đơn vị mới ở cấp gốc

**Điều kiện tiên quyết**: 
- Đã đăng nhập với quyền admin

**Các bước thực hiện**:
1. Truy cập trang Units
2. Click nút "New Unit"
3. Nhập thông tin:
   - Unit Name: "Đơn vị Test"
   - Full Name: "Đơn vị Test Đầy đủ"
   - Region: Chọn "Bắc" (1)
   - Level: 1
   - Parent Unit Code: Để trống
4. Click "Lưu"

**Kết quả mong đợi**:
- Hiển thị thông báo "Tạo đơn vị thành công"
- Đơn vị mới xuất hiện trong danh sách
- Mã đơn vị được tự động sinh (12 ký tự)
- Thời gian tạo và cập nhật được ghi nhận

---

### TC-UNIT-003: Thêm đơn vị con
**Mô tả**: Tạo đơn vị con cho một đơn vị đã tồn tại

**Điều kiện tiên quyết**: 
- Đã có đơn vị cha trong hệ thống

**Các bước thực hiện**:
1. Truy cập trang Units
2. Tìm đơn vị cha
3. Click nút "Thêm con" (icon Plus màu xanh lá)
4. Form tự động điền:
   - Parent Unit Code: Mã đơn vị cha
   - Region: Kế thừa từ đơn vị cha
   - Level: Level cha + 1
5. Nhập Unit Name và Full Name
6. Click "Lưu"

**Kết quả mong đợi**:
- Đơn vị con được tạo thành công
- Hiển thị dưới đơn vị cha trong cây
- Level tự động tăng 1 so với cha
- Region kế thừa từ đơn vị cha

---

### TC-UNIT-004: Sửa thông tin đơn vị
**Mô tả**: Cập nhật thông tin đơn vị đã tồn tại

**Điều kiện tiên quyết**: 
- Đã có đơn vị trong hệ thống

**Các bước thực hiện**:
1. Truy cập trang Units
2. Click nút "Sửa" (icon Edit màu cam) trên đơn vị cần sửa
3. Thay đổi thông tin (ví dụ: Full Name)
4. Click "Lưu"

**Kết quả mong đợi**:
- Thông tin được cập nhật thành công
- Thời gian "Cập nhật" được cập nhật
- Thông báo thành công hiển thị
- Không thể sửa Unit Code

---

### TC-UNIT-005: Xóa đơn vị
**Mô tả**: Xóa đơn vị khỏi hệ thống

**Điều kiện tiên quyết**: 
- Đơn vị không có đơn vị con
- Đơn vị không có license liên kết

**Các bước thực hiện**:
1. Truy cập trang Units
2. Click nút "Xóa" (icon Delete màu đỏ)
3. Xác nhận trong popup "Bạn có chắc muốn xóa..."
4. Click "Xóa"

**Kết quả mong đợi**:
- Đơn vị bị xóa khỏi danh sách
- Thông báo xóa thành công
- Nếu có đơn vị con hoặc license, hiển thị lỗi không thể xóa

---

### TC-UNIT-006: Xem chi tiết đơn vị
**Mô tả**: Xem thông tin chi tiết của đơn vị

**Các bước thực hiện**:
1. Truy cập trang Units
2. Click nút "Xem" (icon Eye màu xanh)

**Kết quả mong đợi**:
- Modal hiển thị đầy đủ thông tin:
  - Mã đơn vị
  - Tên đơn vị
  - Tên đầy đủ
  - Miền
  - Level
  - Đơn vị cha
  - Domains (log, update, control)
  - Thời gian tạo và cập nhật

---

### TC-UNIT-007: Quản lý Domains
**Mô tả**: Kiểm tra hiển thị và quản lý domains của đơn vị

**Các bước thực hiện**:
1. Xem chi tiết đơn vị có domains
2. Kiểm tra hiển thị domains_log, domains_update, domains_control

**Kết quả mong đợi**:
- Hiển thị số lượng domains cho mỗi loại
- Tooltip hiển thị danh sách domains khi hover
- Phân biệt rõ 3 loại: log, update, control

---

## 2. Quản lý Người dùng (Users Management)

### TC-USER-001: Xem danh sách người dùng
**Mô tả**: Hiển thị danh sách tất cả người dùng

**Điều kiện tiên quyết**: 
- Đã đăng nhập với quyền admin

**Các bước thực hiện**:
1. Truy cập trang Users (`/users`)
2. Quan sát danh sách

**Kết quả mong đợi**:
- Hiển thị bảng người dùng với các cột:
  - STT
  - Tên đăng nhập
  - Vai trò (Role)
  - Đơn vị
  - Miền
  - Thời gian tạo/cập nhật
  - OTP Required
  - Thao tác
- Có phân trang
- Có thể thay đổi số bản ghi/trang (10, 20, 50)

---

### TC-USER-002: Tìm kiếm người dùng
**Mô tả**: Tìm kiếm người dùng theo username, role, unit

**Các bước thực hiện**:
1. Truy cập trang Users
2. Nhập từ khóa vào ô tìm kiếm (ví dụ: "admin")
3. Nhấn Enter hoặc click "Làm mới"

**Kết quả mong đợi**:
- Danh sách lọc theo từ khóa
- Tìm kiếm trong: username, role, unit_code
- Hiển thị kết quả phù hợp
- Tổng số bản ghi được cập nhật

---

### TC-USER-003: Lọc người dùng theo miền
**Mô tả**: Lọc người dùng theo vùng miền

**Các bước thực hiện**:
1. Truy cập trang Users
2. Chọn miền từ dropdown (Bắc/Trung/Nam)
3. Quan sát kết quả

**Kết quả mong đợi**:
- Chỉ hiển thị người dùng thuộc miền đã chọn
- Có thể xóa bộ lọc (Clear)
- Trang reset về 1 khi lọc

---

### TC-USER-004: Thêm người dùng mới
**Mô tả**: Tạo tài khoản người dùng mới

**Các bước thực hiện**:
1. Click nút "Thêm người dùng"
2. Nhập thông tin:
   - Username: "testuser"
   - Password: "Test@123"
   - Role: Chọn "admin"
   - Region: Chọn "1" (Bắc)
   - Unit Code: Chọn đơn vị
   - OTP Enabled: Chọn có/không
3. Click "Lưu"

**Kết quả mong đợi**:
- Người dùng mới được tạo
- Thông báo thành công
- Nếu OTP enabled, tự động tạo otpauthUrl
- Không thể tạo username trùng

---

### TC-USER-005: Sửa thông tin người dùng
**Mô tả**: Cập nhật thông tin người dùng

**Các bước thực hiện**:
1. Click nút "Sửa" trên người dùng
2. Thay đổi thông tin (ví dụ: role, region)
3. Click "Lưu"

**Kết quả mong đợi**:
- Thông tin được cập nhật
- Username không thể thay đổi
- Thời gian cập nhật được ghi nhận

---

### TC-USER-006: Xóa người dùng
**Mô tả**: Xóa người dùng khỏi hệ thống

**Các bước thực hiện**:
1. Click nút "Xóa" (màu đỏ)
2. Xác nhận trong popup
3. Click "Xóa"

**Kết quả mong đợi**:
- Người dùng bị xóa
- Thông báo thành công
- Không thể xóa chính mình

---

### TC-USER-007: Xem chi tiết người dùng với OTP
**Mô tả**: Xem thông tin chi tiết bao gồm QR code OTP

**Điều kiện tiên quyết**: 
- Người dùng có OTP enabled

**Các bước thực hiện**:
1. Click nút "Xem" trên người dùng có OTP
2. Quan sát modal chi tiết

**Kết quả mong đợi**:
- Hiển thị đầy đủ thông tin
- Hiển thị QR Code cho OTP
- Hiển thị otpauthUrl (có thể copy)
- Tag "Enabled" màu xanh cho OTP

---

### TC-USER-008: Phân quyền theo role
**Mô tả**: Kiểm tra phân quyền superadmin vs admin

**Các bước thực hiện**:
1. Tạo user với role "superadmin"
2. Tạo user với role "admin"
3. So sánh quyền truy cập

**Kết quả mong đợi**:
- Superadmin: Tag màu đỏ
- Admin: Tag màu xanh lá
- Phân quyền rõ ràng trong hệ thống

---

## 3. Quản lý License

### TC-LIC-001: Xem danh sách license
**Mô tả**: Hiển thị danh sách license với bộ lọc

**Các bước thực hiện**:
1. Truy cập trang Licenses (`/licenses`)
2. Quan sát giao diện 2 cột: Cây đơn vị (trái) và Bảng license (phải)

**Kết quả mong đợi**:
- Hiển thị cây đơn vị bên trái
- Hiển thị bảng license bên phải với các cột:
  - STT
  - License (có thể copy)
  - Đơn vị
  - Trạng thái
  - IP/MAC
  - Thời gian tạo/cập nhật
  - Re-issue count / Send count
  - Nút Xem
- Mặc định lọc status = "new"

---

### TC-LIC-002: Lọc license theo trạng thái
**Mô tả**: Lọc license theo trạng thái (New/Actived/Deactived)

**Các bước thực hiện**:
1. Chọn status từ dropdown:
   - New
   - Actived
   - Deactived
   - Tất cả
2. Quan sát kết quả

**Kết quả mong đợi**:
- New: Tag màu xanh dương
- Actived: Tag màu xanh lá
- Deactived: Tag màu đỏ
- Danh sách lọc đúng theo trạng thái

---

### TC-LIC-003: Lọc license theo đơn vị
**Mô tả**: Chọn đơn vị từ cây để lọc license

**Các bước thực hiện**:
1. Click vào một đơn vị trong cây bên trái
2. Quan sát bảng license bên phải

**Kết quả mong đợi**:
- Chỉ hiển thị license của đơn vị đã chọn
- Hiển thị tên đơn vị đã chọn
- Nút "Xóa lọc" để bỏ chọn
- Nút "Tạo license" được enable

---

### TC-LIC-004: Tìm kiếm license
**Mô tả**: Tìm kiếm license theo nhiều tiêu chí

**Các bước thực hiện**:
1. Nhập từ khóa vào ô tìm kiếm
2. Nhấn Enter hoặc click "Làm mới"

**Kết quả mong đợi**:
- Tìm kiếm trong: license, unit_code, device_name, manager_name, ip, mac
- Kết quả hiển thị đúng
- Hỗ trợ tìm kiếm mờ (partial match)

---

### TC-LIC-005: Tạo license cho đơn vị
**Mô tả**: Tạo batch license cho một đơn vị

**Điều kiện tiên quyết**: 
- Đã chọn đơn vị từ cây

**Các bước thực hiện**:
1. Chọn đơn vị từ cây
2. Click nút "Tạo license"
3. Nhập thông tin:
   - Số lượng: 5
   - Vùng: 1
4. Click "Tạo"

**Kết quả mong đợi**:
- Tạo thành công 5 license
- Tất cả có status = "new"
- unit_code = đơn vị đã chọn
- region = vùng đã chọn
- License được tự động sinh (unique)
- Thông báo "Tạo license thành công"

---

### TC-LIC-006: Xem chi tiết license
**Mô tả**: Xem thông tin đầy đủ của một license

**Các bước thực hiện**:
1. Click nút "Xem" trên một license
2. Quan sát modal chi tiết

**Kết quả mong đợi**:
- Modal hiển thị bảng thông tin chi tiết:
  - ID
  - Trạng thái
  - License (có thể copy)
  - Đơn vị
  - Unit alias
  - Thiết bị
  - Người quản lý
  - IP, MAC
  - Actived at, Reactived at
  - Thời gian tạo/cập nhật
  - Token Info (có thể copy, expand)
  - Token Domain (có thể copy, expand)
  - Region
  - UID (có thể copy)
  - isSend, sent_at, resent_at
  - reissue_count

---

### TC-LIC-007: Copy license
**Mô tả**: Copy license key vào clipboard

**Các bước thực hiện**:
1. Click icon copy bên cạnh license
2. Kiểm tra clipboard

**Kết quả mong đợi**:
- License được copy vào clipboard
- Thông báo "Đã copy"
- Có thể paste vào nơi khác

---

### TC-LIC-008: Phân trang license
**Mô tả**: Kiểm tra phân trang và thay đổi số bản ghi

**Các bước thực hiện**:
1. Thay đổi số bản ghi/trang (10, 20, 50, 100)
2. Chuyển trang
3. Quan sát kết quả

**Kết quả mong đợi**:
- Hiển thị đúng số bản ghi theo lựa chọn
- Phân trang hoạt động chính xác
- Hiển thị "Tổng: X" bản ghi
- STT tính đúng theo trang

---

### TC-LIC-009: Hiển thị cây đơn vị với level color
**Mô tả**: Kiểm tra hiển thị màu sắc theo level

**Các bước thực hiện**:
1. Quan sát cây đơn vị
2. Kiểm tra badge "Level X"

**Kết quả mong đợi**:
- Mỗi level có màu riêng
- Badge hiển thị "Level X"
- Dễ phân biệt cấp bậc đơn vị

---

### TC-LIC-010: Làm mới danh sách
**Mô tả**: Reload dữ liệu license

**Các bước thực hiện**:
1. Click nút "Làm mới" (icon Reload)

**Kết quả mong đợi**:
- Dữ liệu được tải lại
- Giữ nguyên bộ lọc hiện tại
- Loading indicator hiển thị

---

## 4. Định danh Thiết bị (Device Identification)

### TC-IDENT-001: Xem danh sách thiết bị đã định danh
**Mô tả**: Hiển thị danh sách thiết bị đã kích hoạt license

**Các bước thực hiện**:
1. Truy cập trang Ident (`/ident`)
2. Quan sát danh sách

**Kết quả mong đợi**:
- Hiển thị bảng với các cột:
  - STT
  - Thiết bị (device_name + unit_code)
  - Người quản lý
  - License (có thể copy)
  - IP/MAC
  - Trạng thái
  - Hoạt hóa/Tái hoạt
  - Thời gian tạo/cập nhật
  - Token/UID
  - Nút Xem
- Mặc định lọc status = "act" (actived)

---

### TC-IDENT-002: Lọc thiết bị theo trạng thái
**Mô tả**: Lọc thiết bị đã kích hoạt/chưa kích hoạt

**Các bước thực hiện**:
1. Chọn trạng thái:
   - Actived
   - Deactived
   - Tất cả
2. Quan sát kết quả

**Kết quả mong đợi**:
- Actived: Tag màu xanh lá
- Deactived: Tag màu đỏ
- Lọc đúng theo trạng thái

---

### TC-IDENT-003: Tìm kiếm thiết bị
**Mô tả**: Tìm kiếm theo license, thiết bị, IP, MAC, Unit

**Các bước thực hiện**:
1. Nhập từ khóa vào ô tìm kiếm
2. Nhấn Enter

**Kết quả mong đợi**:
- Tìm trong: license, device_name, ip, mac, unit_code
- Kết quả hiển thị đúng
- Hỗ trợ tìm kiếm mờ

---

### TC-IDENT-004: Xem chi tiết thiết bị
**Mô tả**: Xem thông tin đầy đủ của thiết bị đã định danh

**Các bước thực hiện**:
1. Click nút "Xem" trên một thiết bị
2. Quan sát modal

**Kết quả mong đợi**:
- Hiển thị đầy đủ:
  - ID
  - Trạng thái
  - Thiết bị
  - Đơn vị
  - License (có thể copy)
  - UID (có thể copy)
  - IP, MAC
  - Actived at, Reactived at
  - Thời gian tạo/cập nhật
  - Token Info (có thể copy, expand)
  - Token Domain (có thể copy, expand)
  - Manager
  - Unit alias
  - isSend, sent_at

---

### TC-IDENT-005: Copy UID
**Mô tả**: Copy UID của thiết bị

**Các bước thực hiện**:
1. Click icon copy UID trong cột Token/UID
2. Kiểm tra clipboard

**Kết quả mong đợi**:
- UID được copy
- Thông báo "Đã copy UID"

---

### TC-IDENT-006: Xem Token Info qua Popover
**Mô tả**: Xem token info/domain qua popover

**Các bước thực hiện**:
1. Click link "token_info" hoặc "token_domain"
2. Quan sát popover

**Kết quả mong đợi**:
- Popover hiển thị nội dung token
- Có thể copy
- Có thể expand để xem thêm
- Tối đa 4 dòng, sau đó "Xem thêm"

---

### TC-IDENT-007: Kiểm tra responsive
**Mô tả**: Kiểm tra hiển thị trên các màn hình

**Các bước thực hiện**:
1. Thay đổi kích thước màn hình
2. Quan sát các cột responsive

**Kết quả mong đợi**:
- Cột IP/MAC: Ẩn trên màn hình < md
- Cột Hoạt hóa/Tái hoạt: Ẩn trên màn hình < lg
- Cột Thời gian: Ẩn trên màn hình < lg
- Cột Token/UID: Ẩn trên màn hình < xl
- Bảng có scroll ngang khi cần

---

### TC-IDENT-008: Phân trang
**Mô tả**: Kiểm tra phân trang thiết bị

**Các bước thực hiện**:
1. Thay đổi số bản ghi (10, 20, 50, 100)
2. Chuyển trang

**Kết quả mong đợi**:
- Phân trang chính xác
- Hiển thị tổng số bản ghi
- STT tính đúng

---

## 5. Xác thực và Phân quyền (Authentication & Authorization)

### TC-AUTH-001: Đăng nhập thành công
**Mô tả**: Đăng nhập với thông tin hợp lệ

**Các bước thực hiện**:
1. Truy cập trang login (`/auth/login` hoặc `/sign-in`)
2. Nhập username và password hợp lệ
3. Click "Đăng nhập"

**Kết quả mong đợi**:
- Đăng nhập thành công
- Chuyển hướng đến trang chủ/dashboard
- Session được tạo
- Hiển thị thông tin user

---

### TC-AUTH-002: Đăng nhập thất bại - Sai thông tin
**Mô tả**: Đăng nhập với thông tin không đúng

**Các bước thực hiện**:
1. Nhập username hoặc password sai
2. Click "Đăng nhập"

**Kết quả mong đợi**:
- Hiển thị lỗi "Sai tên đăng nhập hoặc mật khẩu"
- Không chuyển trang
- Form không bị reset

---

### TC-AUTH-003: Đăng nhập với OTP
**Mô tả**: Đăng nhập với tài khoản có bật OTP

**Điều kiện tiên quyết**: 
- User có otp_enabled = true

**Các bước thực hiện**:
1. Nhập username và password
2. Nhập mã OTP từ app authenticator
3. Click "Đăng nhập"

**Kết quả mong đợi**:
- Yêu cầu nhập OTP
- OTP đúng: Đăng nhập thành công
- OTP sai: Hiển thị lỗi

---

### TC-AUTH-004: Đăng xuất
**Mô tả**: Đăng xuất khỏi hệ thống

**Các bước thực hiện**:
1. Click nút "Đăng xuất" hoặc truy cập `/api/logout`
2. Xác nhận đăng xuất

**Kết quả mong đợi**:
- Session bị xóa
- Chuyển về trang login
- Không thể truy cập các trang yêu cầu đăng nhập

---

### TC-AUTH-005: Kiểm tra middleware
**Mô tả**: Kiểm tra bảo vệ các route yêu cầu đăng nhập

**Các bước thực hiện**:
1. Chưa đăng nhập
2. Truy cập các trang: `/licenses`, `/units`, `/users`, `/ident`

**Kết quả mong đợi**:
- Tự động chuyển về trang login
- Sau khi login, quay lại trang đã yêu cầu

---

### TC-AUTH-006: Phân quyền theo role
**Mô tả**: Kiểm tra quyền truy cập theo role

**Các bước thực hiện**:
1. Đăng nhập với role "admin"
2. Đăng nhập với role "superadmin"
3. So sánh quyền truy cập

**Kết quả mong đợi**:
- Superadmin: Toàn quyền
- Admin: Quyền hạn chế (nếu có cấu hình)
- Hiển thị/ẩn chức năng theo role

---

### TC-AUTH-007: Session timeout
**Mô tả**: Kiểm tra hết hạn session

**Các bước thực hiện**:
1. Đăng nhập
2. Để idle quá thời gian timeout
3. Thực hiện thao tác

**Kết quả mong đợi**:
- Yêu cầu đăng nhập lại
- Thông báo "Phiên làm việc đã hết hạn"

---

## 6. Test Cases Tích hợp (Integration Tests)

### TC-INT-001: Luồng tạo đơn vị và license
**Mô tả**: Tạo đơn vị mới và tạo license cho đơn vị đó

**Các bước thực hiện**:
1. Tạo đơn vị mới (TC-UNIT-002)
2. Chọn đơn vị vừa tạo trong trang Licenses
3. Tạo license cho đơn vị (TC-LIC-005)
4. Kiểm tra license được tạo

**Kết quả mong đợi**:
- Đơn vị và license liên kết đúng
- License có unit_code = mã đơn vị vừa tạo

---

### TC-INT-002: Luồng kích hoạt license
**Mô tả**: Kích hoạt license và kiểm tra trong Ident

**Các bước thực hiện**:
1. Tạo license mới (status = "new")
2. Kích hoạt license qua API (giả lập thiết bị)
3. Kiểm tra trong trang Ident

**Kết quả mong đợi**:
- License chuyển status = "act"
- Xuất hiện trong trang Ident
- Thông tin thiết bị được ghi nhận

---

### TC-INT-003: Luồng quản lý user và phân quyền
**Mô tả**: Tạo user, gán đơn vị, kiểm tra quyền

**Các bước thực hiện**:
1. Tạo user mới với unit_code cụ thể
2. Đăng nhập bằng user đó
3. Kiểm tra chỉ thấy license của đơn vị được gán

**Kết quả mong đợi**:
- User chỉ thấy dữ liệu của đơn vị mình
- Phân quyền theo unit_code hoạt động

---

## 7. Test Cases Hiệu năng (Performance Tests)

### TC-PERF-001: Load danh sách license lớn
**Mô tả**: Kiểm tra hiệu năng với số lượng license lớn

**Điều kiện tiên quyết**: 
- Có > 10,000 license trong DB

**Các bước thực hiện**:
1. Truy cập trang Licenses
2. Đo thời gian load

**Kết quả mong đợi**:
- Thời gian load < 2s
- Phân trang hoạt động mượt
- Không bị lag khi scroll

---

### TC-PERF-002: Tìm kiếm với dữ liệu lớn
**Mô tả**: Kiểm tra tốc độ tìm kiếm

**Các bước thực hiện**:
1. Nhập từ khóa tìm kiếm
2. Đo thời gian trả về kết quả

**Kết quả mong đợi**:
- Kết quả trả về < 1s
- Không bị timeout

---

## 8. Test Cases Bảo mật (Security Tests)

### TC-SEC-001: SQL Injection
**Mô tả**: Kiểm tra chống SQL injection

**Các bước thực hiện**:
1. Nhập các payload SQL injection vào ô tìm kiếm:
   - `' OR '1'='1`
   - `'; DROP TABLE licenses; --`
2. Quan sát kết quả

**Kết quả mong đợi**:
- Không thực thi SQL
- Input được escape đúng cách
- Không lỗi server

---

### TC-SEC-002: XSS (Cross-Site Scripting)
**Mô tả**: Kiểm tra chống XSS

**Các bước thực hiện**:
1. Nhập script vào các trường input:
   - `<script>alert('XSS')</script>`
   - `<img src=x onerror=alert('XSS')>`
2. Lưu và xem lại

**Kết quả mong đợi**:
- Script không được thực thi
- Hiển thị dưới dạng text thuần
- HTML được escape

---

### TC-SEC-003: CSRF Protection
**Mô tả**: Kiểm tra bảo vệ CSRF

**Các bước thực hiện**:
1. Thử gửi request từ domain khác
2. Kiểm tra CSRF token

**Kết quả mong đợi**:
- Request từ domain khác bị từ chối
- CSRF token được validate

---

## 9. Test Cases UI/UX

### TC-UI-001: Dark mode
**Mô tả**: Kiểm tra chế độ tối

**Các bước thực hiện**:
1. Chuyển sang dark mode
2. Kiểm tra tất cả các trang

**Kết quả mong đợi**:
- Tất cả component hiển thị đúng trong dark mode
- Màu sắc hợp lý, dễ đọc
- Không có vùng sáng chói

---

### TC-UI-002: Responsive design
**Mô tả**: Kiểm tra responsive trên các thiết bị

**Các bước thực hiện**:
1. Test trên mobile (< 768px)
2. Test trên tablet (768px - 1024px)
3. Test trên desktop (> 1024px)

**Kết quả mong đợi**:
- Layout tự động điều chỉnh
- Bảng có scroll ngang khi cần
- Các cột ẩn/hiện hợp lý
- Menu responsive

---

### TC-UI-003: Loading states
**Mô tả**: Kiểm tra trạng thái loading

**Các bước thực hiện**:
1. Quan sát khi load dữ liệu
2. Kiểm tra loading indicator

**Kết quả mong đợi**:
- Hiển thị spinner/skeleton khi loading
- Disable các nút khi đang xử lý
- Không bị click nhiều lần

---

### TC-UI-004: Error handling
**Mô tả**: Kiểm tra hiển thị lỗi

**Các bước thực hiện**:
1. Tạo lỗi (ví dụ: mất kết nối API)
2. Quan sát thông báo lỗi

**Kết quả mong đợi**:
- Thông báo lỗi rõ ràng
- Hướng dẫn khắc phục (nếu có)
- Không crash app

---

## 10. Test Cases API

### TC-API-001: GET /api/licenses
**Mô tả**: Lấy danh sách license

**Request**:
```
GET /api/licenses?page=1&limit=10&filter=status like 'new'
```

**Kết quả mong đợi**:
- Status: 200
- Response:
```json
{
  "items": [...],
  "countTotal": 100,
  "page": 1,
  "limit": 10
}
```

---

### TC-API-002: POST /api/ident
**Mô tả**: Tạo license batch

**Request**:
```
POST /api/ident
{
  "unit_code": "ABC123",
  "quantity": 5,
  "region": 1
}
```

**Kết quả mong đợi**:
- Status: 200
- Tạo 5 license mới
- Response chứa danh sách license

---

### TC-API-003: GET /api/units
**Mô tả**: Lấy danh sách đơn vị

**Request**:
```
GET /api/units
```

**Kết quả mong đợi**:
- Status: 200
- Response: Array of units
- Bao gồm thông tin đầy đủ

---

### TC-API-004: POST /api/users
**Mô tả**: Tạo user mới

**Request**:
```
POST /api/users
{
  "user_name": "testuser",
  "password": "Test@123",
  "role": "admin",
  "region": 1,
  "unit_code": ["ABC123"],
  "otp_enabled": false
}
```

**Kết quả mong đợi**:
- Status: 200
- User được tạo
- Password được hash

---

### TC-API-005: Error handling
**Mô tả**: Kiểm tra xử lý lỗi API

**Các bước thực hiện**:
1. Gửi request không hợp lệ
2. Kiểm tra response

**Kết quả mong đợi**:
- Status code phù hợp (400, 401, 404, 500)
- Error message rõ ràng
- Không leak thông tin nhạy cảm

---

## Ghi chú

### Môi trường test
- **Browser**: Chrome, Firefox, Edge (latest versions)
- **Mobile**: iOS Safari, Android Chrome
- **Screen sizes**: 320px, 768px, 1024px, 1920px

### Dữ liệu test
- Chuẩn bị dữ liệu mẫu cho Units, Users, Licenses
- Có dữ liệu edge cases (tên dài, ký tự đặc biệt, v.v.)

### Automation
- Có thể tự động hóa với Playwright/Cypress
- API tests có thể dùng Postman/Jest

### Báo cáo lỗi
- Ghi rõ: Môi trường, Bước tái hiện, Kết quả thực tế, Kết quả mong đợi
- Đính kèm screenshot/video nếu cần

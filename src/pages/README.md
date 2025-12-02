# Pages Structure

Thư mục này chứa tất cả các pages của ứng dụng Trustay, được tổ chức theo các nhóm chức năng để dễ bảo trì.

## Cấu trúc thư mục

### 📁 `index.tsx`
Trang chủ của ứng dụng

### 📁 `auth/` - Xác thực
Các trang liên quan đến xác thực người dùng:
- `login-page.tsx` - Trang đăng nhập
- `register-page.tsx` - Trang đăng ký
- `link-account-page.tsx` - Trang liên kết tài khoản

### 📁 `explore/` - Khám phá & Tìm kiếm
Các trang liên quan đến tìm kiếm và khám phá phòng trọ:
- `explore-page.tsx` - Trang khám phá
- `search-page.tsx` - Trang tìm kiếm
- `room-detail-page.tsx` - Chi tiết phòng trọ
- `room-seeking-detail-page.tsx` - Chi tiết bài tìm phòng
- `roommate-detail-page.tsx` - Chi tiết tìm bạn ở ghép
- `saved-rooms-page.tsx` - Phòng đã lưu
- `tenant-preferences-page.tsx` - Sở thích người thuê
- `post-page.tsx` - Đăng tin

### 📁 `messaging/` - Tin nhắn
Các trang liên quan đến tin nhắn:
- `message-page.tsx` - Danh sách tin nhắn
- `conversation-page.tsx` - Trang hội thoại

### 📁 `contracts/` - Hợp đồng & Booking
Các trang liên quan đến hợp đồng và yêu cầu đặt phòng:
- `contracts-page.tsx` - Danh sách hợp đồng
- `contract-detail-page.tsx` - Chi tiết hợp đồng
- `booking-requests-page.tsx` - Yêu cầu đặt phòng
- `rentals-page.tsx` - Danh sách thuê
- `rental-detail-page.tsx` - Chi tiết thuê

### 📁 `payments/` - Thanh toán & Hóa đơn
Các trang liên quan đến thanh toán và hóa đơn:
- `payments-page.tsx` - Danh sách thanh toán
- `payment-detail-page.tsx` - Chi tiết thanh toán
- `invoices-page.tsx` - Danh sách hóa đơn
- `invoice-detail-page.tsx` - Chi tiết hóa đơn
- `update-bill-meter-page.tsx` - Cập nhật chỉ số đồng hồ
- `generate-monthly-bills-page.tsx` - Tạo hóa đơn hàng tháng

### 📁 `room-issues/` - Sự cố phòng
Các trang liên quan đến báo cáo và quản lý sự cố phòng:
- `room-issues-page.tsx` - Danh sách sự cố (người thuê)
- `room-issues-management-page.tsx` - Quản lý sự cố (chủ nhà)
- `room-issue-detail-page.tsx` - Chi tiết sự cố
- `report-room-issue-page.tsx` - Báo cáo sự cố

### 📁 `landlord/` - Quản lý cho chủ nhà
Các trang dành cho chủ nhà quản lý tòa nhà và phòng:
- `buildings-page.tsx` - Danh sách tòa nhà
- `building-detail-page.tsx` - Chi tiết tòa nhà
- `building-form-page.tsx` - Form thêm/sửa tòa nhà
- `rooms-page.tsx` - Danh sách phòng
- `room-detail-management-page.tsx` - Chi tiết quản lý phòng
- `room-form-page.tsx` - Form thêm/sửa phòng
- `room-instance-detail-page.tsx` - Chi tiết phiên bản phòng

### 📁 `profile/` - Hồ sơ cá nhân
Các trang liên quan đến hồ sơ người dùng:
- `profile-page.tsx` - Trang hồ sơ
- `profile-detail-page.tsx` - Chi tiết hồ sơ
- `settings-page.tsx` - Cài đặt
- `notifications-page.tsx` - Thông báo
- `EditNamePage.tsx` - Sửa tên
- `EditBioPage.tsx` - Sửa tiểu sử
- `EditGenderPage.tsx` - Sửa giới tính
- `EditDateOfBirthPage.tsx` - Sửa ngày sinh
- `EditBankInfoPage.tsx` - Sửa thông tin ngân hàng

### 📁 `ai/` - AI Assistant
Các trang liên quan đến trợ lý AI:
- `ai-assistant-page.tsx` - Trang trợ lý AI

### 📁 `others/` - Khác
Các trang khác:
- `help-center-page.tsx` - Trung tâm trợ giúp

## Routes Mapping

Tất cả các routes được định nghĩa trong `src/components/layout.tsx`. Cấu trúc routes phản ánh cấu trúc thư mục để dễ dàng tìm kiếm và bảo trì.

### Public Routes
- `/` - HomePage
- `/login` - LoginPage
- `/register` - RegisterPage
- `/explore` - ExplorePage
- `/search` - SearchPage
- `/room/:id` - RoomDetailPage
- `/room-seeking/:id` - RoomSeekingDetailPage
- `/roommate/:id` - RoommateDetailPage

### Protected Routes (Require Authentication)

#### Messaging
- `/messages` - MessagesPage
- `/conversation/:id` - ConversationPage

#### Explore & Post
- `/post-room` - PostRoomPage
- `/saved-rooms` - SavedRoomsPage
- `/tenant-preferences` - TenantPreferencesPage

#### Contracts
- `/contracts` - ContractsPage
- `/contracts/:id` - ContractDetailPage
- `/booking-requests` - BookingRequestsPage
- `/rentals` - RentalsPage
- `/rentals/:id` - RentalDetailPage

#### Payments
- `/payments` - PaymentsPage
- `/payment-detail/:id` - PaymentDetailPage
- `/invoices` - InvoicesPage
- `/invoices/:id` - InvoiceDetailPage
- `/invoices/:id/update-meter` - UpdateBillMeterPage
- `/generate-monthly-bills` - GenerateMonthlyBillsPage

#### Room Issues
- `/room-issues` - RoomIssuesPage
- `/room-issues-management` - RoomIssuesManagementPage
- `/room-issues/:id` - RoomIssueDetailPage
- `/report-room-issue/:rentalId` - ReportRoomIssuePage

#### Landlord Management
- `/buildings` - BuildingsPage
- `/buildings/create` - BuildingFormPage
- `/buildings/:id` - BuildingDetailPage
- `/buildings/:id/edit` - BuildingFormPage
- `/buildings/:id/rooms/create` - RoomFormPage
- `/rooms` - RoomsPage
- `/rooms/create` - RoomFormPage
- `/rooms/:id/manage` - RoomDetailManagementPage
- `/rooms/:id/edit` - RoomFormPage
- `/room-instances/:id` - RoomInstanceDetailPage

#### Profile
- `/profile` - ProfilePage
- `/profile-detail` - ProfileDetailPage
- `/settings` - SettingsPage
- `/notifications` - NotificationsPage
- `/profile/edit-name` - EditNamePage
- `/profile/edit-bio` - EditBioPage
- `/profile/edit-gender` - EditGenderPage
- `/profile/edit-dateofbirth` - EditDateOfBirthPage
- `/profile/edit-bankinfo` - EditBankInfoPage
- `/link-account` - LinkAccountPage

#### AI
- `/ai-assistant` - AIAssistantPage

#### Others
- `/help` - HelpCenterPage

## Quy tắc đặt tên

- Tên file sử dụng kebab-case và kết thúc bằng `-page.tsx`
- Component tên sử dụng PascalCase
- Mỗi page export default component

## Thêm page mới

Khi thêm page mới:
1. Xác định nhóm chức năng phù hợp
2. Tạo file trong thư mục tương ứng
3. Import và thêm route trong `src/components/layout.tsx`
4. Cập nhật file README.md này

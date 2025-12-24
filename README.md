# SE405 Mobile App �

## Ứng dụng di động được xây dựng bằng [Expo](https://expo.dev) + React Native.

## Yêu cầu cài đặt

Trước khi bắt đầu, hãy đảm bảo máy bạn đã cài đặt:

- **Node.js** phiên bản 18 trở lên - [Tải tại đây](https://nodejs.org/)
- **npm** (đi kèm với Node.js)
- **Git** - [Tải tại đây](https://git-scm.com/)
- **Expo Go** trên điện thoại - Tải từ App Store (iOS) hoặc Google Play (Android)

---

## Hướng dẫn chạy dự án

### Bước 1: Clone dự án

```bash
git clone <đường-dẫn-repo>
cd se405-mobileapp
```

### Bước 2: Cài đặt thư viện

```bash
npm install
```

### Bước 3: Chạy ứng dụng

```bash
npx expo start
```

Sau khi chạy lệnh, bạn sẽ thấy một mã QR code trên terminal hãy dùng camera điện thoại quét mã QR để mở app.

> **Lưu ý:** Điện thoại và máy tính cần kết nối cùng một mạng WiFi.

---

## Hướng dẫn Setup EAS (Expo Application Services) để sử tính năng push notification

### Bước 1: Tạo tài khoản Expo

1. Truy cập [expo.dev](https://expo.dev)
2. Nhấn **Sign Up** để đăng ký tài khoản mới
3. Xác nhận email

### Bước 2: Cài đặt EAS CLI

Mở terminal và chạy:

```bash
npm install -g eas-cli
```

### Bước 3: Đăng nhập vào EAS

```bash
eas login
```

Nhập email và mật khẩu tài khoản Expo của bạn.

### Bước 4: Khởi tạo dự án EAS (nếu chưa có)

```bash
eas init
```

> Lệnh này sẽ tạo/cập nhật `projectId` trong file `app.json`.

# README: Kiến trúc hệ thống FACEMESS

## Giới thiệu
Hệ thống FACEMESS là một ứng dụng tích hợp các chức năng của một mạng xã hội và nhắn tin thời gian thực. Hệ thống bao gồm ba thành phần chính: Frontend, Facebook Server, và Messenger Server. Các thành phần này được thiết kế để hoạt động độc lập nhưng hợp tác chặt chẽ để cung cấp trải nghiệm người dùng liền mạch.

## Kiến trúc hệ thống

### 1. Frontend
- **Công nghệ**: Next.js, TypeScript, Tailwind CSS, React
- **Mô tả**: Cung cấp giao diện người dùng thân thiện và phản hồi nhanh. Bao gồm các trang như Login, Profile, Friends, Posts, Chat.
- **Cấu trúc**:
  - `app`: Chứa các trang và logic chính (e.g., `chat`, `friends`, `login`, `post`, `profile`).
  - `components`: Chứa các thành phần giao diện tái sử dụng (e.g., `ChatComponent.tsx`, `FriendList.tsx`).
  - `lib`: Chứa các hàm tiện ích.
- **Vai trò**: Là điểm tiếp xúc trực tiếp với người dùng, giao tiếp với các máy chủ backend qua HTTP API và WebSocket.

### 2. Facebook Server
- **Công nghệ**: Node.js, Express, OAuth, JWT, Neon PostgreSQL
- **Mô tả**: Quản lý các chức năng liên quan đến bạn bè và bài viết (CRUD).
- **Kiến trúc**: Theo mô hình MVC (Model-View-Controller).
- **Cấu trúc**:
  - `controllers`: Xử lý logic kinh doanh (e.g., `authController.js`, `friendController.js`).
  - `models`: Định nghĩa cấu trúc dữ liệu (e.g., `friend.js`, `post.js`).
  - `routes`: Định nghĩa các endpoint API (e.g., `authRoute.js`, `friendRoute.js`).
  - `middleware`: Xử lý các chức năng chung như xác thực (e.g., `auth.js`).
- **Cơ sở dữ liệu**: Neon PostgreSQL.
- **Vai trò**: Xử lý các yêu cầu từ Frontend liên quan đến bạn bè và bài viết.

### 3. Messenger Server
- **Công nghệ**: Go, Gin, Gorilla WebSocket, OAuth 2.0, JWT, Atlas MongoDB
- **Mô tả**: Quản lý tin nhắn thời gian thực.
- **Kiến trúc**: Theo mô hình Clean Architecture.
- **Cấu trúc**:
  - `domain`: Chứa các entity cốt lõi (e.g., `message.go`, `user.go`).
  - `usecases`: Chứa logic kinh doanh (e.g., `auth_usecase.go`, `message_use_case.go`).
  - `application`: Chứa các interface và service (e.g., `friend_interface.go`, `message_service.go`).
  - `infrastructure`: Thực hiện các dịch vụ hạ tầng như cơ sở dữ liệu (e.g., `message_repository.go`).
  - `presentation/http`: Xử lý các yêu cầu HTTP và WebSocket (e.g., `handlers/auth.go`, `handlers/websocket.go`).
- **Cơ sở dữ liệu**: Atlas MongoDB.
- **Vai trò**: Xử lý giao tiếp thời gian thực qua WebSocket và cung cấp các API HTTP cho việc khởi tạo chat.

### 4. Containerization
- **Công nghệ**: Docker
- **Mô tả**: Toàn bộ hệ thống được container hóa để dễ dàng triển khai và quản lý.
- **Cấu hình**: Sử dụng `docker-compose.yml` để orchestrate các container.

### 5. Mối quan hệ giữa các thành phần
- **Frontend ↔ Facebook Server**: Giao tiếp qua HTTP API để thực hiện các chức năng liên quan đến bạn bè và bài viết.
- **Frontend ↔ Messenger Server**: Giao tiếp qua HTTP API để khởi tạo chat và qua WebSocket để nhận/gửi tin nhắn thời gian thực.
- **Facebook Server ↔ Messenger Server**: Giao tiếp qua HTTP API để lấy những dữu liệu cần thiết.

### 6. Bảo mật
- Cả hai máy chủ (Facebook Server và Messenger Server) đều sử dụng OAuth và JWT để xác thực và ủy quyền người dùng.

## Triển khai
- Hệ thống được container hóa với Docker.
- Docker Compose được sử dụng để quản lý và triển khai các dịch vụ.
- Có thể dùng concurrently để chạy hệ thống

## Tóm tắt công nghệ
| Thành phần         | Công nghệ sử dụng                                      |
|--------------------|-------------------------------------------------------|
| Frontend           | Next.js, TypeScript, Tailwind CSS, React              |
| Facebook Server    | Node.js, Express, OAuth, JWT, Neon PostgreSQL         |
| Messenger Server   | Go, Gin, Gorilla WebSocket, OAuth 2.0, JWT, Atlas MongoDB |
| DevOps             | Docker, Docker Compose / package concurrently                     |

## Kết luận
Hệ thống FACEMESS được thiết kế với kiến trúc rõ ràng, tách bạch giữa các thành phần để đảm bảo tính mở rộng và bảo trì. Frontend cung cấp giao diện người dùng, trong khi hai máy chủ backend (Facebook Server và Messenger Server) xử lý các chức năng cụ thể với các kiến trúc khác nhau (MVC và Clean Architecture). Hệ thống được bảo mật bằng OAuth và JWT, và được container hóa với Docker để dễ dàng triển khai.

B. CÁch chạy project
SAu khi clone project từu github, bổ sung các file env cần thiết cho mỗi server
- Frontend:
FACEBOOK_SERVICE_URL=
MESSENGER_SERVER_URL=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_GOOGLE_AUTH_URL=
NEXT_PUBLIC_MESSENGER_SERVER_URL=
NEXT_PUBLIC_FB_SERVER_URL=
NODE_ENV=
PORT=

- Facebook Server: 
PORT=
NODE_ENV=
DATABASE_URL=
JWT_SECRET=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=

- Messenger-server: 
MONGO_URL=
JWT_SECRET=your_jwt_secret
FACEBOOK_SERVICE_URL=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=
GO_ENV=
PORT=
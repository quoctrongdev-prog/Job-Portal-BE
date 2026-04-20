# Job Portal Backend

Backend service for the Job Portal System, built with Node.js and Express, following an event-driven architecture.

---

## Frontend Repository

https://github.com/quoctrongdev-prog/Job-Portal-FE

---

## Features

- RESTful API for job portal system
- Authentication & Authorization (JWT, HTTP-only cookies)
- Role-based access control (Jobseeker / Recruiter)
- Job posting and application management
- Profile management
- Email notifications for application status updates
- Email notifications for reset password

---

## System Design

- Event-driven architecture using Kafka for asynchronous processing
- Redis used for caching to improve performance and reduce response time
- Modular and scalable backend structure

---

## AI Integration

- Resume evaluation
- Career guidence
- Model: gemini-3-flash-preview
(Powered by Gemini API)

---

## Tech Stack

- Node.js
- Express.js
- PostgreSQL
- JWT Authentication
- Neon DB

---

## Advanced Technologies

- Kafka (event-driven processing)
- Redis (caching)
- Docker (containerization)

---

## ⚙️ Setup Locally

### 1. Clone repository
```bash
git clone https://github.com/quoctrongdev-prog/Job-Portal-BE
cd services
```
## Install dependencies
```bash
npm install
```
## Setup environment variables

### auth
```bash
PORT=5000  <br>
DB_URL=your_db_url  <br>
UPLOAD_SERVICE=http://localhost:5001  <br>
JWT_SEC=your_jwt_sec  <br>
Kafka_Broker=your_kafka_broker  <br>
Frontend_Url=http://localhost:3000  <br>
Redis_url=your_redis_url  <br>
```

### job
```bash
PORT=5003  <br>
DB_URL=your_db_url  <br>
UPLOAD_SERVICE=http://localhost:5001  <br>
JWT_SEC=your_jwt_sec  <br>
Kafka_Broker=your_kafka_broker  <br>
```

### user
```bash
PORT=5002  <br>
DB_URL=your_db_url  <br>
UPLOAD_SERVICE=http://localhost:5001  <br>
JWT_SEC=your_jwt_sec  <br>
```

### utils
```bash
PORT=5001  <br>
CLOUD_NAME=your_cloudinary_name  <br>
API_KEY=your_api_cloudinary_key  <br>
API_SECRET=your_api_cloudinary_key_sec  <br>
Kafka_Broker=your_kafka_broker  <br>
SMTP_USER=your_user  <br>
SMTP_PASS=your_app_password_gmail  <br>
API_KEY_GEMINI=your_api_key_gemini  <br>
```

## Run server
```bash
npm run dev
```
 <br>
### auth: http://localhost:5000
### utils: http://localhost:5001
### user: http://localhost:5002
### job: http://localhost:5003

# Author
Vũ Quốc Trọng  <br>
GitHub: https://github.com/quoctrongdev-prog

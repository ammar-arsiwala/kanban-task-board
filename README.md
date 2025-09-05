# 🗂️ Kanban Task Board 

A fullstack Kanban-style task To-Do Web Application.

---

## 🚀 Getting Started

### 1. Install Server and Client Packages

#### 🖥️ Client Setup

```bash
cd ../client
npm install
```
🛠️ Server Setup
```bash
cd ../server
npm install
```
2. Run Frontend and Backend Servers

▶️ Frontend
```bash
cd ../client
npm start
```
⚙️ Backend
```bash
cd ../server
npm run dev
```
🔐 Environment Configuration

Create a .env file in the server directory with the following keys:
```bash
FRONTEND_URL=http://localhost:<port>
REACT_APP_API_URL=http://localhost:<port>
PORT=<your_backend_port>
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
JWT_SECRET=<your_jwt_secret>
NODE_ENV=development
```bash
Replace <port>, <username>, <password>, <cluster>, <database>, and <your_jwt_secret> with your actual values.

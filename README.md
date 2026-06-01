# UnityMedia 🌐

> A full-stack social media platform built with the MERN stack — featuring real-time chat, secure authentication, and cloud-based media sharing.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-unitymedia.onrender.com-black?style=for-the-badge&logo=onrender)](https://unitymedia.onrender.com)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com)
[![Socket.io](https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&badgeColor=010101)](https://socket.io)

---

## 📸 Screenshots

> _Add your screenshots here by replacing the placeholder paths below_

| Feed | Real-Time Chat | Profile |
|------|----------------|---------|
| ![Feed](screenshots/feed.png) | ![Chat](screenshots/chat.png) | ![Profile](screenshots/profile.png) |

---

## ✨ Features

- 🔐 **Secure Authentication** — JWT-based login/signup with Bcrypt password hashing
- 💬 **Real-Time Chat** — Instant messaging powered by Socket.IO with online status indicators
- 🖼️ **Media Upload** — Image/video upload via Multer with cloud storage through Cloudinary
- 📰 **Social Feed** — Create, like, comment, and share posts in a dynamic news feed
- 👤 **User Profiles** — Customizable profiles with avatar, bio, and followers/following system
- 🔔 **Notifications** — Real-time notifications for likes, comments, and new followers
- 📱 **Responsive Design** — Fully responsive UI that works seamlessly on mobile and desktop
- 🗂️ **Global State Management** — Smooth, predictable UI state handled with Redux

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React.js | Component-based UI |
| Redux | Global state management |
| Context API | Auth & theme context |
| SCSS | Styling & responsive layout |
| Socket.IO Client | Real-time communication |

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express.js | REST API server |
| Socket.IO | WebSocket real-time layer |
| JWT | Stateless authentication |
| Bcrypt | Password hashing |
| Multer | File upload handling |
| Cloudinary | Cloud media storage |

### Database
| Technology | Purpose |
|---|---|
| MongoDB | NoSQL document database |
| Mongoose | ODM schema & validation |

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:
- [Node.js](https://nodejs.org/) v18+
- [MongoDB](https://mongodb.com/) (local or Atlas)
- A [Cloudinary](https://cloudinary.com/) account (free tier works)

### 1. Clone the Repository

```bash
git clone https://github.com/kushal1825/unitymedia.git
cd unitymedia
```

### 2. Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../Frontend
npm install
```

### 3. Configure Environment Variables

Create a `.env` file inside the `/backend` directory (use `.env.sample` as reference):

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
CLIENT_URL=http://localhost:3000
```

Create a `.env` file inside the `/Frontend` directory:

```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_SOCKET_URL=http://localhost:5000
```

### 4. Run the Application

```bash
# Start the backend server (from /backend)
npm run dev

# Start the frontend (from /Frontend)
npm start
```

The app will be available at `http://localhost:3000` 🎉

---

## 📁 Project Structure

```
unitymedia/
├── Frontend/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── context/          # Auth & theme context
│   │   ├── utils/            # Helper functions & API calls
│   │   |── route/           # route
|   |   ├── App.css
|   |   ├── App.jsx
|   |   ├── PrivateRoute.jsx
|   |   ├── index.css
|   |   └── index.jsx
│   ├── package.json
│   └── vercel.json           # Vercel deployment config
│
├── backend/                  # Node.js + Express backend
│   ├── emails/               # Email templates
│   ├── public/temp/          # Temporary file storage
│   ├── src/
│   │   ├── controllers/      # Route handler logic
│   │   ├── models/           # Mongoose schemas
│   │   ├── routes/           # Express API routes
│   │   ├── middleware/       # Auth, error handling middleware
│   │   ├── socket/           # Socket.IO event handlers
│   │   └── utils/            # Cloudinary config, helpers
│   ├── .env.sample           # Environment variable template
│   ├── package.json
│   └── vercel.json           # Vercel deployment config
│
└── README.md
```

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Login and receive JWT |
| `POST` | `/api/auth/logout` | Logout user |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/users/:id` | Get user profile |
| `PUT` | `/api/users/:id` | Update profile |
| `PUT` | `/api/users/:id/follow` | Follow / Unfollow user |

### Posts
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/posts` | Get timeline feed |
| `POST` | `/api/posts` | Create a new post |
| `PUT` | `/api/posts/:id/like` | Like / Unlike a post |
| `DELETE` | `/api/posts/:id` | Delete a post |

### Messages
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/conversations/` | Get all conversations |
| `GET` | `/api/:userid` | Get messages in a conversation |
| `POST` | `/api/send` | Send a new message |

---

## 🔒 Security

- Passwords are hashed using **Bcrypt** (salt rounds: 12) — never stored in plain text
- **JWT tokens** are stored in HTTP-only cookies to prevent XSS attacks
- All protected routes use a custom **auth middleware** that validates tokens
- User input is validated and sanitized before database operations
- **CORS** is configured to allow only trusted origins

---

## 🌐 Deployment

The application is deployed on **Vercel**:

- **Frontend:** React app deployed via onrender
- **Backend:** Node.js server deployed as onrender
- **Database:** MongoDB Atlas (cloud-hosted)
- **Media:** Cloudinary CDN

🔗 **Live:** [unitymedia.onrender.com](https://unitymedia.onrender.com)

---

## 🛣️ Roadmap

- [ ] Dark mode toggle
- [ ] Post stories (24-hour expiry)
- [ ] Video calling via WebRTC
- [ ] Push notifications (PWA)

---



## 👨‍💻 Author

**Kushal Kalsariya**
- 🌍 Chemnitz, Germany
- 📧 [kushalkalsariya20@gmail.com](mailto:kushalkalsariya20@gmail.com)
- 💼 [LinkedIn](https://linkedin.com/in/kushal-kalsariya)
- 🐙 [GitHub](https://github.com/kushal1825)

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Built with ❤️ by Kushal Kalsariya
</p>

# Chat — Real-time Messaging App

>A modern, lightweight real-time chat application with WebSockets, JWT auth, and media uploads.

---

## Features
- Real-time messaging using Socket.IO with cookie-based JWT authentication
- Optimistic UI for sending messages
- User presence / online status
- Image uploads (Cloudinary)
- Email notifications (Resend)
- Simple React + Vite frontend with Zustand store and Tailwind CSS

---

## Tech stack
- Client: React, Vite, Tailwind CSS, Zustand
- Server: Node.js, Express, MongoDB (Mongoose), Socket.IO
- Integrations: Cloudinary (image uploads), Resend (emails)

---

## Quick start (development)

Prerequisites:
- Node.js v16+
- MongoDB running locally or a remote URI

Clone and install:

```bash
git clone <repo-url>
cd chat

# Server
cd Server
npm install

# Client
cd ../Client
npm install
```

Create a `.env` in `Server/` with the variables below (examples from the project):

```text
PORT=4000
MONGO_URI=mongodb://localhost:27017/ChatApp
NODE_ENV=development
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=Your App <no-reply@example.com>
EMAIL_FROM_NAME=Your App
CLOUDINAY_CLOUD_NAME=...
CLOUDINAY_API_KEY=...
CLOUDINAY_API_SECRET=...
ARCJET_KEY=...
ARCJET_ENV=development
```

Note: the project uses the exact environment variable names defined in `Server/src/lib/env.js`.

Run the apps:

```bash
# Start server
cd Server
npm run start

# Start client (separate terminal)
cd Client
npm run dev
```

Open the app at: `http://localhost:5173` (or the `CLIENT_URL` you configured).

---

## Production / Deployment

Build the client and serve from the server (example):

```bash

cd Client
npm run build

cd ../Server
NODE_ENV=production npm run start
```

Deployment link: https://chat-g9ly.onrender.com

Recommended hosts: Vercel (frontend), Railway/Render/Heroku (server + env), or a single VPS.

Make sure to set all required environment variables in your deployment provider.

---

## Socket & Auth Notes
- Socket connections are authenticated via the `jwt` cookie. Ensure clients call the auth endpoints so the cookie is set before attempting to open sockets.
- Online users are broadcast via the `getOnlineUsers` event.

---

## Contributing
- Open an issue for features/bugs
- Create a branch, implement, add tests if relevant, and open a pull request


---
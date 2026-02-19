# Study Notes Desktop App

A desktop application built with Electron, React, and Express.

## 📁 Project Structure

```
my study app/
├── backend/
│   ├── server.js          # Express backend server
│   ├── db.json            # Database file
│   ├── package.json       # Backend dependencies
│   └── package-lock.json
├── dist/                  # React production build
│   ├── index.html
│   └── assets/
├── src/                   # React source code
│   ├── App.jsx
│   ├── components/
│   └── ...
├── main.js                # Electron main process
├── package.json           # Main project dependencies
└── vite.config.js         # Vite configuration
```

## 🚀 How to Run

### Desktop App (Recommended)

```bash
npm start
```

This will:
- Automatically start the Express backend on port 5000
- Open the Electron desktop window (1000x700)
- Load the React app
- Everything works offline

### Development Mode (Web)

```bash
# Terminal 1 - Start backend
cd backend
node server.js

# Terminal 2 - Start frontend
npm run dev
```

## 🛠️ Build Instructions

If you make changes to the React frontend:

```bash
npm run build
```

Then run the desktop app:

```bash
npm start
```

## ✨ Features

- **Offline-first**: Everything runs locally
- **Auto-start backend**: Backend server starts automatically with the app
- **Desktop native**: Runs as a standalone Windows application
- **Data persistence**: All data saved to `backend/db.json`
- **Modern UI**: React with Tailwind CSS
- **Image support**: Upload and paste screenshots
- **Nested structure**: Courses containing posts

## 📦 Technologies

- **Electron**: Desktop app framework
- **React**: Frontend UI
- **Express**: Backend API
- **Tailwind CSS**: Styling
- **Vite**: Build tool

## 🔧 Key Files

### main.js
Main Electron process that:
- Starts the Express server automatically
- Creates the application window
- Handles app lifecycle
- Cleans up resources on quit

### backend/server.js
RESTful API with endpoints:
- `GET/POST/PUT/DELETE /courses`
- `POST/PUT/DELETE /courses/:id/posts`

### package.json
Main configuration with:
- `"main": "main.js"` - Electron entry point
- `"start": "electron ."` - Launch command

## 📝 Notes

- The backend runs on **port 5000**
- Window size is **1000x700 pixels**
- All data persists in `backend/db.json`
- Images are stored as base64 in the database

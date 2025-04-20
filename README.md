# Real-Time Chat Application Documentation

## Overview

The Real-Time Chat Application is a web-based chat platform that allows users to join or create chat sessions and communicate in real-time. It uses React and TypeScript for the frontend, and Node.js and TypeScript with Socket.IO for the backend. The application supports multiple users in a session, displaying messages with timestamps and usernames, and provides a clean, responsive user interface.


## Setup Instructions

### Clone the Repository

If you have a GitHub repository, clone it:

```bash
git clone <repository-url>
cd RealTimeChatApp
```

### Backend Setup

1. Navigate to the backend directory:

   ```bash
   cd backend
   ```
2. Install dependencies:

   ```bash
   npm install
   ```
3. Compile TypeScript to JavaScript:

   ```bash
   npm run build
   ```
   
4. Start the backend server:

   ```bash
   npm start
   ```
   - The server will run on `http://localhost:5000`.

### Frontend Setup

1. Navigate to the frontend directory:

   ```bash
   cd frontend
   ```
2. Install dependencies:

   ```bash
   npm install
   ```
3. Start the frontend development server:

   ```bash
   npm run start
   ```
   - The app will run on `http://localhost:3000`.
   - It will connect to the backend at `http://localhost:5000` by default.

### Verify the Setup

- Open `http://localhost:3000` in your browser.
- You should see the join screen with username and session ID input fields.
- Enter a username and optionally a session ID, then click "Join Chat" to start chatting.


## Usage Guide

1. **Access the Application**:

   - Open the app in your browser (`http://localhost:3000`).
   - You’ll see the join screen with the title "Welcome to Real-Time Chat".

2. **Join or Create a Session**:

   - **Username**: Enter your username in the "Enter your username" input field (defaults to "Anonymous" if left blank).
   - **Session ID**: Enter a session ID in the "Enter session ID" input field to join an existing session, or leave it blank to create a new session.
   - Click "Join Chat" to proceed.
   - If joining a session fails (e.g., invalid session ID), an error message will appear.

3. **Chat Screen**:

   - Once joined, you’ll see the chat screen with:
     - Your username and session ID at the top.
     - A "Copy" button to copy the session ID for sharing.
     - A message area showing the chat history.
     - An input field and "Send" button at the bottom to send messages.
     - A "Leave Session" button (logout icon) in the top-right corner.
   - Type a message and press "Send" to send it. Messages are broadcast to all users in the session in real-time.

4. **Leave a Session**:

   - Click the "Leave Session" button (in the top-right corner) to exit the session.
   - You’ll return to the join screen, and your session data will be cleared.
   - Session will be deleted once the last person leaves the session

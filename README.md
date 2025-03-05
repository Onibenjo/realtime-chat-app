# Realtime Chat App

This application allows users to chat in real-time using **Socket.IO** for seamless communication. It features a list of online users in a room, the ability to create new rooms, and a simple authentication system. The app is built with a **Node.js** backend and a **React** frontend, styled using **Tailwind CSS**.

---

## Features

- **Realtime Messaging**: Powered by Socket.IO for instant message delivery.
- **Online Users**: See who is online in the current room.
- **Room Creation**: Create new chat rooms on the fly.
- **Default Room**: A general default room is available if no rooms exist.
- **Simple Authentication**: Enter a username to log in (stored in a cookie).
- **Responsive Layout**: Sidebar for room list and main area for chat history and message input.
- **In-Memory Store**: Rooms and messages are stored in memory (resets on server restart).

---

## Areas for Improvement

- **Pagination for Room List**: Currently, the list of rooms does not support pagination.
- **Lazy Loading for Messages**: Room messages are not lazily loaded, which could be optimized for performance.
- **Persistent Storage**: Messages and rooms are stored in memory, so they are lost on server restart. Consider integrating a database for persistence.
- **Better State Management**: useState for used and states were prop drilled to other components. It can be further broken down into components and a state management like Zustand or Redux can be used to share state across smaller components.

---

## Project Structure

The project is divided into two main folders:

1. **Server**: Contains the backend logic (Node.js + Socket.IO).
2. **Client**: Contains the frontend logic (React + Tailwind CSS).

---

## Installation and Setup

### Prerequisites

- Node.js and npm installed on your machine.

### Steps to Run the Project

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd <repository-folder>
   ```

2. **Install dependencies for both server and client**:
   ```bash
   cd chat-app-be
   npm install

   cd ../chat-app
   npm install
   ```

3. **Start the server**:
   ```bash
   cd chat-app-be
   node server.js
   ```

4. **Start the client**:
   ```bash
   cd chat-app
   npm run dev
   ```

5. **Access the app**:
   Open your browser and navigate to `http://localhost:5173`

---

## How It Works

### Authentication
- When you first land on the app, you'll see a login page with a username field.
- Enter a username and click "Login". Your username is stored in a cookie, granting you access to the app.

### Layout
- **Sidebar**: Displays the list of available rooms. You can click on a room to join it or create a new room.
- **Main Message Area**:
  - Displays the chat history for the current room.
  - Includes a chat box to send messages in real-time.
  - Shows a list of online users in the current room.

### Room Creation
- Click the "Create Room" button in the sidebar to create a new room.
- Once created, the room will appear in the sidebar, and you can join it.

### Default Room
- If no rooms exist, a default room named "General" is automatically created for users to join.

---

## Technologies Used

- **Backend**:
  - Node.js
  - Socket.IO (for realtime communication)
  - Express (for server setup)
- **Frontend**:
  - React (for UI)
  - Tailwind CSS (for styling)
- **State Management**:
  - State for values sharing across components (depending on implementation)
- **Authentication**:
  - Simple cookie-based authentication (username stored in a cookie)

---

## Future Enhancements

1. **Pagination for Room List**: Implement pagination to handle a large number of rooms.
2. **Lazy Loading for Messages**: Load messages dynamically as the user scrolls.
3. **Persistent Storage**: Integrate a database (e.g., MongoDB, PostgreSQL) to store rooms and messages permanently.
4. **User Authentication**: Add more robust authentication (e.g., OAuth, JWT).
5. **Message History**: Store and display message history even after server restart.
6. **User Profiles**: Allow users to set profiles, avatars, and statuses.
7. **Notifications**: Add notifications for new messages or mentions.
8. **Responsive Design**: Further optimize the UI for mobile devices.

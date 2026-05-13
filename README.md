# Carpoolio

A carpooling web application that connects drivers with passengers heading in the same direction. This platform aims to make commuting more affordable, environmentally friendly, and social.

## ✨ Features

*   **User Authentication**: Secure user registration and login.
*   **Ride Management**: Drivers can post available rides, and passengers can search for and book them.
*   **Real-time Negotiation**: Passengers can negotiate fares with drivers.
*   **User Profiles**: Manage user profiles and vehicle information.
*   **Ride History**: View past rides for both drivers and passengers.
*   **Notifications**: Receive updates on ride requests, bookings, and negotiations.
*   **Review System**: Rate and review drivers and passengers after a ride.
*   **Saved Routes**: Save frequently used routes for quick access.

## 🛠️ Technologies Used

### Frontend (Client-side)

*   **[React](https://reactjs.org/)**: A JavaScript library for building user interfaces.
*   **[Vite](https://vitejs.dev/)**: A fast build tool and development server for modern web projects.
*   **[React Router](https://reactrouter.com/)**: For declarative routing in the React application.
*   **[Tailwind CSS](https://tailwindcss.com/)**: A utility-first CSS framework for rapid UI development.
*   **[daisyUI](https://daisyui.com/)**: A component library for Tailwind CSS.
*   **[Lucide React](https://lucide.dev/)**: A library of simply beautiful icons.
*   **[React Hot Toast](https://react-hot-toast.com/)**: For user-friendly notifications.

### Backend (Server-side)

*   **[Node.js](https://nodejs.org/)**: A JavaScript runtime environment.
*   **[Express.js](https://expressjs.com/)**: A fast, unopinionated, minimalist web framework for Node.js.
*   **[MongoDB](https://www.mongodb.com/)**: A NoSQL database for storing application data.
*   **[Mongoose](https://mongoosejs.com/)**: An ODM (Object Data Modeling) library for MongoDB and Node.js.
*   **[JSON Web Tokens (JWT)](https://jwt.io/)**: For securing API endpoints and authenticating users.
*   **[Bcrypt.js](https://github.com/kelektiv/bcrypt.js)**: For hashing passwords.
*   **[Multer](https://github.com/expressjs/multer)**: Middleware for handling `multipart/form-data`, used for file uploads.

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Make sure you have the following software installed on your machine:

*   [Node.js](https://nodejs.org/en/download/) (v18.x or later recommended)
*   [npm](https://www.npmjs.com/get-npm) (comes with Node.js)
*   [MongoDB](https://www.mongodb.com/try/download/community) (or a MongoDB Atlas account)

### Installation & Setup

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/your-username/Carpoolio.git
    cd Carpoolio
    ```

2.  **Install dependencies for both frontend and backend:**
    This will run the `postinstall` script which also installs the backend dependencies.
    ```sh
    npm install
    ```

3.  **Set up environment variables for the backend:**
    Create a `.env` file in the `backend` directory (`/backend/.env`) and add the following variables. Replace the placeholder values with your actual data.
    ```env
    PORT=5000
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret
    JWT_COOKIE_EXPIRES_IN=30
    ```

### Running the Application

You will need to run the frontend and backend servers in separate terminals.

1.  **Start the Backend Server:**
    Navigate to the project root directory and run:
    ```sh
    npm run dev
    ```
    This will start the Node.js/Express server on `http://localhost:5000` with `nodemon`, which automatically restarts the server on file changes.

2.  **Start the Frontend Development Server:**
    In a new terminal, navigate to the `view` directory and run:
    ```sh
    cd view
    npm run dev
    ```
    This will start the Vite development server, and you can access the React application at `http://localhost:5173` (or another port if 5173 is in use).

## 📂 Project Structure

The project is organized into two main parts: a `backend` for the server-side logic and a `view` for the client-side React application.

```
Carpoolio/
├── backend/
│   ├── src/
│   │   ├── config/       # Database connection
│   │   ├── controllers/  # Request handling logic
│   │   ├── middleware/   # Express middleware
│   │   ├── models/       # Mongoose schemas
│   │   ├── routes/       # API routes
│   │   └── server.js     # Main server entry point
│   └── package.json
│
├── view/
│   ├── src/
│   │   ├── components/   # Reusable React components
│   │   ├── pages/        # Page components
│   │   ├── App.jsx       # Main App component with routing
│   │   └── main.jsx      # React app entry point
│   └── package.json
│
└── README.md
```

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

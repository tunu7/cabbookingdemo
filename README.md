# Cab Booking Demo – README Files

## Root `README.md`

````md
# Cab Booking Demo

A full-stack real-time cab booking application built using the MERN stack.

The project includes:

- Customer App – Users can book rides and track drivers.
- Driver App – Drivers can update live location and accept bookings.
- Backend API – Handles authentication, booking management, sockets, and database operations.

---

## Tech Stack

### Frontend
- React.js
- Vite
- React Router DOM
- React Leaflet
- Socket.IO Client
- Axios

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- Socket.IO

---

## Project Structure

```bash
cabbookingdemo-main/
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── socket/
│   ├── utils/
│   └── server.js
│
├── frontend/
│   ├── customer-app/
│   └── driver-app/
│
└── README.md
````

---

## Features

### Customer App

* User authentication
* View nearby drivers
* Book rides
* Live driver tracking
* Interactive maps using Leaflet

### Driver App

* Driver authentication
* Live location updates
* Accept customer bookings
* Real-time ride updates

### Backend

* REST API support
* JWT authentication
* MongoDB integration
* Real-time communication using Socket.IO

---

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/cabbookingdemo.git
cd cabbookingdemo
```

---

## Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file inside the backend folder.

Example:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
CLIENT_URL=http://localhost:5173
```

Run the backend server:

```bash
npm run dev
```

---

## Customer App Setup

```bash
cd frontend/customer-app
npm install
```

Create `.env` file:

```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

Run the customer app:

```bash
npm run dev
```

---

## Driver App Setup

```bash
cd frontend/driver-app
npm install
```

Create `.env` file:

```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

Run the driver app:

```bash
npm run dev
```

---

## API Overview

### Authentication

* Register User
* Login User
* Register Driver
* Login Driver

### Booking

* Create booking
* Fetch bookings
* Update ride status

### Driver

* Update driver location
* Fetch nearby drivers

---

## Real-Time Features

Socket.IO is used for:

* Live driver location updates
* Booking notifications
* Ride status synchronization
* Real-time map updates

---

## Deployment

### Frontend

You can deploy the frontend apps using:

* Vercel
* Netlify

### Backend

You can deploy the backend using:

* Render
* Railway
* VPS

### Database

* MongoDB Atlas

---

## Future Improvements

* Payment integration
* Ride fare calculation
* Ride history
* Ratings and reviews
* Admin dashboard
* Push notifications

---

## Author

Developed by Tunu Doley.

````

---

# Backend `backend/README.md`

```md
# Backend – Cab Booking Demo

Backend API for the Cab Booking Demo application.

---

## Tech Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- Socket.IO

---

## Installation

```bash
npm install
````

---

## Environment Variables

Create a `.env` file:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
CLIENT_URL=http://localhost:5173
```

---

## Running the Server

Development:

```bash
npm run dev
```

Production:

```bash
npm start
```

---

## Folder Structure

```bash
backend/
│
├── config/
├── controllers/
├── middleware/
├── models/
├── routes/
├── socket/
├── utils/
└── server.js
```

---

## Features

* User Authentication
* Driver Authentication
* Booking APIs
* Driver location updates
* Socket.IO integration
* MongoDB database support

---

## Socket Events

### Emit Events

* `driver-location-update`
* `new-booking`
* `ride-status-update`

---

## API Endpoints

### Auth Routes

* `/api/auth/register`
* `/api/auth/login`

### Driver Routes

* `/api/drivers/location`
* `/api/drivers/all`

### Booking Routes

* `/api/bookings/create`
* `/api/bookings/update`

---

## Deployment

Recommended Platforms:

* Render
* Railway
* VPS

---

## Author

Tunu Doley

````

---

# Customer App `frontend/customer-app/README.md`

```md
# Customer App – Cab Booking Demo

Frontend application for customers to book rides and track drivers in real-time.

---

## Tech Stack

- React.js
- Vite
- React Router DOM
- React Leaflet
- Axios
- Socket.IO Client

---

## Installation

```bash
npm install
````

---

## Environment Variables

Create a `.env` file:

```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

---

## Run Application

```bash
npm run dev
```

---

## Features

* User authentication
* Book rides
* View nearby drivers
* Live ride tracking
* Interactive map integration
* Real-time updates using Socket.IO

---

## Build for Production

```bash
npm run build
```

---

## Preview Production Build

```bash
npm run preview
```

---

## Folder Structure

```bash
customer-app/
│
├── src/
├── public/
├── package.json
└── vite.config.js
```

---

## Deployment

Recommended:

* Vercel
* Netlify

---

## Author

Tunu Doley

````

---

# Driver App `frontend/driver-app/README.md`

```md
# Driver App – Cab Booking Demo

Frontend application for drivers to manage bookings and update live locations.

---

## Tech Stack

- React.js
- Vite
- React Router DOM
- React Leaflet
- Axios
- Socket.IO Client
- Geolib

---

## Installation

```bash
npm install
````

---

## Environment Variables

Create a `.env` file:

```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

---

## Run Application

```bash
npm run dev
```

---

## Features

* Driver authentication
* Live location updates
* Accept ride requests
* Real-time booking synchronization
* Interactive map support
* Route and distance calculation

---

## Build for Production

```bash
npm run build
```

---

## Preview Production Build

```bash
npm run preview
```

---

## Folder Structure

```bash
driver-app/
│
├── src/
├── public/
├── package.json
└── vite.config.js
```

---

## Deployment

Recommended:

* Vercel
* Netlify

---

## Author

Tunu Doley

```
```

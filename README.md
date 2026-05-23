# Cab Booking Demo App

A full-stack MERN Cab Booking Demo Application with:

- Customer App
- Driver App
- Live Driver Tracking
- Ride Requests
- Real-time Ride Status Updates
- Interactive Maps using Leaflet
- Socket.IO Realtime Communication

---

# Features

## Customer App

Customers can:

- Register / Login
- Use current location automatically
- Select destination from map
- Book rides
- Track driver live on map
- View driver distance
- View ride status updates

---

## Driver App

Drivers can:

- Register / Login
- Go Online / Offline
- Receive ride requests in realtime
- Accept / Reject rides
- Update live location
- Start trip
- Complete trip
- View customer pickup location
- Simulate movement by clicking map

---

# Tech Stack

## Frontend

- React.js
- React Router
- Axios
- React Leaflet
- Socket.IO Client

## Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- Socket.IO

---

# Project Structure

```bash
cab-booking/
│
├── backend/
│
├── frontend/
│   ├── customer-app/
│   └── driver-app/
Installation
1. Clone Repository
git clone https://github.com/tunu7/cabbookingdemo.git
Backend Setup
Navigate
cd backend
Install Dependencies
npm install
Create .env
PORT=5007
MONGO_URI=YOUR_MONGODB_URI
JWT_SECRET=YOUR_SECRET
Run Backend
npm run dev

Server runs on:

http://localhost:5007
Customer App Setup
Navigate
cd frontend/customer-app
Install Dependencies
npm install
Run
npm run dev

Customer app runs on:

http://localhost:5173
Driver App Setup
Navigate
cd frontend/driver-app
Install Dependencies
npm install
Run
npm run dev

Driver app runs on:

http://localhost:5174
Realtime Features

This project uses:

Socket.IO
Live polling
MongoDB realtime updates

for:

Ride requests
Driver tracking
Ride status updates
Maps

Maps are implemented using:

OpenStreetMap
React Leaflet

Features:

Live driver marker
Pickup marker
Destination marker
Route polyline
Ride Flow
Customer
Login
Current location auto detected
Choose destination
Book ride
Wait for driver
Track driver live
Driver
Login
Go Online
Receive ride request
Accept ride
Move driver marker
Start trip
Complete trip
API Routes
Ride Routes
POST   /api/rides/book
GET    /api/rides/pending
GET    /api/rides/:id
GET    /api/rides/:rideId/driver-location
POST   /api/rides/:id/accept
POST   /api/rides/:id/reject
PATCH  /api/rides/:id/status
Authentication

JWT Authentication is used.

Protected routes require:

Authorization: Bearer TOKEN
Future Improvements
Google Maps Integration
Route Optimization
Fare Calculation
Driver ETA
Payment Gateway
Ride History
Notifications
Production Deployment
Author

Tunu Doley

GitHub:
https://github.com/tunu7
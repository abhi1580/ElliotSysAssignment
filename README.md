# Task Management Application (MERN)

A full-stack task management app built with MongoDB, Express.js, React.js, and Node.js.

## Features
- User authentication (signup, login, logout) with JWT
- Dashboard to display, create, edit, delete, and mark tasks as complete/incomplete
- Task filtering (by status, priority), sorting, and search
- Pagination for task lists
- Modern, responsive UI with Material-UI
- State management with Redux
- Form validation, loading states, and error handling
- RESTful API with Swagger/OpenAPI documentation
- Unit tests for backend

## Technologies Used
- **Frontend:** React, TypeScript, Redux, Material-UI, Axios, Vite
- **Backend:** Node.js, Express.js, MongoDB, Mongoose, JWT, Joi, Swagger-UI-Express
- **Testing:** Jest, Supertest

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB Atlas or local MongoDB instance

### Backend Setup
```bash
cd server
npm install
# Create a .env file with your MongoDB URI and JWT secret
npm run dev
```
The backend runs on `http://localhost:5000` by default.

### Frontend Setup
```bash
cd client
npm install
npm run dev
```
The frontend runs on `http://localhost:5173` by default.

## API Documentation
Interactive API docs are available at:
```
http://localhost:5000/api/docs
```
- All endpoints, request/response schemas, and authentication details are documented.

## Project Structure
```
ElliotSysAssignment/
  client/   # React frontend
  server/   # Express backend
```
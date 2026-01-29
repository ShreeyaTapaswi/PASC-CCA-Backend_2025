# Backend Setup Guide

This guide details the steps to set up the **Backend** application locally.

## Prerequisites
- **Node.js**: (v18 or higher recommended)
- **Docker & Docker Compose**: (Recommended for Database and easy setup)

---

## Setup Options

The backend runs on Port **4000** by default.

### Option A: Using Docker (Recommended)
This sets up the PostgreSQL database and the backend application automatically.

1. **Setup Environment**:
   ```bash
   make setup
   # OR manually: cp env.docker.example .env && docker-compose build && docker-compose up -d
   ```
2. **Access**:
   The API will be available at **http://localhost:4000** (depending on your docker-compose port mapping).

### Option B: Running Locally (Non-Docker App)
Use this if you want to run the Node.js app on your machine but use Docker/Local for the Database.

1. **Database Setup**:
   Ensure PostgreSQL is running. You can start just the DB via Docker:
   ```bash
   docker-compose up -d postgres
   ```
2. **Install Dependencies**:
   ```bash
   npm install
   ```
3. **Configuration**:
   - Create `.env` from `env.docker.example`.
   - The app defaults to port 4000. You can override this by setting `PORT` in `.env`.
4. **Database Migration**:
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```
5. **Start Server**:
   ```bash
   npm run dev
   ```
   API will be available at **http://localhost:4000**.

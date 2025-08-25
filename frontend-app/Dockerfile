# Frontend Dockerfile - Solo para React/Vite
FROM node:lts-alpine

# Create and change to the app directory
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install packages (use npm install to avoid ci lockfile issues)
RUN npm install

# Copy local code to the container image
COPY . ./ 

# Build the React frontend
RUN npm run build

# Serve the built frontend using serve package
CMD ["npx", "serve", "--single", "--listen", "8080", "dist"]

# Use the Node official image
# https://hub.docker.com/_/node
FROM node:lts

# Create and change to the app directory.
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install packages
RUN npm install

# Copy local code to the container image
COPY . ./ 

# Serve the backend (NO BUILD NEEDED FOR BACKEND)
CMD ["npm", "run", "start"]

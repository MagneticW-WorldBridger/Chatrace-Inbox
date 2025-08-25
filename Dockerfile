# Use the Node official image
# https://hub.docker.com/_/node
FROM node:lts

# Create and change to the app directory.
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install packages (use npm install instead of npm ci for flexibility)
RUN npm install

# Copy local code to the container image
COPY . ./ 

# Build the frontend
RUN npm run build

# Serve the app
CMD ["npm", "run", "start"]

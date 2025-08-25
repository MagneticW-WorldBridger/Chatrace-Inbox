# Use the Node official image
# https://hub.docker.com/_/node
FROM node:lts

# Create and change to the app directory.
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install packages and fix Rollup Linux issue
RUN npm install && \
    rm -rf node_modules/.cache && \
    npm install --force

# Copy local code to the container image
COPY . ./ 

# Build the frontend with clean cache
RUN npm run build

# Serve the app
CMD ["npm", "run", "start"]

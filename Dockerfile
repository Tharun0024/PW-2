# Stage 1: Build the React application
FROM node:18-alpine AS build
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application source code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Create the production image
FROM node:18-alpine
WORKDIR /app

# Install 'serve' to act as the static file server
RUN npm install -g serve

# Copy the build output from the build stage
COPY --from=build /app/dist ./dist

# Expose the port the server will run on
EXPOSE 8080

# Command to start the server
# -s: Serve the 'dist' folder
# -l: Listen on port 8080
# The server will automatically handle SPA routing by serving index.html for unknown paths
CMD ["serve", "-s", "dist", "-l", "8080"]

# Use official Node.js image
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source
COPY . .

# Expose app port
EXPOSE 5000

# Start server
CMD ["npm", "start"]

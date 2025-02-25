# Use official Node.js image
FROM node:22

# Set the working directory inside the container
WORKDIR /app

# Copy only package.json and package-lock.json first (better caching)
COPY package*.json ./

# Install dependencies
RUN npm install --omit=dev
RUN npm install pnpm

# Copy the rest of the application (but NOT node_modules!)
COPY . .  

# Build the application
RUN npx nest build

# Expose the correct port
EXPOSE 9092

# Start the application
CMD ["pnpm", "run", "start:dev"]
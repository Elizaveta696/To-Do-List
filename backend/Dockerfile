# Use Node 22 Alpine
FROM node:22-alpine

# Create working directory
WORKDIR /app

# Copy package.json and package-lock first for caching
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of the application code
COPY ./ /app/

# Create a non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Make sure all files are readable by appuser
RUN chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# Expose the backend port
EXPOSE 3000

# Run server directly with node
CMD ["node", "src/server.js"]

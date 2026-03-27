# Use the official Node.js image with pnpm pre-installed
FROM node:18-slim

# Enable corepack (comes with Node 18, includes pnpm)
RUN corepack enable && corepack prepare pnpm@latest --activate

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and pnpm-lock.yaml first to leverage Docker cache
COPY package.json pnpm-lock.yaml ./

# Install app dependencies
RUN pnpm install

# Copy the rest of our app's source code into the container
COPY . .

# Expose the port the app will run on
EXPOSE 5501

# The command to run our app
CMD ["pnpm", "run", "dev"]
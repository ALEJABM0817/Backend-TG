# Use the official Node.js image as the base image
FROM node:14

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and yarn.lock to the working directory
COPY package.json yarn.lock ./

# Install dependencies using yarn
RUN --mount=type=cache,id=yarn-cache-my-cache-id,target=/usr/local/share/.cache/yarn/v6 yarn install --frozen-lockfile

# Copy the rest of the application code to the working directory
COPY . .

# Expose the port that the application will run on
EXPOSE 3000

# Start the application
CMD ["yarn", "start"]
# Steven Baes, 11239637

# getting base image node
FROM node:latest

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
RUN npm install -g nodemon

# Bundle app source
COPY . .

EXPOSE 8080

CMD ["nodemon", "--legacy-watch", "server.js"]
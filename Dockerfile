FROM node:stretch-slim

RUN mkdir -p /app/src
# Create app directory

WORKDIR /app/src
# Install app dependencies
COPY package.json /app/src

RUN npm install
# Copy app source code
COPY . .
#Expose port and start application
EXPOSE 5000

CMD [ "npm", "run", "variant" ]
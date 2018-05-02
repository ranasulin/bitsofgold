FROM node:8-alpine

# Add build tools
RUN apk add --no-cache make \
    python \
    g++

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Copy package.json first to check if an npm install is needed
COPY package.json /usr/src/app
RUN npm install

# Bundle app source
COPY . /usr/src/app

ENV PORT 3000

EXPOSE 3000

CMD ["npm", "start"]
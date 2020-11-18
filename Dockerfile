FROM node:carbon-alpine
RUN mkdir www/
WORKDIR www/
ADD package.json package-lock.json ./
RUN npm install
ADD . .
CMD [ "npm", "run", "start" ]

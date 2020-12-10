FROM node:14.15.1-alpine3.12
RUN mkdir www/
WORKDIR www/
ADD package.json package-lock.json ./
RUN npm install
ADD . .
CMD [ "npm", "run", "start" ]

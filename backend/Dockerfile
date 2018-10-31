FROM node:8.12
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY package.json /usr/src/app/
RUN apt-get update && apt-get install -y --no-install-recommends apt-utils
RUN apt-get install -y build-essential
RUN apt-get install -y python
RUN npm install -g node-pre-gyp
RUN npm install
COPY . /usr/src/app
ADD https://raw.githubusercontent.com/dushansilva/wait-for-it/master/wait-for-it.sh /wait-for-it.sh
RUN chmod +x /wait-for-it.sh
EXPOSE 3000
# CMD [ "npm", "start" ]
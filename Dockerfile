FROM mhart/alpine-node:10

WORKDIR /app

# expose our tcp port
EXPOSE 3000

# environment variables to make it easier in GUI editors
ENV NODE_ENV=production \
  MQTT_URL="" \
  MQTT_TOPIC="news/drudge" \
<<<<<<< HEAD
  MYSQL_HOST="" \
=======
  MYSQL_HOST=""
>>>>>>> master
  MYSQL_PORT=3306 \
  MYSQL_USER="" \
  MYSQL_PASSWORD="" \
  MYSQL_DATABASE="drudge"

# install dependencies
COPY package*.json ./
RUN npm install --prod

# copy everything now that deps have been installed
COPY . .

CMD ["npm", "start"]

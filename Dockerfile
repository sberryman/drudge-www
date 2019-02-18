FROM mhart/alpine-node:10

WORKDIR /app

# expose our tcp port
EXPOSE 3000

# environment variables to make it easier in GUI editors
ENV DB_PATH="" \
  MQTT_URL="" \
  MQTT_TOPIC="news/drudge"

# install dependencies
COPY package*.json ./
RUN npm install --prod

# copy everything now that deps have been installed
COPY . .

CMD ["npm", "start"]

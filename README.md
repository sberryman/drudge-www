# Drudge Report via MQTT
Very simple sister project to `drudge-mqtt` to display the most recent `N`
articles and subscribe for real-time updates.

## Dependencies
* Coming soon...

## Configuration
Controlled using environment variables.

### Defaults
```shell
# Logging
# Winston / https://www.npmjs.com/package/winston
LOG_LEVEL=info

# Database/Persistence (sqlite)
DB_PATH=""

# MQTT
MQTT_URL=""
MQTT_TOPIC="news/drudge"
```

## Development
Start up a docker container:
```shell
docker run -it --rm \
  -v "$PWD":/app \
  -u $(id -u ${USER}):$(id -g ${USER}) \
  -p 3000:3000 \
  node:lts \
  /bin/bash
```
* Force running container using the currently logged in user. This will allow
  you to edit files from the host without running into permissions issues.

Install dependencies:
```shell
cd /app
npm install
npm run watch
```

### Local testing
Using a .env file, adjust the development `REQ_URL` to a locally hosted version.
There are several samples saved as part of this repo.

#### Sample .env file
```shell
LOG_LEVEL=info

# polling
POLL_FREQUENCY=120

# request
REQ_URL="http://{dev_server_ip}:8097/test/source/2019_02_14_4.html"

# persistence
DB_PATH="/tmp/drudge.db"

# MQTT
MQTT_URL="mqtt://{mqtt_server_host}:1883"
MQTT_USERNAME="news_drudge"
MQTT_PASSWORD="ABC123"
MQTT_TOPIC="news/drudge"

```

Python v2:
```shell
cd python3 -m SimpleHTTPServer 8097
```

Python v3:
```shell
python3 -m http.server 8097
```

## Deployment
I have opted not published the container to Docker hub, you'll need to build it
on your own.

### Build
```shell
docker build -t drudge-mqtt:latest .
```

## To-Do
Here are a few things that would make this better

- Code refactor to plugins to make testing easier/possible. Possibly use a
  well known and published plugin framework.
- Create a service which will create a screenshot (JPEG) and/or PDF of the
  article when published. [Puppeteer](https://github.com/GoogleChrome/puppeteer)
  from google looks like a very well supported project.
  *See `.ci / node8 / Dockerfile.linux` for an example*
- Small web based GUI which displays the most recently published links
- Ability to automatically delete old articles based on the `ts_last` database
  column. This timestamp is the last time the specific link was seen.
- RSS feed
  - [rss-generator](https://www.npmjs.com/package/rss-generator)
  - [rss-feed-emitter](https://github.com/filipedeschamps/rss-feed-emitter)
- Refactor code to remove event emitter and rely solely on MQTT
- Break each lib file into a package and utilize
  [lerna](https://github.com/lerna/lerna) for managing those packages.
- React (Native) sample application which subscribes to the MQTT stream for
  a real-time dashboard.

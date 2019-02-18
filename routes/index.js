const express = require('express')
const router = express.Router()
const sqlite3 = require('sqlite3').verbose()
const moment = require('moment')
const Joi = require('joi')
const hbs = require('hbs')

// validate it!
const schema = Joi.object({
  DB_PATH: Joi.string(),
  MQTT_URL: Joi.string()
    .uri({
      scheme: ['mqtt', 'mqtts', 'ws', 'wss']
    }),
  MQTT_TOPIC: Joi.string()
})
const { error, value: config } = Joi.validate(
  process.env,
  schema,
  {
    presence: 'required',
    stripUnknown: true
  }
)
if (error) {
  throw new Error(`Persist config validation error: ${error.message}`)
}

/* GET home page. */
router.get('/', function (req, res, next) {
  // create the db connection
  const db = new sqlite3.Database(config.DB_PATH, sqlite3.OPEN_READONLY)

  db.all(
    'SELECT * FROM links ORDER BY ts_first DESC LIMIT 25',
    [],
    (err, rows) => {
      // close the db connection
      db.close()
      // console.log(rows)

      // log the error
      if (err) {
        return next(err)
      }

      if (!rows || rows.length < 1) {
        return next(new Error('No news in the database!!!'))
      }

      // force rows bit to boolean and rename ts_first to 'at'
      const mappedRows = rows.map((item) => {
        return {
          at: item.ts_first,
          important: item.important === 1,
          headline: item.headline === 1,
          text: item.summary,
          url: item.url
        }
      })

      res.render(
        'index',
        {
          title: 'DrudgeReport - Realtime',
          mqttUrl: config.MQTT_URL,
          mqttTopic: config.MQTT_TOPIC,
          articles: mappedRows,
          lastUpdate: rows[0].ts_last
        }
      )
    }
  )
})

hbs.registerHelper('momentFromNow', (item, options) => {
  return moment(item).fromNow()
})

module.exports = router

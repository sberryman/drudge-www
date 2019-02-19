const express = require('express')
const router = express.Router()
const mysql = require('mysql')
const moment = require('moment')
const Joi = require('joi')
const hbs = require('hbs')

// validate it!
const schema = Joi.object({
  MQTT_URL: Joi.string()
    .uri({
      scheme: ['mqtt', 'mqtts', 'ws', 'wss']
    }),
  MQTT_TOPIC: Joi.string(),

  MYSQL_HOST: Joi.string(),

  MYSQL_PORT: Joi.number()
    .positive()
    .optional()
    .default(3306),

  MYSQL_USER: Joi.string()
    .optional(),

  MYSQL_PASSWORD: Joi.string()
    .optional(),

  MYSQL_DATABASE: Joi.string()
    .default('drudge')
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

// create the mysql connection, dont do this on EVERY request as we did
// with sqlite
// create the db connection
const db = mysql.createConnection({
  host: config.MYSQL_HOST,
  port: config.MYSQL_PORT,
  user: config.MYSQL_USER,
  password: config.MYSQL_PASSWORD,
  database: config.MYSQL_DATABASE,
  typeCast: function castField (field, useDefaultTypeCasting) {
    // We only want to cast bit fields that have a single-bit in them. If the field
    // has more than one bit, then we cannot assume it is supposed to be a Boolean.
    if ((field.type === 'BIT') && (field.length === 1)) {
      var bytes = field.buffer()

      // A Buffer in Node represents a collection of 8-bit unsigned integers.
      // Therefore, our single "bit field" comes back as the bits '0000 0001',
      // which is equivalent to the number 1.
      return (bytes[0] === 1)
    }

    return (useDefaultTypeCasting())
  }
})

// connect!
db.connect()

/* GET home page. */
router.get('/', function (req, res, next) {
  db.query(
    `SELECT * FROM links
      WHERE advert=0 AND
        ts_last >= ?
      ORDER BY ts_first DESC`,
    [
      Date.now() - (90 * 60 * 1000)
    ],
    (err, rows) => {
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
          important: item.important,
          headline: item.headline,
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
          lastUpdate: rows[0].ts_first
        }
      )
    }
  )
})

hbs.registerHelper('momentFromNow', (item, options) => {
  return moment(item).fromNow()
})

// ensure the db gets closed on restart!
process.on('exit', () => {
  db.end()
})

module.exports = router

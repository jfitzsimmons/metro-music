const GtfsRealtimeBindings = require('gtfs-realtime-bindings')
const cors = require('cors')
const nodeFetch = require('node-fetch')
const express = require('express')
const bodyParser = require('body-parser')

const API_ENDPOINT =
  'https://www.metrostlouis.org/RealTimeData/StlRealTimeVehicles.pb'

const app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(
  cors({
    origin: [
      /nifty-heyrovsky-603fd4\.netlify\.app$/,
      /metrobusorchestra\.netlify\.app$/,
    ],
  }),
)
app.get('/', (req, res) => {
  res.send('Welcome 🥳')
})

app.get('/busses/', async (req, res) => {
  try {
    // @ts-ignore
    const response = await nodeFetch(API_ENDPOINT)
    if (!response.ok) {
      const error = new Error(
        `${response.url}: ${response.status} ${response.statusText}`,
      )
      throw error
    }
    const buffer = await response.arrayBuffer()
    const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(
      new Uint8Array(buffer),
    )
    res.send(JSON.stringify(feed.entity))
    return {
      statusCode: 200,
      body: JSON.stringify(feed.entity),
    }
  } catch (error) {
    console.log(error)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed fetching data' }),
    }
  }
})

const port = 8080
app.listen(port, () => {
  console.log('server up at http://localhost:8080/')
})

module.exports = app

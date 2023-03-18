//import { Handler } from '@netlify/functions'

////const req = require("request-promise");
const GtfsRealtimeBindings = require('gtfs-realtime-bindings')
//const requestSettings = {
// method: 'GET',
// url: 'https://www.metrostlouis.org/RealTimeData/StlRealTimeVehicles.pb',
////  encoding: null,
//};

const node_fetch = require('node-fetch')
const express = require('express')
//const path = require('path')
const bodyParser = require('body-parser')
//const fetch = require('node-fetch')

const API_ENDPOINT =
  'https://www.metrostlouis.org/RealTimeData/StlRealTimeVehicles.pb'

const app = express()
//const port = process.env.PORT || 5000

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.get('/', (req, res) => {
  res.send('Hey this is my API running 🥳')
})

app.get('/busses/', async (req, res) => {
  try {
    // @ts-ignore
    const response = await node_fetch(API_ENDPOINT)
    if (!response.ok) {
      const error = new Error(
        `${response.url}: ${response.status} ${response.statusText}`,
      )
      //error.response = response;
      throw error
      // process.exit(1);
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
    //return JSON.stringify(feed.entity);
  } catch (error) {
    console.log(error)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed fetching data' }),
    }
  }
})
;(async function () {})()

//const app = express()
//const port = process.env.PORT || 5000
//

var port = 8080
app.listen(port, () => {
  console.log('server up at http://localhost:8080/')
})

// Export the Express API
module.exports = app

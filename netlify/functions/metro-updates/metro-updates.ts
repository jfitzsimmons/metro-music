//import { Handler } from '@netlify/functions'

////const req = require("request-promise");
const GtfsRealtimeBindings = require('gtfs-realtime-bindings')
//const requestSettings = {
// method: 'GET',
// url: 'https://www.metrostlouis.org/RealTimeData/StlRealTimeVehicles.pb',
////  encoding: null,
//};

const node_fetch = require('node-fetch')

const API_ENDPOINT =
  'https://www.metrostlouis.org/RealTimeData/StlRealTimeVehicles.pb'

exports.handler = async (event, context) => {
  try {
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
}

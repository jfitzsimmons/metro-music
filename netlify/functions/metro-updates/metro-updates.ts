//import { Handler } from '@netlify/functions'

////const req = require("request-promise");
const GtfsRealtimeBindings = require('gtfs-realtime-bindings');
//const requestSettings = {
 // method: 'GET',
 // url: 'https://www.metrostlouis.org/RealTimeData/StlRealTimeVehicles.pb',
////  encoding: null,
//};




const node_fetch = require("node-fetch");

const API_ENDPOINT = "https://www.metrostlouis.org/RealTimeData/StlRealTimeVehicles.pb";

exports.handler = async (event, context) => {
  try {
    const response = await node_fetch(API_ENDPOINT);
    if (!response.ok) {
      const error = new Error(`${response.url}: ${response.status} ${response.statusText}`);
      //error.response = response;
      throw error;
     // process.exit(1);
    }
    const buffer = await response.arrayBuffer();
    const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(
      new Uint8Array(buffer)
    );
    //console.dir(feed.entity)
    return {
      statusCode: 200,
      body: JSON.stringify(feed.entity),
    };
    //return JSON.stringify(feed.entity);
  } catch (error) {
    console.log(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed fetching data' }),
    };
  }
};





/** 
export const handler: Handler = function(event, context, callback) {

  try {
    const response = await fetch("https://www.metrostlouis.org/RealTimeData/StlRealTimeVehicles.pb", {
      headers: {
        "x-api-key": "<redacted>",
        // replace with your GTFS-realtime source's auth token
        // e.g. x-api-key is the header value used for NY's MTA GTFS APIs
      },
    });
    if (!response.ok) {
      const error = new Error(`${response.url}: ${response.status} ${response.statusText}`);
      error.response = response;
      throw error;
      process.exit(1);
    }
    const buffer = await response.arrayBuffer();
    const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(
      new Uint8Array(buffer)
    );
    feed.entity.forEach((entity) => {
      if (entity.tripUpdate) {
        console.log(entity.tripUpdate);
      }
    });
  }
  catch (error) {
    console.log(error);
    process.exit(1);
  }


  req(requestSettings)
    .then(function (body) {
      const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(body);
      callback(null, {
        statusCode: 200,
        body: JSON.stringify(feed.entity),
      });
    })
    .catch(function (err) {
      callback(null, {
        statusCode: err.number,
        body: JSON.stringify({}),
      });
    });
};



(async () => {
  try {
    const response = await fetch("https://www.metrostlouis.org/RealTimeData/StlRealTimeVehicles.pb", {
      headers: {
        "x-api-key": "<redacted>",
        // replace with your GTFS-realtime source's auth token
        // e.g. x-api-key is the header value used for NY's MTA GTFS APIs
      },
    });
    if (!response.ok) {
      const error = new Error(`${response.url}: ${response.status} ${response.statusText}`);
      error.response = response;
      throw error;
      process.exit(1);
    }
    const buffer = await response.arrayBuffer();
    const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(
      new Uint8Array(buffer)
    );
    feed.entity.forEach((entity) => {
      if (entity.tripUpdate) {
        console.log(entity.tripUpdate);
      }
    });
  }
  catch (error) {
    console.log(error);
    process.exit(1);
  }
})();
*/
import { Handler } from '@netlify/functions'

const req = require("request-promise");
const GtfsRealtimeBindings = require('gtfs-realtime-bindings');
const requestSettings = {
  method: 'GET',
  url: 'https://www.metrostlouis.org/RealTimeData/StlRealTimeVehicles.pb',
  encoding: null,
};

export const handler: Handler = function(event, context, callback) {
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
        statusCode: 503,
        body: JSON.stringify({}),
      });
  });;
};
// import { useCallback, useRef } from 'react'
import { Bus } from '../store/models'

//import node_fetch from 'node-fetch'

const cleanBusData = (entities: any) => {
  const cleaned: Bus[] = []
  entities.forEach((e: any) => {
    cleaned.push({
      id: e.vehicle.vehicle.id,
      latitude: e.vehicle.position.latitude,
      longitude: e.vehicle.position.longitude,
      timestamp: e.vehicle.timestamp,
      label: e.vehicle.vehicle.label,
    })
  })
  return cleaned
}

/** 
const loadNewData = useCallback(
    (timer: any) => {
      if (timer) {
        timeout.current = setTimeout(function () {
          if (timeout.current) clearTimeout(timeout.current)
          console.log('before fetch new datat')
*/

export const chooseEnvEndpoint = (): any =>
  process.env.REACT_APP_ENVIRONMENT === 'dev'
    ? fetch('/.netlify/functions/metro-updates').then((res) => res.json())
    : fetch('https://stl-metro-api.vercel.app/busses/').then((res) =>
        res.json(),
      )

export const serverSideCall = (): Bus[] | void => {
  console.log('serverSideCall')
  const apiEndpoint =
    process.env.REACT_APP_ENVIRONMENT === 'dev'
      ? '/.netlify/functions/metro-updates'
      : 'https://www.metrostlouis.org/RealTimeData/StlRealTimeVehicles.pb'

  ;(async function () {
    const response = fetch(apiEndpoint).then((res) => console.log(res.json()))

    try {
      console.log('TRY')
      const entities = await response
      console.log('const entities = await response')
      console.dir(await entities)

      //if (process.env.REACT_APP_ENVIRONMENT === "prod" )
      // console.log('entities')
      // console.dir(entities[0])
      const busEntities = cleanBusData(entities)

      return await busEntities
      // console.log(busEntities)
      //markerRefs.length = 0

      //testjpf return await Busentities???
      // setNewBusMarkers(busEntities)
      // setFreshRender(false)
    } catch (err) {
      /** 
        addToText({
            id: `loading${Date.now()}`,
            text: `Call failed.  Trying again.  loading...`,
            class: `loading`,
        })
        loadNewData(3000)
        
        return {
            id: `loading${Date.now()}`,
            text: `Call failed.  Trying again.  loading...`,
            class: `loading`,
        }
            */
      return
    }
  })()
}

//import { Handler } from '@netlify/functions'

////const req = require("request-promise");
//const GtfsRealtimeBindings = require('gtfs-realtime-bindings');
//const requestSettings = {
// method: 'GET',
// url: 'https://www.metrostlouis.org/RealTimeData/StlRealTimeVehicles.pb',
////  encoding: null,
//};

//const node_fetch = require("node-fetch");

//const API_ENDPOINT = "https://www.metrostlouis.org/RealTimeData/StlRealTimeVehicles.pb";

//testjpf bad use of any:::
/**
export const clientSideCall = (): Bus[] | void => {
  const apiEndpoint =
    'https://www.metrostlouis.org/RealTimeData/StlRealTimeVehicles.pb'

  ;(async function () {
    const response = 

    try {
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
      const cleanedData = cleanBusData(JSON.parse(JSON.stringify(feed.entity)))
      //console.dir(feed.entity)

      return cleanedData && cleanedData.length > 0 && cleanedData
      //return JSON.stringify(feed.entity);
    } catch (error) {
      console.log(error)
      return
        return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed fetching data' }),
    };
    }
  })()
}
 */
/** 
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
};*/

import { useEffect,useCallback,useRef, useState } from "react";
import { LatLngExpression } from "leaflet";
import { MapContainer, TileLayer, Marker, Tooltip } from "react-leaflet";
import { connect } from "react-redux";
import { setPlacePreviewVisibility, setSelectedPlace, setAllPlaces, setPastPlaces, setSweepTime } from "../../store/actions";
import { IState, Entity } from "../../store/models";
//import AddMarker from "./AddMarker";
import { playSweep, noteFreq, changeVolume } from "../../utils/webAudio"
import "./Map.css";
import { countBy, distance, rndmRng } from "../../utils/calculations";

const handler = fetch('/.netlify/functions/metro-updates').then((res) => res.json())
let mphAvg = 16.385464299320347;
let notesKey = ["C","E","G"] as const;
let newVehicles: Entity[] = []
let retiredVehicles: Entity[] = []  
let longAvg= -90.24467340251744
  

function pickFrequency(f: number) {
  if (f < 38.5272947947) return 1;
  if (f >= 38.5272947947 && f < 38.5837567647) return 2;
  if (f >= 38.5837567647 && f < 38.6402187347) return 3;
  if (f >= 38.6402187347 && f < 38.6966807047) return 4;
  if (f >= 38.6966807047 && f < 38.7531426747) return 5;
  if (f >= 38.7531426747) return 6;
  return 1;
}


function getAdsr(mph: number) {
  let adsr = 1 - mph / mphAvg;
  if (adsr > 1) adsr = .99;
  if (adsr < -1) adsr = -.99;
  if (adsr < 0) adsr++;
  return adsr;
}

const organizeVehicles = (places: Entity[], pastPlaces: Entity[]) => {
  let i2 = 0;
/** 
  console.log(`places`);
  console.log(places);

  console.log(`pastPlaces`);
  console.log(pastPlaces);
*/
  for (let i=0; i<pastPlaces.length; i++) {
      if (pastPlaces[i].vehicle.vehicle.id !== places[i2].vehicle.vehicle.id) {
          if (places.some(( vehicle: Entity ) => vehicle.vehicle.vehicle.id === pastPlaces[i].vehicle.vehicle.id)) {
              newVehicles.push(places[i2]);
              i--;
          } else {
              retiredVehicles.push(pastPlaces[i]);
              i2--
          }
      } else {
        places[i2].movement = {
          distance: distance(pastPlaces[i].vehicle.position.latitude , pastPlaces[i].vehicle.position.longitude, places[i2].vehicle.position.latitude, places[i2].vehicle.position.longitude),
          timing: parseInt(places[i2].vehicle.timestamp) - parseInt(pastPlaces[i].vehicle.timestamp),
          mph: (distance(pastPlaces[i].vehicle.position.latitude , pastPlaces[i].vehicle.position.longitude, places[i2].vehicle.position.latitude, places[i2].vehicle.position.longitude) / (parseInt(places[i2].vehicle.timestamp)- parseInt(pastPlaces[i].vehicle.timestamp))) *3600,
        };
      }

      i2++
  }
/** 
  console.log(`retiredVehicles`);
  console.log(retiredVehicles);

  console.log(`newVehicles`);
  console.log(newVehicles);
*/
  let updatedRoutes = places.filter((vehicle: Entity) => (vehicle.movement && vehicle.movement.distance !== 0)).sort(function(x: Entity, y: Entity){
    return parseInt(x.vehicle.timestamp) - parseInt(y.vehicle.timestamp);
  });
/** 
  console.log(`updatedRoutes`);
  console.log(updatedRoutes);
*/
  let timestampDupes: any = {}
  timestampDupes = countBy(updatedRoutes, (r: { vehicle: { timestamp: number; }; }) => r.vehicle.timestamp);

  let minTime = parseInt(updatedRoutes.sort(function(x: Entity, y: Entity){
      return parseInt(x.vehicle.timestamp) - parseInt(y.vehicle.timestamp);
  })[0].vehicle.timestamp);

  let count = 1;

  updatedRoutes.forEach((r:Entity,i:number) => {      
    type OctaveKey = keyof typeof noteFreq;
    let octave: OctaveKey = pickFrequency(r.vehicle.position.latitude);
    let noteChar = noteFreq[octave];
    type NoteKey = keyof typeof noteChar;
    let note: NoteKey = notesKey[Math.round(rndmRng(2,0))];

    let start = 0;
    if (updatedRoutes[i-1] && r.vehicle.timestamp === updatedRoutes[i-1].vehicle.timestamp) { 
        start = parseInt(r.vehicle.timestamp)-minTime+(1/timestampDupes[r.vehicle.timestamp]*count) 
        count++;
    } else {
        start = parseInt(r.vehicle.timestamp)-minTime;
        count = 1;
    }
    let end: number = 0;
    let adsr: number = 0;
    if (r.movement && r.movement.distance) end = (r.movement.distance < .5) ? .5 : r.movement.distance;
    end *=3;
    if (r.movement && r.movement.mph) adsr = getAdsr(r.movement.mph);

    let sweep = {
        i,
        start,
        end,
        freq: noteFreq[octave][note],
        pan: (Math.abs(longAvg) - Math.abs(r.vehicle.position.longitude))*3,
        adsr: adsr * end,
    }

    playSweep(sweep);
  })
  //return timeout and call setsweep there 
  //dont need this setTimeout anymore, handled in useEffect
  let timeout: number = (parseInt(updatedRoutes[updatedRoutes.length-1].vehicle.timestamp)-minTime) * 1000;
  //pass timeout to entityNew()
  //put setTimeout in EntityNew
  //console.log(`return timeout to setSweepTime: ${timeout}`);


  return timeout;
}

const Map = ({
  isVisible,
  pastPlaces,
  places,
  initial,
  selectedPlace,
  togglePreview,
  sweepTime,
  setPlaceForPreview,
  setPastPlaces,
  setNewPlaceMarkers,
  setSweepTime,
}: any) => {
  const timeout:  { current: NodeJS.Timeout | null } = useRef(null);
  const [forceStop, setForceStop] = useState<boolean>(false);
  const defaultPosition: LatLngExpression = [38.62727, -90.19789];

  useEffect(() => {
    //console.log('past places ALWAYS');
    if (places && places.length > 0) {
      //console.log('past places IF CONDITION');
      setPastPlaces(places);
/** 
      console.log(`places`);
      console.log(places);

      console.log(`pastPlaces`);
      console.log(pastPlaces);
      */
    }
  }, [places, setPastPlaces]);



  useEffect(() => {
    //console.log('init');
    const entity = async () => {
      const a = await handler;
      setNewPlaceMarkers(a,true);
    };
    entity();
    setSweepTime(15000);
  }, [setNewPlaceMarkers, setSweepTime]);

  useEffect(() => {
    //console.log(`initial intial: ${initial} | forceStop: ${forceStop}`);
    if (!initial && !forceStop && places !== pastPlaces) {
      //console.log(`if not initial: ${initial}`);
      setSweepTime(organizeVehicles(places, pastPlaces));
    }
  }, [initial, places, setSweepTime, forceStop, pastPlaces]);
 
  const loadNewData = useCallback((timer) => {
    timeout.current =  setTimeout(function(){
    //console.log('loadNewData Entered');
    const entityNew = async () => {
      //console.log(`entityNEW places updated`);
      const handler2 = fetch('/.netlify/functions/metro-updates').then((res) => res.json())
      const b = await handler2;
      //add argument noninit?  newdata? = true? 
      //then have use effect htat checks for that redux prop
      //fire organizeVehicles?
      // setting newplaces, needs to include old places???
      // probably the way to go.
      setNewPlaceMarkers(b, false);
    };
    entityNew();
    if (timeout.current) {
      //console.log('clear timeout exists');
      clearTimeout(timeout.current);
      //organizeVehicles();
    };
  }, timer);
  },[setNewPlaceMarkers]);

  useEffect(() => {
    //console.log(`to: ${sweepTime} ONLY ONCE`);
    if (!sweepTime || sweepTime <= 0) {
     // console.log('to= 0');
      return;
    } else {
     // console.log(`sweepTime changed: ${sweepTime}`);
      loadNewData(sweepTime);
    }
    
  }, [loadNewData, sweepTime]);

  const showPreview = (place: Entity) => {
    if (isVisible) {
      togglePreview(false);
      setPlaceForPreview(null);
    }

    if (selectedPlace?.id !== place.id) {
      setTimeout(() => {
        showPlace(place);
      }, 400);
    }
  };

  const showPlace = (place: Entity) => {
    setPlaceForPreview(place);
    togglePreview(true);
  };

  return (
    <div className="map__container">
      {/**(places && places.length >0) && <button onClick={() => entityNew()}>New Entities</button> */}
      {/**(pastPlaces && pastPlaces.length >0) && <button onClick={() => organizeVehicles()}>Play music?</button> **/ }
      { <button onClick={() => setForceStop(true)}>Force Stop</button> }
      <div className="left">
        <span>Volume: </span>
        <input type="range" min="0.0" max="0.3" step="0.02"
            defaultValue="0.15" list="volumes" name="volume" onChange={() => changeVolume()}/>
        <datalist id="volumes">
          <option value="0.0" label="Mute" />
          <option value="0.3" label="100%" />
        </datalist>
      </div>
      <MapContainer
        center={defaultPosition}
        zoom={11}
        scrollWheelZoom={true}
        style={{ height: "100vh" }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {places.map((place: Entity) => (
          <Marker
            key={place.id}
            position={[place.vehicle.position.latitude, place.vehicle.position.longitude]}
            eventHandlers={{ click: () => showPreview(place) }}
          >
            <Tooltip>{place.vehicle.vehicle.label}</Tooltip>
          </Marker>
        ))}
        {/** <AddMarker /> */}
      </MapContainer>
    </div>
  );
};

const mapStateToProps = (state: IState) => {
  const { places, search } = state;
  return {
    isVisible: places.placePreviewsIsVisible,
    pastPlaces: places.pastPlaces,
    places: places.places,
    initial: places.initial,
    selectedPlace: places.selectedPlace,
    sweepTime: search.sweepTime,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    togglePreview: (payload: boolean) =>
      dispatch(setPlacePreviewVisibility(payload)),
    setPlaceForPreview: (payload: Entity) =>
      dispatch(setSelectedPlace(payload)),
    setNewPlaceMarkers: (payload: Entity[], initial: boolean) =>
      dispatch(setAllPlaces(payload,initial)),
    setPastPlaces: (payload: Entity[]) =>
      dispatch(setPastPlaces(payload)),
    setSweepTime: (payload: number) =>
      dispatch(setSweepTime(payload)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Map);

import { useEffect, useState } from "react";
import { LatLngExpression } from "leaflet";
import { MapContainer, TileLayer, Marker, Tooltip } from "react-leaflet";
import { connect } from "react-redux";
import { setPlacePreviewVisibility, setSelectedPlace, setAllPlaces } from "../../store/actions";
import { IState, Entity } from "../../store/models";
import AddMarker from "./AddMarker";
import { playSweep, noteFreq, Octaves, Scale, changeVolume } from "../../utils/webAudio"

import "./Map.css";
import { countBy, distance, rndmRng } from "../../utils/calculations";

const Map = ({
  isVisible,
  places,
  selectedPlace,
  togglePreview,
  setPlaceForPreview,
  setNewPlaceMarkers,
}: any) => {
  const defaultPosition: LatLngExpression = [38.62727, -90.19789]; // stl position
  //const [polyLineProps, setPolyLineProps] = useState([]);
  const handler = fetch('/.netlify/functions/metro-updates').then((res) => res.json())

  const [ ent2, setEnt2 ] = useState<Entity[]>([]);

  //let audioContext = new (window.AudioContext)();

  //let ent2: Entity[] = []; 
  let wrongIds = []
  let newVehicles = []
  let retiredVehicles = []
  //let i1 = 0;
  //let i2 = 0;
  function pickFrequency(f: number) {
    if (f < 38.5272947947) return 1;
    if (f >= 38.5272947947 && f < 38.5837567647) return 2;
    if (f >= 38.5837567647 && f < 38.6402187347) return 3;
    if (f >= 38.6402187347 && f < 38.6966807047) return 4;
    if (f >= 38.6966807047 && f < 38.7531426747) return 5;
    if (f >= 38.7531426747) return 6;
    return 1;
  }
  
  let mphAvg = 16.385464299320347;
  let longAvg= -90.24467340251744
  let latavg = 0;
  let notesKey = ["C","E","G"] as const;
  let t = 1;
  
  function getAdsr(mph: number) {
    let adsr = 1 - mph / mphAvg;
    if (adsr > 1) adsr = .99;
    if (adsr < -1) adsr = -.99;
    if (adsr < 0) adsr++;
    return adsr;
  }

  function test() {
    console.log("ENT 1 TEST");
    console.log(places);
  }

  function test2() {
    console.log("ENT 2 TEST");
    console.log(ent2);
  }

function organizeVehicles() {
  let i2 = 0;

  for (let i=0; i<places.length; i++) {
      if (places[i].vehicle.vehicle.id !== ent2[i2].vehicle.vehicle.id) {
          if (ent2.some(({ vehicle }) => vehicle.vehicle.id === places[i].vehicle.vehicle.id)) {
              //this woud mean the ent2 vehicle is new!!!
              //i2--?!?!
              newVehicles.push(ent2[i2]);
              i--;
          } else {
              retiredVehicles.push(places[i]);
              i2--
          }
      } else {
          ent2[i2].movement = {
            distance: distance(places[i].vehicle.position.latitude , places[i].vehicle.position.longitude, ent2[i2].vehicle.position.latitude, ent2[i2].vehicle.position.longitude),
            timing: parseInt(ent2[i2].vehicle.timestamp) - parseInt(places[i].vehicle.timestamp),
            mph: (distance(places[i].vehicle.position.latitude , places[i].vehicle.position.longitude, ent2[i2].vehicle.position.latitude, ent2[i2].vehicle.position.longitude) / (parseInt(ent2[i2].vehicle.timestamp) - parseInt(places[i].vehicle.timestamp))) *3600,
          };
          /** 
          ent2[i2].movement.distance = distance(places[i].vehicle.position.latitude , places[i].vehicle.position.longitude, ent2[i2].vehicle.position.latitude, ent2[i2].vehicle.position.longitude)
          ent2[i2].movement.timing = parseInt(ent2[i2].vehicle.timestamp) - parseInt(places[i].vehicle.timestamp) 
          ent2[i2].movement.mph = (ent2[i2].movement.distance / ent2[i2].movement.timing) *3600;
*/
      }

      i2++
  }

  let updatedRoutes = ent2.filter((vehicle) => (vehicle.movement && vehicle.movement.distance !== 0)).sort(function(x, y){
    return parseInt(x.vehicle.timestamp) - parseInt(y.vehicle.timestamp);
  });

  let timestampDupes: any = {}

   timestampDupes = countBy(updatedRoutes, (r: { vehicle: { timestamp: number; }; }) => r.vehicle.timestamp);

  let minTime = parseInt(updatedRoutes.sort(function(x, y){
      return parseInt(x.vehicle.timestamp) - parseInt(y.vehicle.timestamp);
  })[0].vehicle.timestamp);

  let count = 1;

  updatedRoutes.forEach((r,i) => {
      console.log(1/timestampDupes[r.vehicle.timestamp]);
      
      type OctaveKey = keyof typeof noteFreq;

      let octave: OctaveKey = pickFrequency(r.vehicle.position.latitude);

      let test = noteFreq[octave];

      type NoteKey = keyof typeof test;

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
 //places = ent2;
}











  const entity = async () => {
    const a = await handler;
    //setplaces(a);
    //save old markers
    //check which markers actually updated.
    //console.log('entity1');
    //places = a;
    //console.log(JSON.stringify(a));
    setNewPlaceMarkers(a);
    test();
    //places = a;
  };

  const entityNew = async () => {
    //!!! something like setOldPlaces(places)
    //
    setEnt2(places);



    const b = await handler;
    //save old markers
    //check which markers actually updated.
    //console.log('places in NEW');
    //console.log(places);
    //console.log('entity2');
    //ent2 = b;
    //console.log(JSON.stringify(ent2));
    setNewPlaceMarkers(b);
    test2();

    
    organizeVehicles();
    
  };

  // probably need to steal my setInterval stuff from next.js blog TEST JPF
  // so, onMount I need to get places with handler, and setAllPlaces with it on fulfillment of promise
  //ex: add entity() to useEffect, in entity function, setAllPlaces with 'a' aka returned json
  useEffect(() => {
   /**  
    setPolyLineProps(places.reduce((prev: LatLngExpression[], curr: Place) => {
      prev.push(curr.position);
      return prev;
    }, []));
    **/
    entity();
  }, []);

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
   {(places && places.length >0) && <button onClick={() => entityNew()}>New Entities</button> }
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
       {/**  <Polyline positions={polyLineProps} /> */}
        {places.map((place: Entity) => (
          <Marker
            key={place.id}
            position={[place.vehicle.position.latitude, place.vehicle.position.longitude]}
            eventHandlers={{ click: () => showPreview(place) }}
          >
            <Tooltip>{place.vehicle.vehicle.label}</Tooltip>
          </Marker>
        ))}
        <AddMarker />
      </MapContainer>
    </div>
  );
};

const mapStateToProps = (state: IState) => {
  const { places } = state;
  return {
    isVisible: places.placePreviewsIsVisible,
    places: places.places,
    selectedPlace: places.selectedPlace,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    togglePreview: (payload: boolean) =>
      dispatch(setPlacePreviewVisibility(payload)),
    setPlaceForPreview: (payload: Entity) =>
      dispatch(setSelectedPlace(payload)),
    setNewPlaceMarkers: (payload: Entity[]) =>
      dispatch(setAllPlaces(payload)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Map);

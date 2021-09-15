import { useEffect } from "react";
import { LatLngExpression } from "leaflet";
import { MapContainer, TileLayer, Marker, Tooltip } from "react-leaflet";
import { connect } from "react-redux";
import { setPlacePreviewVisibility, setSelectedPlace, setAllPlaces } from "../../store/actions";
import { IState, Entity } from "../../store/models";
import AddMarker from "./AddMarker";
import { playSweep, noteFreq, Octaves, Scale } from "../../utils/webAudio"

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



  let audioContext = new (window.AudioContext)();
  let ent1: Entity[];
  let ent2: Entity[]; 
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

function organizeVehicles() {
  let i2 = 0;

  for (let i=0; i<ent1.length; i++) {
      if (ent1[i].vehicle.vehicle.id !== ent2[i2].vehicle.vehicle.id) {
          if (ent2.some(({ vehicle }) => vehicle.vehicle.id === ent1[i].vehicle.vehicle.id)) {
              //this woud mean the ent2 vehicle is new!!!
              //i2--?!?!
              newVehicles.push(ent2[i2]);
              i--;
          } else {
              retiredVehicles.push(ent1[i]);
              i2--
          }
      } else {
          ent2[i2].movement.distance = distance(ent1[i].vehicle.position.latitude , ent1[i].vehicle.position.longitude, ent2[i2].vehicle.position.latitude, ent2[i2].vehicle.position.longitude)
          ent2[i2].movement.timing = parseInt(ent2[i2].vehicle.timestamp) - parseInt(ent1[i].vehicle.timestamp) 
          ent2[i2].movement.mph = (ent2[i2].movement.distance / ent2[i2].movement.timing) *3600;

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

      let end = (r.movement.distance < .5) ? .5 : r.movement.distance;
          end *=3;
      let adsr = getAdsr(r.movement.mph);

      let sweep = {
          i,
          osc: audioContext.createOscillator(),
          gainNode: audioContext.createGain(),
          stereo: audioContext.createStereoPanner(),
          start,
          end,
          freq: noteFreq[octave][note],
          pan: (Math.abs(longAvg) - Math.abs(r.vehicle.position.longitude))*3,
          adsr: adsr * end,
      }

      playSweep(sweep);
  })
}











  const entity = async () => {
    const a = await handler;
    //save old markers
    //check which markers actually updated.
    console.log('entity1');
    console.log(JSON.stringify(a));
    setNewPlaceMarkers(a);
    ent1 = a;
  };

  const entityNew = async () => {
    const b = await handler;
    //save old markers
    //check which markers actually updated.
    console.log('entity2');
    console.log(JSON.stringify(b));
    setNewPlaceMarkers(b);
    ent2 = b;
    organizeVehicles();
    ent1 = ent2;
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
      <button onClick={() => entityNew()}>New Entities</button>
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

import { useEffect,useCallback,useRef, useState, createRef } from "react";
import L, { LatLngExpression } from "leaflet";
import { MapContainer, TileLayer, Marker, Tooltip } from "react-leaflet";
import { connect } from "react-redux";
import { setPlacePreviewVisibility, setSelectedPlace, setAllPlaces } from "../../store/actions";
import { IState, Entity } from "../../store/models";
//import AddMarker from "./AddMarker";
import { playSweep, noteFreq, changeVolume } from "../../utils/webAudio"
import "./Map.css";
import { countBy, distance, rndmRng } from "../../utils/calculations";

const handler = fetch('/.netlify/functions/metro-updates').then((res) => res.json())
let mphAvg = 16.385464299320347;
let notesKey = [["D","F","G#","C"],["D","F","G#","B"],["C","D#","G","B"],["C","D#","G","B"]] as const;
let newVehicles: Entity[] = []
let retiredVehicles: Entity[] = []
let markerRefs: React.RefObject<L.Marker>[] = [];  
let longAvg= -90.24467340251744
let progress = 0;
let multiple = 0;
let chord = 0;
let start = 0;
let concertStart = 0;

function usePrevious<T>(value: T): T {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current as T;
}

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


  if (updatedRoutes.length === 0 || !updatedRoutes) {
    return 2000;
  }
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

  if (concertStart === 0) concertStart = minTime;

  updatedRoutes.forEach((r:Entity,i:number) => {  
    progress = parseInt(r.vehicle.timestamp)-concertStart;
    multiple = Math.floor(progress/8)
    chord = (progress >= 8) ? Math.floor((progress - 8*multiple)/2) : Math.floor(progress/2);


    type OctaveKey = keyof typeof noteFreq;
    let octave: OctaveKey = pickFrequency(r.vehicle.position.latitude);
    let noteChar = noteFreq[octave];
    type NoteKey = keyof typeof noteChar;
    let note: NoteKey = notesKey[chord][Math.round(rndmRng(3,0))];

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
    const found = markerRefs.find((m) => (m.current && m && m.current.options && m.current.options.icon && m.current.options.icon.options && m.current.options.icon.options.className &&
        m.current.options.icon.options.className.includes(`map-icon_${r.id}`)));

     setTimeout(function(){ if (found && found.current) found.current.setIcon(L.divIcon({
      iconSize: [30, 30],
      iconAnchor: [10, 10],
      popupAnchor: [10, 0],
      shadowSize: [0, 0],
      className: `map-icon icon-animation map-icon_${r.id}`
    }))},start*1000)

    playSweep(sweep);
  });

  let timeout: number = (parseInt(updatedRoutes[updatedRoutes.length-1].vehicle.timestamp)-minTime) * 1000;
  return timeout;
}

const Map = ({
  isVisible,
  places,
  initial,
  selectedPlace,
  togglePreview,
  setPlaceForPreview,
  setNewPlaceMarkers,
}: any) => {
  const timeout:  { current: NodeJS.Timeout | null } = useRef(null);
  const [forceStop, setForceStop] = useState<boolean>(false);
  const defaultPosition: LatLngExpression = [38.62727, -90.19789];
  const prevPlaces = usePrevious(places);
  

  const loadNewData = useCallback((timer) => {
    //console.log(`useCallback - loadNewData`);
    timeout.current =  setTimeout(function(){
      const entityNew = async () => {
        const handler2 = fetch('/.netlify/functions/metro-updates').then((res) => res.json())
        const b = await handler2;
        setNewPlaceMarkers(b, false);
      };
      entityNew();
      if (timeout.current) {
        clearTimeout(timeout.current);
      };
    }, timer);
  },[setNewPlaceMarkers]);

  useEffect(() => {
    //WHY is initial still needed??!!??
    //console.log('useEffect - init "LOAD"');
    if ( initial && places && places.length <=0) {
      const entity = async () => {
        const a = await handler;
        setNewPlaceMarkers(a,true);
      };
      entity();
      loadNewData(15000);
    } 
    if (!initial && prevPlaces && prevPlaces.length >=0 && !forceStop && places !== prevPlaces) {
      loadNewData(organizeVehicles(places, prevPlaces));
    }
  }, [forceStop, initial, loadNewData, places, prevPlaces, setNewPlaceMarkers]);

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
       {console.log(`RETURN`)}
       {markerRefs.length = 0}

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
      
      {(places && places.length >0) && 
      
      <MapContainer
        center={defaultPosition}
        zoom={11}
        scrollWheelZoom={true}
        style={{ height: "100vh" }}
        zoomControl={false}
      >
        {console.log(`RETURN CONDITIONAL!!!`)}
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {places.map((place: Entity) =>  {
          const newRef = createRef<L.Marker>();
          markerRefs.push(newRef);
          return (
          <Marker
            key={place.id}
            position={[place.vehicle.position.latitude, place.vehicle.position.longitude]}
            eventHandlers={{ click: () => showPreview(place) }}
            icon={L.divIcon({
              iconSize: [30, 30],
              iconAnchor: [10, 10],
              popupAnchor: [10, 0],
              shadowSize: [0, 0],
              className: `map-icon map-icon_${place.id}`
            })}
            ref= {newRef as React.RefObject<L.Marker>} 
          >
            <Tooltip key={place.id}>{place.vehicle.vehicle.label}</Tooltip>
          </Marker>
        )})}
        {/** <AddMarker /> */}
      </MapContainer>
      }
    </div>
  );
};

const mapStateToProps = (state: IState) => {
  const { places } = state;
  return {
    isVisible: places.placePreviewsIsVisible,
    places: places.places,
    initial: places.initial,
    selectedPlace: places.selectedPlace,
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
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Map);

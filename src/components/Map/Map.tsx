import { useEffect,useCallback,useRef, createRef, memo } from "react";
import { connect } from "react-redux";
import L, { LatLngExpression } from "leaflet";
import { MapContainer, TileLayer, Marker, Tooltip } from "react-leaflet";
import { setBusPreviewVisibility, setSelectedBus, setAllBusses, setNewText, setChangeType, setFreshRender } from "../../store/actions";
import { IState, Bus, TextCue } from "../../store/models";
import { playSweep, noteFreq, resetAudioContext, notesKey, playChord } from "../../utils/webAudio"
import { countBy, distance, rndmRng } from "../../utils/calculations";
import { getAdsr, pickFrequency, pickOctave } from "../../utils/waveShaping";
import { usePrevious } from "../../utils/tools";
import "./Map.css";
import store from "../../store";

let newVehicles: Bus[] = []
let retiredVehicles: Bus[] = []
let markerRefs: React.RefObject<L.Marker>[] = [];  
let longAvg= -90.28392791748047
let progress = 0,multiple = 0,chord = 0,start = 0,concertStart = 0,concertStart2 = 0;

const cleanBusData = (entities: any) => {
  const cleaned: Bus[] = [];
  entities.forEach((e: any) => {
    cleaned.push({
      id: e.vehicle.vehicle.id,
      latitude: e.vehicle.position.latitude,
      longitude: e.vehicle.position.longitude,
      timestamp: e.vehicle.timestamp,
      label: e.vehicle.vehicle.label
    })
  });
  return cleaned;
}

const findMarker = (id: string) => markerRefs.find((m) => (m.current && m && m.current.options && m.current.options.icon && m.current.options.icon.options && m.current.options.icon.options.className &&
  m.current.options.icon.options.className.includes(`map-icon_${id}`)));

const organizeVehicles = (busses: Bus[], pastBusses: Bus[], progression: number) => {
  let i2 = 0;

  for (let i=0; i<pastBusses.length; i++) {
    if (!busses[i2]) {
      // console.log(`!busses[i2]`)
      return [];
    } else {
      //// console.log(`i2: ${i2} | id: ${busses[i2].id}`)
    }
    if (pastBusses[i].id !== busses[i2].id) {
        if (busses.some(( b: Bus ) =>b.id === pastBusses[i].id)) {
            newVehicles.push(busses[i2]);
            i--;
        } else {
            retiredVehicles.push(pastBusses[i]);
            i2--
        }
    } else {
        busses[i2].distance = distance(pastBusses[i].latitude , pastBusses[i].longitude, busses[i2].latitude, busses[i2].longitude);
        busses[i2].timing = parseInt(busses[i2].timestamp) - parseInt(pastBusses[i].timestamp);
        busses[i2].mph = (distance(pastBusses[i].latitude , pastBusses[i].longitude, busses[i2].latitude, busses[i2].longitude) / (parseInt(busses[i2].timestamp)- parseInt(pastBusses[i].timestamp))) *3600;
    }

    i2++
    
  }

  //// console.log(`retiredVehicles: ${retiredVehicles.length}`);
  //// console.log(retiredVehicles);

  //// console.log(`busses: ${busses.length}`);
 // // console.table(busses);

  if (retiredVehicles && retiredVehicles.length > 0) {
    let minTime = parseInt(retiredVehicles.sort(function(x: Bus, y: Bus){
      return parseInt(x.timestamp) - parseInt(y.timestamp);
  })[0].timestamp);

    if (concertStart2 === 0) concertStart2 = minTime;

    let progress2 = Math.round(Date.now()/1000)-concertStart;
    let delay2 = (progress2<7)?7-progress2:8-(progress2%8 +1)

    //// console.log(`concertStart2: ${concertStart2} | minTime: ${minTime}`)

    retiredVehicles.forEach((v,i) => {
      const found = findMarker(v.id)
    
      if (i < 4) {
        type OctaveKey = keyof typeof noteFreq;
        let octave: OctaveKey = pickOctave(6-i);
        let noteChar = noteFreq[octave];
        type NoteKey = keyof typeof noteChar;
        let note: NoteKey = notesKey[progression][3][Math.round(rndmRng(3,0))];
        if (note) playChord(noteFreq[octave][note],delay2);
      }
      setTimeout(function(){ 
        if (found && found.current) {
          //// console.log(`!!! GOT ONE!!!!`);

          found.current.setIcon(
            L.divIcon({
              iconSize: [40,40],
              iconAnchor: [10, 10],
              popupAnchor: [10, 0],
              shadowSize: [0, 0],
              className: `map-icon icon-animation2 map-icon_${v.id}`
            })
          );
        }},delay2*1000)
    })
    setTimeout(function(){ 
    store.dispatch(setNewText({
      id: `retired${Date.now()}`,
      text: `${retiredVehicles.length} busses are without updates`,
      class: `retired`,
    }));
  },delay2 *1000);
  }
  
  //// console.log(`newVehicles: ${newVehicles.length}`);
  //// console.log(newVehicles);

  let updatedRoutes = busses.filter((vehicle: Bus) => (vehicle && vehicle.distance !== 0)).sort(function(x: Bus, y: Bus){
    return parseInt(x.timestamp) - parseInt(y.timestamp);
  });

    //// console.log(`newVehicles: ${newVehicles.length}`);
  //// console.log(newVehicles);

  return updatedRoutes;
}

const Map = ({
  isVisible,
  busses,
  freshRender,
  setFreshRender,
  selectedBus,
  togglePreview,
  setBusForPreview,
  setNewBusMarkers,
  addToText,
  volume,
  pause,
  progression,
  changeType,
  setChangeType
}: any) => {
  const timeout:  { current: NodeJS.Timeout | null } = useRef(null);
  const defaultPosition: LatLngExpression = [38.65727, -90.29789];
  const prevBusses = usePrevious(busses);
  const prevPause = usePrevious(pause);
  const prevFreshRender = usePrevious(freshRender);

  const shapeWaves = useCallback((routes: Bus[]) => {
    if (routes.length === 0 || !routes) {
      addToText({
        id: `loading${Date.now()}`,
        text: `No new updates.  Trying again.  loading...`,
        class: `loading`,
      });
      return 4000;
    }

    addToText({
      id: `newdata${Date.now()}`,
      text: `There are currently ${routes.length} busses making moves`,
      class: `newdata`
    });

    let timestampDupes: any = {}
    timestampDupes = countBy(routes, (r:  { timestamp: number; }) => r.timestamp);

    let minTime = parseInt(routes.sort(function(x: Bus, y: Bus){
        return parseInt(x.timestamp) - parseInt(y.timestamp);
    })[0].timestamp);

    let count = 1;

    if (concertStart === 0) concertStart = minTime;
    // console.log(routes);
    routes.forEach((r:Bus,i:number) => {  
      // console.log(`SHAPE WAVES ROTES LOOP r.timestamp: ${r.timestamp}`)
      progress = parseInt(r.timestamp)-concertStart;
      multiple = Math.floor(progress/8)
      chord = (progress >= 8) ? Math.floor((progress - 8*multiple)/2) : Math.floor(progress/2);

      type OctaveKey = keyof typeof noteFreq;
      let octave: OctaveKey = pickFrequency(r.latitude);
      let noteChar = noteFreq[octave];
      type NoteKey = keyof typeof noteChar;
      // console.log(`notesKey[${progression.index}][${chord}]`);
      let note: NoteKey = notesKey[progression.index][chord][Math.round(rndmRng(3,0))];

      if (routes[i-1] && r.timestamp === routes[i-1].timestamp) { 
          start = parseInt(r.timestamp)-minTime+(1/timestampDupes[r.timestamp]*count) 
          count++;
      } else {
          start = parseInt(r.timestamp)-minTime;
          count = 1;
      }

      let end: number = 0;
      let adsr: number = 0;
      if (r && r.distance) end = (r.distance < .05) ? .05 : r.distance;
      end *=10;
      if (end > 4) end = 4;
      if (r && r.mph) adsr = getAdsr(r.mph);

      if (r.latitude  >  38.66) longAvg = -90.3517098;
      let pan = ((Math.abs(longAvg) - Math.abs(r.longitude))*6)*(octave*.15);

      let sweep = {
        volume,
        i,
        start,
        end,
        freq: noteFreq[octave][note],
        pan,
        adsr: adsr * end,
      }
      
      const found = findMarker(r.id)
      setTimeout(function(){ 
        if (found && found.current) {
          found.current.setIcon(
            L.divIcon({
              iconSize: [40,40],
              iconAnchor: [10, 10],
              popupAnchor: [10, 0],
              shadowSize: [0, 0],
              className: `map-icon icon-animation map-icon_${r.id}`
            })
          );
          addToText({
            id: `${r.id}${i}${start}${end}${Date.now()}`,
            text: `${r.label} ~ is playing ${note}${octave} for ${(end*2).toFixed(3)} beats`,
            class: `vehicle`,
          });
        }
      },start*1000)
      playSweep(sweep);
    });

    let timeout: number = (parseInt(routes[routes.length-1].timestamp)-minTime) * 1000;
    return timeout;
  },[addToText, progression, volume]);

  const loadNewData = useCallback((timer:any) => {
    if (timer) {
      timeout.current =  setTimeout(function(){
        if (timeout.current) clearTimeout(timeout.current);
        (async function() {
          const response = fetch('').then((res) => res.json())
          try {
            const entities = await response;
            // console.log('entities')
            // console.dir(entities[0])
            const busEntities = cleanBusData(entities)
            // console.log(busEntities)
            markerRefs.length = 0;
            setNewBusMarkers(busEntities);
            setFreshRender(false);
          } catch(err) {
            addToText({
              id: `loading${Date.now()}`,
              text: `Call failed.  Trying again.  loading...`,
              class: `loading`,
            });
            loadNewData(94000);
          }
        })();
      }, timer)
    } else {
      setFreshRender(true);
      setNewBusMarkers([]);
    }
  },[addToText, setFreshRender, setNewBusMarkers]);

  useEffect(() => {
    if (!pause && busses && busses.length <=0 && freshRender) {
      //// console.log(`initial one`)
      loadNewData(1);
      addToText({
        id: `beginshortly${Date.now()}`,
        text: `loading... The piece will begin shortly. loading...`,
        class: `loading`,
      });
      setFreshRender(false);
    }

    if (prevBusses && prevBusses.length >0 && !pause && busses !== prevBusses && !prevFreshRender) {
      // console.log(`regular load`);
      // console.log(`busses`)
      // console.log(busses)
      // console.log(`prevBusses`)
      // console.log(prevBusses)

      let routes = organizeVehicles(busses, prevBusses, progression.index);
      loadNewData(shapeWaves(routes));
    }

    if (changeType === "dChanges" || (pause && prevPause)) {
      if(timeout && timeout.current)clearTimeout(timeout.current);
      resetAudioContext();
      setChangeType("ndChanges")
    }

    if (!pause && prevPause) {
      //// console.log(`after being paused`)
        let timeElapsed: number = (Math.floor(Date.now() / 1000) - parseInt(busses[0].timestamp));
        (timeElapsed > 50) ?  loadNewData(false) :  loadNewData(4000);
    }
    //// console.log(`prevInitial: ${prevInitial} | initial: ${initial}`)
    if (prevFreshRender) loadNewData(7000);
  }, [addToText, pause, loadNewData, busses, prevBusses, shapeWaves, changeType, prevPause, setChangeType, freshRender, prevFreshRender, progression.index, setFreshRender]);

  const showPreview = (place: Bus) => {
    if (isVisible) {
      togglePreview(false);
      setBusForPreview(null);
    }

    if (selectedBus?.id !== place.id) {
      setTimeout(() => {
        showBus(place);
      }, 400);
    }
  };

  const showBus = (place: Bus) => {
    setBusForPreview(place);
    togglePreview(true);
  };

  function renderItems() {
    return (busses) && busses.map((place: Bus) => 
    <Post key={place.id} place={place} />)
  }

  const Post = memo(({place}: any) => {
    const newRef = createRef<L.Marker>();
    markerRefs.push(newRef);
    return(
      <Marker
          key={place.id}
          position={[place.latitude, place.longitude]}
          eventHandlers={{ click: () => showPreview(place) }}
          icon={L.divIcon({
            iconSize: [40,40],
            iconAnchor: [20, 20],
            popupAnchor: [0, 0],
            shadowSize: [0, 0],
            className: `map-icon map-icon_${place.id} ${(selectedBus && selectedBus.id === place.id) && 'icon-selected'}`
          })}
          ref= {newRef as React.RefObject<L.Marker>} 
        >
          <Tooltip>{place.label}</Tooltip>
        </Marker>
    );  
  });

  return (
    <div className="map__container">
      <MapContainer
        center={defaultPosition}
        zoom={11}
        scrollWheelZoom={true}
        style={{ height: "100vh" }}
        zoomControl={false}
      >
        <TileLayer
          attribution="Map data &copy; <a href=&quot;https://www.openstreetmap.org/&quot;>OpenStreetMap</a> contributors, <a href=&quot;https://creativecommons.org/licenses/by-sa/2.0/&quot;>CC-BY-SA</a>, Imagery &copy; <a href=&quot;https://www.mapbox.com/&quot;>Mapbox</a>"
          url="https://api.mapbox.com/styles/v1/jfitzsimmons/ckvntg80w0gn014qc1s75efwr/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoiamZpdHpzaW1tb25zIiwiYSI6ImNrdm50am1vcDNnMGEybnFmZHpzYzJodWEifQ.Y-mgO21RLeOtil5V_Fu7dA"
        />

        {(busses && busses.length >0) && renderItems()}

      </MapContainer>
    </div>
  );
};

const mapStateToProps = (state: IState) => {
  const { busses, controls } = state;
  return {
    isVisible: busses.placePreviewsIsVisible,
    busses: busses.busses,
    selectedBus: busses.selectedBus,
    volume: controls.volume,
    pause: controls.pause,
    progression: controls.progression,
    changeType: controls.changeType,
    freshRender: controls.freshRender,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    togglePreview: (payload: boolean) =>
      dispatch(setBusPreviewVisibility(payload)),
    setBusForPreview: (payload: Bus) =>
      dispatch(setSelectedBus(payload)),
    setNewBusMarkers: (payload: Bus[]) =>
      dispatch(setAllBusses(payload)),
    addToText: (payload: TextCue) =>
      dispatch(setNewText(payload)),
    setChangeType: (payload: string) =>
      dispatch(setChangeType(payload)),
    setFreshRender: (payload: boolean) =>
      dispatch(setFreshRender(payload)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Map);
import React, { useEffect, useState } from "react";
import { LatLngExpression } from "leaflet";
import { MapContainer, TileLayer, Marker, Tooltip, Polyline } from "react-leaflet";
import { connect } from "react-redux";
import { setPlacePreviewVisibility, setSelectedPlace, setAllPlaces } from "../../store/actions";
import { IState, Place, Entity } from "../../store/models";
import AddMarker from "./AddMarker";

import "./Map.css";

const Map = ({
  isVisible,
  places,
  selectedPlace,
  togglePreview,
  setPlaceForPreview,
  setNewPlaceMarkers,
}: any) => {
  const defaultPosition: LatLngExpression = [38.62727, -90.19789]; // stl position
  const [polyLineProps, setPolyLineProps] = useState([]);

  const handler = 
    fetch('/.netlify/functions/metro-updates')
    .then((res) => res.json())

  const entity = async () => {
    const a = await handler;
    setNewPlaceMarkers(a);
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
      <MapContainer
        center={defaultPosition}
        zoom={11}
        scrollWheelZoom={false}
        style={{ height: "100vh" }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Polyline positions={polyLineProps} />
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

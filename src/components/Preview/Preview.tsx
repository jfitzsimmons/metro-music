import { connect } from "react-redux";
import { setPlacePreviewVisibility } from "../../store/actions";
import { IState } from "../../store/models";
import { AiFillCloseCircle } from "react-icons/ai";
import "./Preview.css";

const Preview = ({ isVisible, place, closePreview }: any) => {
  return (
    <div
      className={`preview__container preview__container--${
        isVisible && place && "active"
      }`}
    >
      <div className="preview__close" onClick={() => closePreview()}>
        <AiFillCloseCircle></AiFillCloseCircle>
      </div>
      <div className="preview__description__container">
        <div className="preview__title">{place?.vehicle.vehicle.label}</div>
        <div className="preview__description">
          <ul>
            <li>latitude: {place?.vehicle.position.latitude}</li>
            <li>longitude: {place?.vehicle.position.longitude}</li>
            <li>timestamp: {new Date(place?.vehicle.timestamp * 1000).toDateString()} | {new Date(place?.vehicle.timestamp * 1000).toTimeString()}</li>
            <li>routeId: {place?.vehicle.trip.routeId}</li>
            <li>startDate: {place?.vehicle.trip.startDate}</li>
            <li>startTime: {place?.vehicle.trip.startTime}</li>
            <li>tripId: {place?.vehicle.trip.tripId}</li>
            <li>vehicle id: {place?.vehicle.vehicle.id}</li>
          </ul>
        </div>
        {/** 
        <div style={{display: 'flex'}}>
          <a className="preview__button" href={place?.seeMoreLink} target="_blank" rel="noreferrer">See more</a>
        </div>
        */}
      </div>
    </div>
  );
};

const mapStateToProps = (state: IState) => {
  const { places } = state;
  return { isVisible: places.placePreviewsIsVisible, place: places.selectedPlace };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    closePreview: () =>
      dispatch(setPlacePreviewVisibility(false)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Preview);

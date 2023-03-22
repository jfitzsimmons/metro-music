import React from 'react'
import { connect } from 'react-redux'
import { AiFillCloseCircle } from 'react-icons/ai'
import { setBusPreviewVisibility } from '../../store/actions'
import { IState } from '../../store/models'
import './Preview.css'

function Preview({ isVisible, place, closePreview }: any) {
  return (
    <div
      className={`preview__container preview__container--${
        isVisible && place && 'active'
      }`}
    >
      <div className="preview__close">
        <AiFillCloseCircle onClick={() => closePreview()} />
      </div>
      <div className="preview__description__container">
        <div className="preview__title">{place?.vehicle.vehicle.label}</div>
        <div className="preview__description">
          <ul>
            <li>latitude: {place?.vehicle.position.latitude}</li>
            <li>longitude: {place?.vehicle.position.longitude}</li>
            <li>
              timestamp:{' '}
              {place && new Date(place.vehicle.timestamp * 1000).toDateString()}
              {place && new Date(place.vehicle.timestamp * 1000).toTimeString()}
            </li>
            <li>routeId: {place?.vehicle.trip.routeId}</li>
            <li>startDate: {place?.vehicle.trip.startDate}</li>
            <li>startTime: {place?.vehicle.trip.startTime}</li>
            <li>tripId: {place?.vehicle.trip.tripId}</li>
            <li>vehicle id: {place?.vehicle.vehicle.id}</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

const mapStateToProps = (state: IState) => {
  const { busses } = state
  return { isVisible: busses.placePreviewsIsVisible, place: busses.selectedBus }
}

const mapDispatchToProps = (dispatch: any) => ({
  closePreview: () => dispatch(setBusPreviewVisibility(false)),
})

export default connect(mapStateToProps, mapDispatchToProps)(Preview)

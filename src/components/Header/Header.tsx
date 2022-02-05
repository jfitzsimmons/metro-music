import { connect } from "react-redux";
import { chooseProgression, pauseOrchestra, setSearchVisibility, setVolume } from "../../store/actions";
import { IState } from "../../store/models";
import "./Header.css";
import { GiMusicalScore } from "react-icons/gi";
import { ChangeEvent } from "react";
import { BiArrowToLeft, BiArrowToRight } from "react-icons/bi";

const Header = ({  
  setSearchVisibility, 
  volume, 
  setVolume, 
  chooseProgression,
  pause, 
  pauseOrchestra,
  visible }: any) => {

  function handleVolume(event:ChangeEvent<HTMLInputElement>) {
    if(event.target){
      const value  = event.target.value.toString();
      setVolume(value);
    }
  }
  function handleProgression(event:ChangeEvent<HTMLSelectElement>) {
    if(event.target){
      const value  = event.target.value.toString();
      chooseProgression(value);
    }
  }
  return (
    <div className="header__container">
      <div className="header__container__top">
        <div className="score-toggle">
          {(visible) ? <BiArrowToLeft
            style={{
              fontSize: "2vmin",
            }}
            onClick={() => setSearchVisibility((visible) ? false : true)}
          /> : <BiArrowToRight
          style={{
            fontSize: "2vmin",
          }}
          onClick={() => setSearchVisibility((visible) ? false : true)}
          />}
          <GiMusicalScore
            style={{
              fontSize: "4vmin",
            }}
            onClick={() => setSearchVisibility((visible) ? false : true)}
          ></GiMusicalScore>
        </div>

         <h1>Concert performed by St. Louis Metro Bus Drivers</h1>
      </div>
    
      <div className="controls">
        <button className={(pause===true) ? "pause" : "play"} onClick={() => pauseOrchestra((pause===true)?false:true)}>{(pause===true)?<><div>play</div><svg viewBox="0 0 24 24" width="44" height="44" stroke="currentColor" stroke-width="1"  stroke-linecap="round" stroke-linejoin="round" className="play-icon"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg></>:<><div>pause</div><svg viewBox="0 0 24 24" width="44" height="44" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" className="play-icon"><rect x="2" y="4" width="7" height="18"></rect><rect x="14" y="4" width="7" height="18"></rect></svg></>}</button>
        
        <div className="volume">
          <div className="volume__display" style={{background: `hsla(209, ${Math.round((volume/.4)*100)}%, 20%, 1)`}}>
            {Math.round((volume/.4)*100)}%
            <br />
            volume
          </div>
          <input type="range" min="0.0" max="0.4" step="0.02"
            value={volume} list="volumes" name="volume" onChange={handleVolume} />
          <datalist id="volumes">
            <option value="0.0" label="Mute" />
            <option value="0.4" label="100%" />
          </datalist>
        </div>
        <div className="flex-1"></div>
        <div className="select-div song">
        <label>Song: </label>
          <select
              onChange={handleProgression}
          >
            <option value={0}>IV I V vim in A Major</option>
            <option value={1}>1 4 5 CMajor</option>
            <option value={2}>2 5 1 C Minor</option>
          </select> 
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state: IState) => {
  const { search, controls } = state;
  return {
    visible: search.searchIsVisible,
    volume: controls.volume,
    pause: controls.pause,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    setSearchVisibility: (payload: boolean) =>
      dispatch(setSearchVisibility(payload)),
    setVolume: (payload: string) =>
      dispatch(setVolume(payload)),
    pauseOrchestra: (payload: boolean) =>
      dispatch(pauseOrchestra(payload)),
    chooseProgression: (payload: number) =>
      dispatch(chooseProgression(payload)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Header);
import { connect } from "react-redux";
import { chooseProgression, pauseOrchestra, setSearchVisibility, setVolume } from "../../store/actions";
import { IState } from "../../store/models";
import "./Header.css";
import { CgPlayListSearch } from "react-icons/cg";
import { ChangeEvent } from "react";

const Header = ({ 
  searchIsVisible, 
  setSearchVisibility, 
  volume, 
  setVolume, 
  chooseProgression,
  pause, 
  pauseOrchestra }: any) => {

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

      <CgPlayListSearch
        style={{
          fontSize: "3rem",
          verticalAlign: "middle",
          position: "absolute",
          left: "1rem",
          top: "10px",
        }}
        onClick={() => setSearchVisibility(!searchIsVisible)}
      ></CgPlayListSearch>

      <span>St. Louis</span>
    
      <div className="controls">
        <button onClick={() => pauseOrchestra((pause===true)?false:true)}>{(pause===true)?'play':'pause'}</button>
        
        <div className="volume">
          <span>Volume: </span>
          <input type="range" min="0.0" max="0.4" step="0.02"
            value={volume} list="volumes" name="volume" onChange={handleVolume} />
          <datalist id="volumes">
            <option value="0.0" label="Mute" />
            <option value="0.4" label="100%" />
          </datalist>
          <div className="volume__display" style={{background: `hsla(209, ${Math.round((volume/.4)*100)}%, 20%, 1)`}}>
            {Math.round((volume/.4)*100)}%
            <br />
            volume
          </div>
        </div>
        <div className="song">
          <span>Song: </span>
          <select
              onChange={handleProgression}
          >
            <option>IV I V vim in A Major</option>
            <option>1 4 5 CMajor</option>
            <option>2 5 1 C Minor</option>
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

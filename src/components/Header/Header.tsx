import { connect } from "react-redux";
import { chooseProgression, pauseOrchestra, setChangeType, setScoreVisibility, setVolume } from "../../store/actions";
import { IState } from "../../store/models";
import "./Header.css";
import { GiMusicalScore } from "react-icons/gi";
import { ChangeEvent } from "react";
import { BiArrowToLeft, BiArrowToRight } from "react-icons/bi";

const Header = ({  
  setScoreVisibility, 
  volume, 
  setVolume, 
  chooseProgression,
  pause, 
  pauseOrchestra,
  visible }: any) => {

  function radioHandler(event:ChangeEvent<HTMLInputElement>) {
    if(event.target){
      const value  = event.target.value.toString();
      setChangeType(value);
    }
  }

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
            onClick={() => setScoreVisibility((visible) ? false : true)}
          /> : <BiArrowToRight
          style={{
            fontSize: "2vmin",
          }}
          onClick={() => setScoreVisibility((visible) ? false : true)}
          />}
          <GiMusicalScore
            style={{
              fontSize: "4vmin",
            }}
            onClick={() => setScoreVisibility((visible) ? false : true)}
          ></GiMusicalScore>
        </div>

         <h1>Concert performed by St. Louis Metro Bus Drivers</h1>
      </div>
    
      <div className="controls">
        <button className={(pause===true) ? "pause" : "play"} onClick={() => pauseOrchestra((pause===true)?false:true)}>{(pause===true)?<><div>play</div><svg viewBox="0 0 24 24" width="44" height="44" stroke="currentColor" strokeWidth="2"  strokeLinecap="round" strokeLinejoin="round" className="play-icon"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg></>:<><div>pause</div><svg viewBox="0 0 24 24" width="44" height="44" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="play-icon"><rect x="2" y="4" width="7" height="18"></rect><rect x="14" y="4" width="7" height="18"></rect></svg></>}</button>
        
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
        <div className="flex-1">
        <fieldset>
        <input
            type="radio"
            name="controlChanges"
            value="dChanges"
            id="ndChanges"
            onChange={radioHandler}
            defaultChecked
          />
          <label htmlFor="ndChanges">non-disruptive changes</label>
          <input
            type="radio"
            name="controlChanges"
            value="dChanges"
            id="dChanges"
            onChange={radioHandler}
          />
          <label htmlFor="dChanges">disruptive changes</label>
          </fieldset>
        </div>
        <div className="select-div song">
        <label>Song: </label>
          <select
              onChange={handleProgression}
          >
            <option value={0}>IV-I-V-vi in A Major</option>
            <option value={1}>I-IV-V in C Major</option>
            <option value={2}>ii-V-I in C Minor</option>
            <option value={3}>I-vi-IV-V in G Major</option>
            <option value={4}>I-V-♭VII-IV in A Major</option>
            <option value={5}>vi-iii-IV-ii in D Major</option>
            <option value={6}>IV-V-iii in E♭ Major</option>
            <option value={7}>IV-iii-VI in G♭ Major</option>
            <option value={8}>i-♭VI-♭III-♭VII in A Minor</option>
            <option value={9}>i-♭VII-♭VI-V7 in F# Minor</option>
          </select> 
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state: IState) => {
  const { score, controls } = state;
  return {
    visible: score.scoreIsVisible,
    volume: controls.volume,
    pause: controls.pause,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    setScoreVisibility: (payload: boolean) =>
      dispatch(setScoreVisibility(payload)),
    setVolume: (payload: string) =>
      dispatch(setVolume(payload)),
    pauseOrchestra: (payload: boolean) =>
      dispatch(pauseOrchestra(payload)),
    chooseProgression: (payload: number) =>
      dispatch(chooseProgression(payload)),
    setChangeType: (payload: string) =>
      dispatch(setChangeType(payload)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Header);
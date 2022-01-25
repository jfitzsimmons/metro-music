import { connect } from "react-redux";
import { setSearchVisibility, setVolume } from "../../store/actions";
import { IState } from "../../store/models";
import "./Header.css";
import { CgPlayListSearch } from "react-icons/cg";
import { ChangeEvent } from "react";

const Header = ({ searchIsVisible, setSearchVisibility, volume, setVolume }: any) => {
  function handleChange(event:ChangeEvent<HTMLInputElement>) {
    if(event.target){
      //console.log(`onchange conditional | volume: ${volume}`)
      const value  = event.target.value.toString();
      //console.log(`onchange conditional | value: ${value}`)
      setVolume(value);
    }
  }
  return (
    <><div className="header__container">

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
      {console.log('headerLOAD')}
    </div>
    <div>
      <span>Volume: </span>
      <input type="range" min="0.0" max="0.4" step="0.02"
        value={volume} list="volumes" name="volume" onChange={handleChange} />
      <datalist id="volumes">
        <option value="0.0" label="Mute" />
        <option value="0.4" label="100%" />
      </datalist>
    </div></>
  );
};

const mapStateToProps = (state: IState) => {
  const { search, controls } = state;
  return {
    visible: search.searchIsVisible,
    volume: controls.volume,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    setSearchVisibility: (payload: boolean) =>
      dispatch(setSearchVisibility(payload)),
    setVolume: (payload: string) =>
      dispatch(setVolume(payload)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Header);

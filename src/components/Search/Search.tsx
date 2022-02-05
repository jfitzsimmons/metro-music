import { connect } from "react-redux";
import { setSearchVisibility } from "../../store/actions";
import { IState, TextCue } from "../../store/models";
import {BiArrowBack} from "react-icons/bi"
import "./Search.css";
import { memo, useEffect, useRef } from "react";
import Header from "../Header/Header";

const Search = ({ searchIsVisible, closeSearch, textCues }: any) => {
  const bottomRef:  { current: HTMLElement | null } = useRef(null);

  function isInViewport(element: HTMLElement ) {
      const rect = element.getBoundingClientRect();
      return (
          rect.top >= 0 &&
          rect.left >= 0 &&
          rect.bottom <= (window.innerHeight+100 || document.documentElement.clientHeight+100) &&
          rect.right <= (window.innerWidth || document.documentElement.clientWidth)
      );
    }

  function renderItems() {
    return (textCues) && textCues.map((tc: TextCue) => <Post key={tc.id} text={tc.text} className={(tc.class)&&tc.class} />)
  }

  useEffect(() => {
    if (bottomRef && bottomRef.current && isInViewport(bottomRef.current)) bottomRef.current.scrollIntoView({ behavior: "smooth" });
  }, [textCues]);

  return (
    <div
      className={`search__container search__container--${
        searchIsVisible && "active"
      }`}>
        <Header />
      <div className="search__header">
        <span className="search__header__close" role="button" onClick={() => closeSearch()}><BiArrowBack/></span>
        <span className="search__header__title">Score</span>
      </div>
      <div className="search__list">
        {renderItems()}
        <div id="bottom-reference" className="bottom-reference" ref={bottomRef as React.RefObject<HTMLDivElement>}>
        &#119070;
        </div> 
      </div>
    </div>
  );
};

var truncateBefore = function (str:string, pattern:string) {
  return str.slice(str.indexOf(pattern) + pattern.length);
};
var truncateAfter = function (str:string, pattern:string) {
  return str.slice(0, str.indexOf(pattern));
} 
const Post = memo(({text, className}: any) => {
  return(
    <div className={`${className} search__list__item`}>
      {(className === "vehicle") ? <><span className="bus">{truncateAfter(text, "~")}</span><span className="triangle"></span><span className="note">{truncateBefore(text, "~")}</span></> : text}
    </div>
  );  
});

const mapStateToProps = (state: IState) => {
  const { search } = state;
  return {
    searchIsVisible: search.searchIsVisible, 
    textCues: search.textCues,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    closeSearch: () =>
      dispatch(setSearchVisibility(false)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Search);

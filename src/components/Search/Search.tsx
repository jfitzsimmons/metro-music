import { connect } from "react-redux";
import { setSearchVisibility } from "../../store/actions";
import { IState, TextCue } from "../../store/models";
import {BiArrowBack} from "react-icons/bi"
import "./Search.css";
import { memo, useEffect, useRef } from "react";

const Search = ({ searchIsVisible, closeSearch, textCues }: any) => {
  const bottomRef:  { current: HTMLElement | null } = useRef(null);

  function isInViewport(element: HTMLElement ) {
      const rect = element.getBoundingClientRect();
      return (
          rect.top >= 0 &&
          rect.left >= 0 &&
          rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
          rect.right <= (window.innerWidth || document.documentElement.clientWidth)
      );
    }

  function renderItems() {
    return (textCues) && textCues.map((tc: TextCue) => <Post key={tc.id} text={tc.text} />)
  }

  useEffect(() => {
    if (bottomRef && bottomRef.current && isInViewport(bottomRef.current)) bottomRef.current.scrollIntoView({ behavior: "smooth" });
  }, [textCues]);

  return (
    <div
      className={`search__container search__container--${
        searchIsVisible && "active"
      }`}>
      <div className="search__header">
        <span className="search__header__close" role="button" onClick={() => closeSearch()}><BiArrowBack/></span>
        <span className="search__header__title">Search</span>
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

const Post = memo(({text}: any) => {
  return(<div>{text}</div>);  
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

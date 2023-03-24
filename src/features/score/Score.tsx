import React, { memo, useEffect, useRef } from 'react'
import { BiArrowToLeft } from 'react-icons/bi'
import { BsMusicNoteBeamed } from 'react-icons/bs'
import { useAppSelector, useAppDispatch } from '../../store/hooks'
import { scoreVisibilitySet } from './scoreSlice'
import { TextCue } from '../../store/models'
import './score.css'
import { truncateAfter, truncateBefore, isInViewport } from '../../utils/tools'

const Line = memo(({ text, className }: any) => (
  <div className={`${className} score__list__item`}>
    {className === 'vehicle' ? (
      <>
        <span className="bus">{truncateAfter(text, '~')}</span>
        <span className="triangle" />
        <span className="note">{truncateBefore(text, '~')}</span>
      </>
    ) : (
      text
    )}
  </div>
))

export default function Score() {
  const dispatch = useAppDispatch()
  const bottomRef: { current: HTMLElement | null } = useRef(null)
  const { textCues, scoreIsVisible } = useAppSelector((state) => state.score)

  function renderItems() {
    return (
      textCues &&
      textCues.map((tc: TextCue) => (
        <Line
          key={tc.id}
          text={tc.text}
          className={tc.class && tc.class}
        />
      ))
    )
  }

  useEffect(() => {
    if (bottomRef && bottomRef.current && isInViewport(bottomRef.current))
      bottomRef.current.scrollIntoView({ behavior: 'smooth' })
  }, [textCues])

  return (
    <div
      className={`score__container score__container--${
        scoreIsVisible && 'active'
      }`}
    >
      <div className="score__header">
        {scoreIsVisible && (
          <>
            <button
              className="score__header__close"
              type="button"
              onClick={() => dispatch(scoreVisibilitySet())}
            >
              <BiArrowToLeft />
            </button>
            <span className="score__header__title">Score</span>
          </>
        )}
      </div>
      <div className="score__list">
        {renderItems()}
        <div
          id="bottom-reference"
          className="bottom-reference"
          ref={bottomRef as React.RefObject<HTMLDivElement>}
        >
          <BsMusicNoteBeamed />
        </div>
      </div>
    </div>
  )
}

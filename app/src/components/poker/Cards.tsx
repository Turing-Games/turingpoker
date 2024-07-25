import * as PokerLogic from "@tg/game-logic/poker";
import Card from "../Card";
import { useLayoutEffect, useRef, useState } from "react";
const PLACEHOLDER_CARDS = 5;
export default function Cards({ cards }: { cards: PokerLogic.Card[] }) {
  const placeholderCards = [];
  const realCards = [];
  const deckRef = useRef<HTMLDivElement>(null);

  const allRef = useRef<HTMLDivElement>(null);

  for (let i = 0; i < PLACEHOLDER_CARDS; i++) {
    if (i > 0) placeholderCards.push(<Card key={i} className="opacity-0" />);
    realCards.push(<Card key={i} className="absolute opacity-0 transition duration-[100] ease-out" value={i < cards.length ? cards[i] : undefined} />);
  }
  const [windowSz, setWindowSz] = useState({ width: window.innerWidth, height: window.innerHeight });

  useLayoutEffect(() => {
    if (!allRef.current) return;
    const observer = new ResizeObserver(() => {
      setWindowSz({ width: window.innerWidth, height: window.innerHeight });
    });
    observer.observe(allRef.current.parentElement ?? allRef.current);
    return () => observer.disconnect();
  }, [allRef.current])

  useLayoutEffect(() => {
    if (!deckRef.current || !allRef.current) return;
    const position = {
      left: deckRef.current.offsetLeft,
      top: deckRef.current.offsetTop
    };
    for (let i = cards.length; i < PLACEHOLDER_CARDS; i++) {
      allRef.current.children[i].style.zIndex = 0;
      allRef.current.children[i].style.top = `${position.top}px`;
      allRef.current.children[i].style.left = `${position.left}px`;
      allRef.current.children[i].style.opacity = 0;
    }
    for (let i = 0; i < cards.length; i++) {
      const child = allRef.current.children[i + PLACEHOLDER_CARDS]
      const targetPos = {
        left: child.offsetLeft,
        top: child.offsetTop
      };
      allRef.current.children[i].style.top = `${targetPos.top}px`;
      allRef.current.children[i].style.left = `${targetPos.left}px`;
      allRef.current.children[i].style.opacity = 1;
      allRef.current.children[i].style.zIndex = 4;
    }
  }, [cards, deckRef.current, allRef.current, windowSz])

  return (
    <div className="flex gap-[8px] justify-center items-center flex-wrap" ref={allRef}>
      {realCards}
      <Card style={{
        zIndex: 2,
      }} ref={deckRef} />
      {placeholderCards}
    </div>
  );
}

import * as PokerLogic from "@tg/game-logic/poker";
import Card from "../Card";
import { useLayoutEffect, useRef } from "react";
const PLACEHOLDER_CARDS = 5;
export default function Cards({ cards }: { cards: PokerLogic.Card[] }) {
  const placeholderCards = [];
  const realCards = [];
  const deckRef = useRef<HTMLDivElement>(null);
  const realCardsRef = useRef<HTMLDivElement>(null);
  const placeholderCardsRef = useRef<HTMLDivElement>(null);

  for (let i = 0; i < PLACEHOLDER_CARDS; i++) {
    placeholderCards.push(<Card key={i} className="tg-poker__table__dealer__placeholder-card" />);
    realCards.push(<Card key={i} className="tg-poker__table__dealer__card" value={i < cards.length ? cards[i] : undefined} />);
  }
  useLayoutEffect(() => {
    if (!deckRef.current || !realCardsRef.current || !placeholderCardsRef.current) return;
    const position = {
      left: deckRef.current.offsetLeft,
      top: deckRef.current.offsetTop
    };
    for (let i = cards.length; i < PLACEHOLDER_CARDS; i++) {
        realCardsRef.current.children[i].style.top = `${position.top}px`;
        realCardsRef.current.children[i].style.left = `${position.left}px`;
    }
    for (let i = 0; i < cards.length; i++) {
      const child = placeholderCardsRef.current.children[i]
        const targetPos = {
          left: child.offsetLeft,
          top: child.offsetTop
        };
        realCardsRef.current.children[i].style.top = `${targetPos.top}px`;
        realCardsRef.current.children[i].style.left = `${targetPos.left}px`;
        realCardsRef.current.children[i].style.opacity = 1;
    }
  }, [cards, deckRef.current, realCardsRef.current, placeholderCardsRef.current])
  return (
    <div className="tg-poker__table__dealer__cards">
      <Card style={{
        zIndex: 1
      }}
      ref={deckRef}/>
      <div ref={realCardsRef} >
        {realCards}
      </div>
      <div ref={placeholderCardsRef} style={{
        display: 'flex',
        gap: '8px',
        flexWrap: 'wrap',
      }}>
        {placeholderCards}
      </div>
    </div>
  );
}

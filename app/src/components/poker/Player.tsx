import React, { CSSProperties, useEffect, useState } from "react";
import Card from "../Card";
import * as Poker from "@app/party/src/game-logic/poker";
import { ClientState } from "@app/client";
import GameControls from "./GameControls";

interface PlayerProps {
  player: Poker.IPokerPlayer;
  hand: Poker.Card[];
  hands?: Record<string, Poker.Card[]>;
  className?: string;
  style?: CSSProperties;
  isCurrentPlayerTurn: boolean;
  title: string;
  showCards: boolean;
  dealer: boolean;
}

const Player = ({ player, hand, hands, className, style, title, showCards, dealer}: PlayerProps) => {
  const handToRender = hand || (hands && hands[player.id]) || [];
  const [cardEffects, setCardEffects] = useState<[CSSProperties, CSSProperties]>([{}, {}]);

  useEffect(() => {
    if (player.folded) {
      // pick random rotation, transform and set opacity to 0
      setCardEffects([
        {
          transition: 'transform 1s ease-out, opacity 1s ease-out',
          transform: `translate(${Math.random() * 600-300}px, ${Math.random() * 600-300}px) rotate(${Math.random() * 360}deg)`,
          opacity: 0,
        },
        {
          transition: 'transform 1s ease-out, opacity 1s ease-out',
          transform: `translate(${Math.random() * 600-300}px, ${Math.random() * 600-300}px) rotate(${Math.random() * 360}deg)`,
          opacity: 0,
        },
      ]);
    }
    else {
      const x1 = 13 + Math.random() * 8, x2 = 13 + Math.random() * 8;
      const y1 = 18 + Math.random() * 8, y2 = 18 + Math.random() * 8;
      const r1 = 5 + Math.random() * 20, r2 = 5 + Math.random() * 20;
      setCardEffects([{
        transform: `rotate(-${r1.toFixed(2)}deg) translate(${x1.toFixed(2)}px, ${y1.toFixed(2)}px)`,
      }, {
        transform: `rotate(${r2.toFixed(2)}deg) translate(-${x2.toFixed(2)}px, ${y2.toFixed(2)}px)`,
      }]);
    }
  }, [player.folded]);
  console.log(cardEffects)

  return (
    <div className={`tg-poker__player${className ? '.' + className : ''}`} style={style}>
      <div className="tg-poker__player__details">
        <h4>{`${title}`}</h4>
        <div>{player.folded ? 'Folded' : `$${player.currentBet.toFixed(2)}`} / ${player.stack.toFixed(2)}</div>

        {dealer && <div className="tg-poker__table__dealer_marker">D</div>}
      </div>
      <div style={{ display: 'flex', gap: '6px', margin: '16px 0',
        flexDirection: 'row', justifyContent: 'center',
        width: '100%',
       }}>
        {showCards && (
          handToRender.length ? handToRender.map((c, i) => <Card style={cardEffects[i]} key={i} value={c} />) : <>
            <Card style={cardEffects[0]}/>
            <Card style={cardEffects[1]}/>
          </>
        )}
      </div>
    </div>
  );
};

export default Player;

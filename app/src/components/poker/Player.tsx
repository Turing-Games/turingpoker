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
}

const Player = ({ player, hand, hands, className, style, title, showCards}: PlayerProps) => {
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
      setCardEffects([{}, {}]);
    }
  }, [player.folded]);

  return (
    <div className={`tg-poker__player${className ? '.' + className : ''}`} style={style}>
      <div className="tg-poker__player__details">
        <h4>{`${title}`}</h4>
        <div>{player.folded ? 'Folded' : `$${player.currentBet.toFixed(2)}`} / ${player.stack.toFixed(2)}</div>
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
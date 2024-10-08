import React, { CSSProperties, useEffect, useState } from "react";
import Card from "../Card";
import * as Poker from "@app/party/src/game-logic/poker";
import { ClientState } from "@app/client";
import GameControls from "./GameControls";
import useSmallScreen from "@app/hooks/useSmallScreen";

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

const Player = ({ player, hand, hands, className, style, title, showCards, dealer }: PlayerProps) => {
  const handToRender = hand || (hands && hands[player.id]) || [];
  const [cardEffects, setCardEffects] = useState<[CSSProperties, CSSProperties]>([{}, {}]);
  const smallScreen = useSmallScreen();

  useEffect(() => {
    if (player.folded) {
      // pick random rotation, transform and set opacity to 0
      setCardEffects([
        {
          transition: 'transform 0.2s ease-out, opacity 0.2s ease-out',
          transform: `translate(${Math.random() * 600 - 300}px, ${Math.random() * 600 - 300}px) rotate(${Math.random() * 360}deg)`,
          opacity: 0,
          position: 'absolute'
        },
        {
          transition: 'transform 0.2s ease-out, opacity 0.2s ease-out',
          transform: `translate(${Math.random() * 600 - 300}px, ${Math.random() * 600 - 300}px) rotate(${Math.random() * 360}deg)`,
          opacity: 0,
          position: 'absolute'
        },
      ]);
    }
    else {
      const yoff = -140;
      const xoff = 25;
      const x1 = xoff + Math.random() * 8, x2 = xoff + Math.random() * 8;
      const y1 = yoff + Math.random() * 8, y2 = yoff + Math.random() * 8;
      const r1 = 10 + Math.random() * 15, r2 = 10 + Math.random() * 15;
      if (smallScreen) {
        setCardEffects([{
          transform: `rotate(-${r1.toFixed(2)}deg) translate(${x1.toFixed(2)}%, ${y1.toFixed(2)}%)`,
          position: 'absolute'
        }, {
          transform: `rotate(${r2.toFixed(2)}deg) translate(${(-x2).toFixed(2)}%, ${y2.toFixed(2)}%)`,
          position: 'absolute'
        }]);
      }
      else {
        setCardEffects([{
          position: 'unset'
        }, {
          position: 'unset'
        }]);
      }
    }
  }, [player.folded, smallScreen]);

  return (
    <div className={`tg-poker__player${className ? '.' + className : ''}`} style={style}>
      <div className="tg-poker__player__details">
        <h4>{`${title}`}</h4>
        <div>{player.folded ? 'Folded' : `$${player.currentBet.toFixed(2)}`} / ${player.stack.toFixed(2)}</div>

        {dealer && <div className="border border-black absolute bg-[white] text-[black] w-[20px] h-[20px] rounded-md top-[-6px] right-[-6px] flex justify-center items-center text-center w-[40px]">D</div>}
        {player.isBot && <div className="border border-black absolute bg-[#5887ff] text-[black] w-[20px] h-[20px] rounded-md top-[16px] right-[-6px] flex justify-center items-center text-center w-[40px] text-white">AI</div>}
      </div>
      <div style={{
        display: 'flex', gap: '6px', margin: '16px 0',
        flexDirection: 'row', justifyContent: 'center',
        width: '100%',
      }}>
        {showCards && (
          handToRender.length ? handToRender.map((c, i) => <Card style={cardEffects[i]} key={i} value={c} />) : <>
            <Card style={cardEffects[0]} />
            <Card style={cardEffects[1]} />
          </>
        )}
      </div>
    </div>
  );
};

export default Player;

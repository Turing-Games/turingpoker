import React from "react";
import Card from "../Card";
import * as Poker from "@tg/game-logic/poker";

interface PlayerProps {
  player: Poker.IPokerPlayer;
  hand: Poker.Card[];
  hands?: Record<string, Poker.Card[]>;
  className?: string;
  style?: React.CSSProperties;
  isCurrentPlayerTurn: boolean;
  title: string;
  showCards: boolean;
}

const Player = ({ player, hand, hands, className, style, title, showCards }: PlayerProps) => {
  const handToRender = hand || (hands && hands[player.id]) || [];

  return (
    <div className={`tg-poker__player${className ? '.' + className : ''}`} style={style}>
      <div className="tg-poker__player__details">
        <h4>{`${title} - $${player.stack}`}</h4>
        <div>{`Bet: $${player.currentBet}`}</div>
      </div>
      <div style={{ display: 'flex', gap: '6px', margin: '16px 0' }}>
        {showCards && (
          handToRender.length ? handToRender.map((c, i) => <Card key={i} value={Poker.formatCard(c)} />) : <>
            <Card />
            <Card />
          </>
        )}
      </div>
    </div>
  );
};

export default Player;
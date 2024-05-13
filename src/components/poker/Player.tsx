import React from "react";
import Card from "../Card";

interface PlayerProps {
  player: any;
  hand: any[];
  hands?: any;
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
        {showCards ? (
          handToRender.map((c, i) => <Card key={i} value={`${c.suit}_${c.rank}`} />)
        ) : (
          handToRender.map((c, i) => <Card key={i} value="" />)
        )}
      </div>
    </div>
  );
};

export default Player;
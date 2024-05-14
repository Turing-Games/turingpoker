import { FC } from "hono/jsx";
import Card from "../Card";
import * as Poker from "@app/party/src/game-logic/poker";

interface PlayerProps {
  player: Poker.IPokerPlayer;
  hand: Poker.Card[];
  hands?: Record<string, Poker.Card[]>;
  className?: string;
  style?: any;
  isCurrentPlayerTurn: boolean;
  title: string;
  showCards: boolean;
}

const Player = ({ player, hand, hands, className, style, title, showCards }: PlayerProps) => {
  const handToRender = hand || (hands && hands[player.id]) || [];

  return (
    <div className={`tg-poker__player${className ? '.' + className : ''}`} style={style}>
      <div className="tg-poker__player__details">
        <h4>{`${title} - $${player.stack.toFixed(2)}`}</h4>
        <div>{`Bet: $${player.currentBet.toFixed(2)}`}</div>
      </div>
      <div style={{ display: 'flex', gap: '6px', margin: '16px 0',
        flexDirection: 'row', justifyContent: 'center',
        width: '100%',
       }}>
        {showCards && (
          handToRender.length ? handToRender.map((c, i) => <Card key={i} value={c} />) : <>
            <Card />
            <Card />
          </>
        )}
      </div>
    </div>
  );
};

export default Player;
import Logo from '@static/images/logo.png'
import React, { forwardRef } from 'react';
import Loader from "./Loader";
import { IPlayer } from "@app/party/src/game";

export default function Header(props: {
  players: IPlayer[]
  gameType: string
  playerId: string | null
  minPlayers: number
}) {
  const { players, gameType, minPlayers } = props;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
      <div className="tg-header" >
        <div className='tg-header__logo'>
          <img src={Logo} alt="Logo" />
        </div>
        {/* text */}
        <div className='tg-header__title' >
          <h2>{gameType ? `Table: ${gameType}` : 'Welcome!'}</h2>
          <p>Turing Games</p>
        </div>
        <div className='tg-header__logo'>
          <img src={Logo} alt="Logo" />
        </div>
        {
          Array(4).fill('_').map((_, i) => (
            <div className={`tg-header__squares tg-header__squares--${i}`} key={i} > </div>
          ))}
      </div>
    </div>
  );
}
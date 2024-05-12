import React from "react";
import Logo from '@public/images/logo.png';
import { getImagePath } from '../utils/string_utilities';
import Loader from "./Loader";
import { IPlayer } from "@tg/server";

export default function Header(props: {
  players: IPlayer[],
  gameType: string,
  minPlayers: number
}) {
  const { players, gameType, minPlayers } = props;

  return (
    <div style={{ margin: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div className="tg-header" >
        <div className='tg-header__logo' style={{ left: '12px' }}>
          <img src={getImagePath(Logo)} alt="Logo" />
        </div>
        {/* text */}
        <div className='tg-header__title' >
          <h2>{gameType ? `Table: ${gameType}` : 'Welcome!'}</h2>
          <p>Turing Games</p>
        </div>
        < div className='tg-header__logo' style={{ right: '12px' }}>
          <img src={getImagePath(Logo)} alt="Logo" />
        </div>
        {
          Array(4).fill('_').map((el, i) => (
            <div className={`tg-header__squares tg-header__squares--${i}`} key={i} > </div>
          ))}
      </div>
      {
        players?.length < minPlayers && (
          <div>
            <Loader style={{ margin: '24px 0' }} />
            < p > Waiting for players to join...</p>
          </div>
        )
      }
    </div>
  );
}
// import Logo from '../../public/images/logo.png'
import Loader from "./Loader";
import { IPlayer } from "@tg/game";

export default function Header(props: {
  players: IPlayer[]
  gameType: string
  playerId: string | null
  minPlayers: number
}) {
  const { players, gameType, minPlayers } = props;

  return (
    <div style={{ margin: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div className="tg-header" >
        <div className='tg-header__logo' style={{ left: '12px' }}>
          <img src={'../../static/images/logo.png'} alt="Logo" />
        </div>
        {/* text */}
        <div className='tg-header__title' >
          <h2>{gameType ? `Table: ${gameType}` : 'Welcome!'}</h2>
          <p>Turing Games</p>
        </div>
        < div className='tg-header__logo' style={{ right: '12px' }}>
          <img src={'../../static/images/logo.png'} alt="Logo" />
        </div>
        {
          Array(4).fill('_').map((_, i) => (
            <div className={`tg-header__squares tg-header__squares--${i}`} key={i} > </div>
          ))}
      </div>
      {
        players?.length < minPlayers && (
          <div>
            <Loader style={{ margin: '24px 0' }} />
            <p> Waiting for players to join...</p>
          </div>
        )
      }
    </div>
  );
}
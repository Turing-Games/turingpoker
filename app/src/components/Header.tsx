import Logo from '@static/images/logo.png'
import { IPlayer } from "@app/party/src/game";
import { Text } from '@radix-ui/themes';

export default function Header(props: {
  players: IPlayer[]
  gameType: string
  playerId: string | null
  minPlayers: number
}) {
  const { players, gameType, minPlayers } = props;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
      <div className="flex jsutify-left px-[12px] py-[8px] text-left relative bg-[black] left-0 border border-2 border-green" >
        <img src={Logo} alt="Logo" className="h-[40px] min-h-[40px]" />
        {/* text */}
        <div className='tg-header__title' >
          <h2>{gameType ? `Table: ${gameType}` : 'Welcome!'}</h2>
          <Text>Turing Games</Text>
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
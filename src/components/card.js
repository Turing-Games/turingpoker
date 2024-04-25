import { getImagePath } from '../utils/string_utilities'
// all card svgs
import clubs2 from '../../public/images/cards/svg-cards/2_of_clubs.svg'
import diamonds2 from '../../public/images/cards/svg-cards/2_of_diamonds.svg'
import hearts2 from '../../public/images/cards/svg-cards/2_of_hearts.svg'
import spades2 from '../../public/images/cards/svg-cards/2_of_spades.svg'
import clubs3 from '../../public/images/cards/svg-cards/3_of_clubs.svg'
import diamonds3 from '../../public/images/cards/svg-cards/3_of_diamonds.svg'
import hearts3 from '../../public/images/cards/svg-cards/3_of_hearts.svg'
import spades3 from '../../public/images/cards/svg-cards/3_of_spades.svg'
import clubs4 from '../../public/images/cards/svg-cards/4_of_clubs.svg'
import diamonds4 from '../../public/images/cards/svg-cards/4_of_diamonds.svg'
import hearts4 from '../../public/images/cards/svg-cards/4_of_hearts.svg'
import spades4 from '../../public/images/cards/svg-cards/4_of_spades.svg'
import clubs5 from '../../public/images/cards/svg-cards/5_of_clubs.svg'
import diamonds5 from '../../public/images/cards/svg-cards/5_of_diamonds.svg'
import hearts5 from '../../public/images/cards/svg-cards/5_of_hearts.svg'
import spades5 from '../../public/images/cards/svg-cards/5_of_spades.svg'
import clubs6 from '../../public/images/cards/svg-cards/6_of_clubs.svg'
import diamonds6 from '../../public/images/cards/svg-cards/6_of_diamonds.svg'
import hearts6 from '../../public/images/cards/svg-cards/6_of_hearts.svg'
import spades6 from '../../public/images/cards/svg-cards/6_of_spades.svg'
import clubs7 from '../../public/images/cards/svg-cards/7_of_clubs.svg'
import diamonds7 from '../../public/images/cards/svg-cards/7_of_diamonds.svg'
import hearts7 from '../../public/images/cards/svg-cards/7_of_hearts.svg'
import spades7 from '../../public/images/cards/svg-cards/7_of_spades.svg'
import clubs8 from '../../public/images/cards/svg-cards/8_of_clubs.svg'
import diamonds8 from '../../public/images/cards/svg-cards/8_of_diamonds.svg'
import hearts8 from '../../public/images/cards/svg-cards/8_of_hearts.svg'
import spades8 from '../../public/images/cards/svg-cards/8_of_spades.svg'
import clubs9 from '../../public/images/cards/svg-cards/9_of_clubs.svg'
import diamonds9 from '../../public/images/cards/svg-cards/9_of_diamonds.svg'
import hearts9 from '../../public/images/cards/svg-cards/9_of_hearts.svg'
import spades9 from '../../public/images/cards/svg-cards/9_of_spades.svg'
import clubs10 from '../../public/images/cards/svg-cards/10_of_clubs.svg'
import diamonds10 from '../../public/images/cards/svg-cards/10_of_diamonds.svg'
import hearts10 from '../../public/images/cards/svg-cards/10_of_hearts.svg'
import spades10 from '../../public/images/cards/svg-cards/10_of_spades.svg'
import clubsAce from '../../public/images/cards/svg-cards/ace_of_clubs.svg'
import diamondsAce from '../../public/images/cards/svg-cards/ace_of_diamonds.svg'
import heartsAce from '../../public/images/cards/svg-cards/ace_of_hearts.svg'
import spadesAce from '../../public/images/cards/svg-cards/ace_of_spades.svg'
import clubsJack from '../../public/images/cards/svg-cards/jack_of_clubs.svg'
import diamondsJack from '../../public/images/cards/svg-cards/jack_of_diamonds.svg'
import heartsJack from '../../public/images/cards/svg-cards/jack_of_hearts.svg'
import spadesJack from '../../public/images/cards/svg-cards/jack_of_spades.svg'
import clubsQueen from '../../public/images/cards/svg-cards/queen_of_clubs.svg'
import diamondsQueen from '../../public/images/cards/svg-cards/queen_of_diamonds.svg'
import heartsQueen from '../../public/images/cards/svg-cards/queen_of_hearts.svg'
import spadesQueen from '../../public/images/cards/svg-cards/queen_of_spades.svg'
import clubsKing from '../../public/images/cards/svg-cards/king_of_clubs.svg'
import diamondsKing from '../../public/images/cards/svg-cards/king_of_diamonds.svg'
import heartsKing from '../../public/images/cards/svg-cards/king_of_hearts.svg'
import spadesKing from '../../public/images/cards/svg-cards/king_of_spades.svg'

const cardMap = {
  '2_Clubs': clubs2,
  '2_Diamonds': diamonds2,
  '2_Hearts': hearts2,
  '2_Spades': spades2,
  '3_Clubs': clubs3,
  '3_Diamonds': diamonds3,
  '3_Hearts': hearts3,
  '3_Spades': spades3,
  '4_Clubs': clubs4,
  '4_Diamonds': diamonds4,
  '4_Hearts': hearts4,
  '4_Spades': spades4,
  '5_Clubs': clubs5,
  '5_Diamonds': diamonds5,
  '5_Hearts': hearts5,
  '5_Spades': spades5,
  '6_Clubs': clubs6,
  '6_Diamonds': diamonds6,
  '6_Hearts': hearts6,
  '6_Spades': spades6,
  '7_Clubs': clubs7,
  '7_Diamonds': diamonds7,
  '7_Hearts': hearts7,
  '7_Spades': spades7,
  '8_Clubs': clubs8,
  '8_Diamonds': diamonds8,
  '8_Hearts': hearts8,
  '8_Spades': spades8,
  '9_Clubs': clubs9,
  '9_Diamonds': diamonds9,
  '9_Hearts': hearts9,
  '9_Spades': spades9,
  '10_Clubs': clubs10,
  '10_Diamonds': diamonds10,
  '10_Hearts': hearts10,
  '10_Spades': spades10,
  'J_Clubs': clubsJack,
  'J_Diamonds': diamondsJack,
  'J_Hearts': heartsJack,
  'J_Spades': spadesJack,
  'Q_Clubs': clubsQueen,
  'Q_Diamonds': diamondsQueen,
  'Q_Hearts': heartsQueen,
  'Q_Spades': spadesQueen,
  'K_Clubs': clubsKing,
  'K_Diamonds': diamondsKing,
  'K_Hearts': heartsKing,
  'K_Spades': spadesKing,
  'A_Clubs': clubsAce,
  'A_Diamonds': diamondsAce,
  'A_Hearts': heartsAce,
  'A_Spades': spadesAce
}

export default {
  view: (vnode) => {
    return m('img', {
      src: getImagePath(cardMap[vnode.attrs.value]),
      style: { ...vnode.attrs.style }
    })
  }
} 
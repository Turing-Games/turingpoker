import m from "mithril";
import { getImagePath } from '../utils/string_utilities'
//TODO: rename all these files to something simpler and then use dynamic imports to get rid of this bs
// all card svgs
import clubs2 from '@public/images/cards/svg-cards/2_of_clubs.svg'
import diamonds2 from '@public/images/cards/svg-cards/2_of_diamonds.svg'
import hearts2 from '@public/images/cards/svg-cards/2_of_hearts.svg'
import spades2 from '@public/images/cards/svg-cards/2_of_spades.svg'
import clubs3 from '@public/images/cards/svg-cards/3_of_clubs.svg'
import diamonds3 from '@public/images/cards/svg-cards/3_of_diamonds.svg'
import hearts3 from '@public/images/cards/svg-cards/3_of_hearts.svg'
import spades3 from '@public/images/cards/svg-cards/3_of_spades.svg'
import clubs4 from '@public/images/cards/svg-cards/4_of_clubs.svg'
import diamonds4 from '@public/images/cards/svg-cards/4_of_diamonds.svg'
import hearts4 from '@public/images/cards/svg-cards/4_of_hearts.svg'
import spades4 from '@public/images/cards/svg-cards/4_of_spades.svg'
import clubs5 from '@public/images/cards/svg-cards/5_of_clubs.svg'
import diamonds5 from '@public/images/cards/svg-cards/5_of_diamonds.svg'
import hearts5 from '@public/images/cards/svg-cards/5_of_hearts.svg'
import spades5 from '@public/images/cards/svg-cards/5_of_spades.svg'
import clubs6 from '@public/images/cards/svg-cards/6_of_clubs.svg'
import diamonds6 from '@public/images/cards/svg-cards/6_of_diamonds.svg'
import hearts6 from '@public/images/cards/svg-cards/6_of_hearts.svg'
import spades6 from '@public/images/cards/svg-cards/6_of_spades.svg'
import clubs7 from '@public/images/cards/svg-cards/7_of_clubs.svg'
import diamonds7 from '@public/images/cards/svg-cards/7_of_diamonds.svg'
import hearts7 from '@public/images/cards/svg-cards/7_of_hearts.svg'
import spades7 from '@public/images/cards/svg-cards/7_of_spades.svg'
import clubs8 from '@public/images/cards/svg-cards/8_of_clubs.svg'
import diamonds8 from '@public/images/cards/svg-cards/8_of_diamonds.svg'
import hearts8 from '@public/images/cards/svg-cards/8_of_hearts.svg'
import spades8 from '@public/images/cards/svg-cards/8_of_spades.svg'
import clubs9 from '@public/images/cards/svg-cards/9_of_clubs.svg'
import diamonds9 from '@public/images/cards/svg-cards/9_of_diamonds.svg'
import hearts9 from '@public/images/cards/svg-cards/9_of_hearts.svg'
import spades9 from '@public/images/cards/svg-cards/9_of_spades.svg'
import clubs10 from '@public/images/cards/svg-cards/10_of_clubs.svg'
import diamonds10 from '@public/images/cards/svg-cards/10_of_diamonds.svg'
import hearts10 from '@public/images/cards/svg-cards/10_of_hearts.svg'
import spades10 from '@public/images/cards/svg-cards/10_of_spades.svg'
import clubsAce from '@public/images/cards/svg-cards/ace_of_clubs.svg'
import diamondsAce from '@public/images/cards/svg-cards/ace_of_diamonds.svg'
import heartsAce from '@public/images/cards/svg-cards/ace_of_hearts.svg'
import spadesAce from '@public/images/cards/svg-cards/ace_of_spades.svg'
import clubsJack from '@public/images/cards/svg-cards/jack_of_clubs.svg'
import diamondsJack from '@public/images/cards/svg-cards/jack_of_diamonds.svg'
import heartsJack from '@public/images/cards/svg-cards/jack_of_hearts.svg'
import spadesJack from '@public/images/cards/svg-cards/jack_of_spades.svg'
import clubsQueen from '@public/images/cards/svg-cards/queen_of_clubs.svg'
import diamondsQueen from '@public/images/cards/svg-cards/queen_of_diamonds.svg'
import heartsQueen from '@public/images/cards/svg-cards/queen_of_hearts.svg'
import spadesQueen from '@public/images/cards/svg-cards/queen_of_spades.svg'
import clubsKing from '@public/images/cards/svg-cards/king_of_clubs.svg'
import diamondsKing from '@public/images/cards/svg-cards/king_of_diamonds.svg'
import heartsKing from '@public/images/cards/svg-cards/king_of_hearts.svg'
import spadesKing from '@public/images/cards/svg-cards/king_of_spades.svg'
import cardBack from '@public/images/cards/turing-card-back.png'

const cardMap = {
  '2c': clubs2,
  '2d': diamonds2,
  '2h': hearts2,
  '2s': spades2,
  '3c': clubs3,
  '3d': diamonds3,
  '3h': hearts3,
  '3s': spades3,
  '4c': clubs4,
  '4d': diamonds4,
  '4h': hearts4,
  '4s': spades4,
  '5c': clubs5,
  '5d': diamonds5,
  '5h': hearts5,
  '5s': spades5,
  '6c': clubs6,
  '6d': diamonds6,
  '6h': hearts6,
  '6s': spades6,
  '7c': clubs7,
  '7d': diamonds7,
  '7h': hearts7,
  '7s': spades7,
  '8c': clubs8,
  '8d': diamonds8,
  '8h': hearts8,
  '8s': spades8,
  '9c': clubs9,
  '9d': diamonds9,
  '9h': hearts9,
  '9s': spades9,
  'Tc': clubs10,
  'Td': diamonds10,
  'Th': hearts10,
  'Ts': spades10,
  'Jc': clubsJack,
  'Jd': diamondsJack,
  'Jh': heartsJack,
  'Js': spadesJack,
  'Qc': clubsQueen,
  'Qd': diamondsQueen,
  'Qh': heartsQueen,
  'Qs': spadesQueen,
  'Kc': clubsKing,
  'Kd': diamondsKing,
  'Kh': heartsKing,
  'Ks': spadesKing,
  'Ac': clubsAce,
  'Ad': diamondsAce,
  'Ah': heartsAce,
  'As': spadesAce
};

export default {
  view: (vnode) => {
    return m('img', {
      src: getImagePath(cardMap[vnode.attrs.value]) || getImagePath(cardBack),
      style: { ...vnode.attrs.style },
      className: "Card"
    })
  }
} 
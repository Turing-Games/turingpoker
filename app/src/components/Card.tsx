// //TODO: rename all these files to something simpler and then use dynamic imports to get rid of this
// // all card svgs
import clubs2 from '@static/images/cards/svg-cards/2_of_clubs.svg'
import diamonds2 from '@static/images/cards/svg-cards/2_of_diamonds.svg'
import hearts2 from '@static/images/cards/svg-cards/2_of_hearts.svg'
import spades2 from '@static/images/cards/svg-cards/2_of_spades.svg'
import clubs3 from '@static/images/cards/svg-cards/3_of_clubs.svg'
import diamonds3 from '@static/images/cards/svg-cards/3_of_diamonds.svg'
import hearts3 from '@static/images/cards/svg-cards/3_of_hearts.svg'
import spades3 from '@static/images/cards/svg-cards/3_of_spades.svg'
import clubs4 from '@static/images/cards/svg-cards/4_of_clubs.svg'
import diamonds4 from '@static/images/cards/svg-cards/4_of_diamonds.svg'
import hearts4 from '@static/images/cards/svg-cards/4_of_hearts.svg'
import spades4 from '@static/images/cards/svg-cards/4_of_spades.svg'
import clubs5 from '@static/images/cards/svg-cards/5_of_clubs.svg'
import diamonds5 from '@static/images/cards/svg-cards/5_of_diamonds.svg'
import hearts5 from '@static/images/cards/svg-cards/5_of_hearts.svg'
import spades5 from '@static/images/cards/svg-cards/5_of_spades.svg'
import clubs6 from '@static/images/cards/svg-cards/6_of_clubs.svg'
import diamonds6 from '@static/images/cards/svg-cards/6_of_diamonds.svg'
import hearts6 from '@static/images/cards/svg-cards/6_of_hearts.svg'
import spades6 from '@static/images/cards/svg-cards/6_of_spades.svg'
import clubs7 from '@static/images/cards/svg-cards/7_of_clubs.svg'
import diamonds7 from '@static/images/cards/svg-cards/7_of_diamonds.svg'
import hearts7 from '@static/images/cards/svg-cards/7_of_hearts.svg'
import spades7 from '@static/images/cards/svg-cards/7_of_spades.svg'
import clubs8 from '@static/images/cards/svg-cards/8_of_clubs.svg'
import diamonds8 from '@static/images/cards/svg-cards/8_of_diamonds.svg'
import hearts8 from '@static/images/cards/svg-cards/8_of_hearts.svg'
import spades8 from '@static/images/cards/svg-cards/8_of_spades.svg'
import clubs9 from '@static/images/cards/svg-cards/9_of_clubs.svg'
import diamonds9 from '@static/images/cards/svg-cards/9_of_diamonds.svg'
import hearts9 from '@static/images/cards/svg-cards/9_of_hearts.svg'
import spades9 from '@static/images/cards/svg-cards/9_of_spades.svg'
import clubs10 from '@static/images/cards/svg-cards/10_of_clubs.svg'
import diamonds10 from '@static/images/cards/svg-cards/10_of_diamonds.svg'
import hearts10 from '@static/images/cards/svg-cards/10_of_hearts.svg'
import spades10 from '@static/images/cards/svg-cards/10_of_spades.svg'
import clubsAce from '@static/images/cards/svg-cards/ace_of_clubs.svg'
import diamondsAce from '@static/images/cards/svg-cards/ace_of_diamonds.svg'
import heartsAce from '@static/images/cards/svg-cards/ace_of_hearts.svg'
import spadesAce from '@static/images/cards/svg-cards/ace_of_spades.svg'
import clubsJack from '@static/images/cards/svg-cards/jack_of_clubs.svg'
import diamondsJack from '@static/images/cards/svg-cards/jack_of_diamonds.svg'
import heartsJack from '@static/images/cards/svg-cards/jack_of_hearts.svg'
import spadesJack from '@static/images/cards/svg-cards/jack_of_spades.svg'
import clubsQueen from '@static/images/cards/svg-cards/queen_of_clubs.svg'
import diamondsQueen from '@static/images/cards/svg-cards/queen_of_diamonds.svg'
import heartsQueen from '@static/images/cards/svg-cards/queen_of_hearts.svg'
import spadesQueen from '@static/images/cards/svg-cards/queen_of_spades.svg'
import clubsKing from '@static/images/cards/svg-cards/king_of_clubs.svg'
import diamondsKing from '@static/images/cards/svg-cards/king_of_diamonds.svg'
import heartsKing from '@static/images/cards/svg-cards/king_of_hearts.svg'
import spadesKing from '@static/images/cards/svg-cards/king_of_spades.svg'
import cardBack from '@static/images/cards/turing-card-back.png'

const cardMap = {
  'clubs_2': clubs2,
  'diamonds_2': diamonds2,
  'hearts_2': hearts2,
  'spades_2': spades2,
  'clubs_3': clubs3,
  'diamonds_3': diamonds3,
  'hearts_3': hearts3,
  'spades_3': spades3,
  'clubs_4': clubs4,
  'diamonds_4': diamonds4,
  'hearts_4': hearts4,
  'spades_4': spades4,
  'clubs_5': clubs5,
  'diamonds_5': diamonds5,
  'hearts_5': hearts5,
  'spades_5': spades5,
  'clubs_6': clubs6,
  'diamonds_6': diamonds6,
  'hearts_6': hearts6,
  'spades_6': spades6,
  'clubs_7': clubs7,
  'diamonds_7': diamonds7,
  'hearts_7': hearts7,
  'spades_7': spades7,
  'clubs_8': clubs8,
  'diamonds_8': diamonds8,
  'hearts_8': hearts8,
  'spades_8': spades8,
  'clubs_9': clubs9,
  'diamonds_9': diamonds9,
  'hearts_9': hearts9,
  'spades_9': spades9,
  'clubs_10': clubs10,
  'diamonds_10': diamonds10,
  'hearts_10': hearts10,
  'spades_10': spades10,
  'clubs_11': clubsJack,
  'diamonds_11': diamondsJack,
  'hearts_11': heartsJack,
  'spades_11': spadesJack,
  'clubs_12': clubsQueen,
  'diamonds_12': diamondsQueen,
  'hearts_12': heartsQueen,
  'spades_12': spadesQueen,
  'clubs_13': clubsKing,
  'diamonds_13': diamondsKing,
  'hearts_13': heartsKing,
  'spades_13': spadesKing,
  'clubs_1': clubsAce,
  'diamonds_1': diamondsAce,
  'hearts_1': heartsAce,
  'spades_1': spadesAce
};

function Card(props) {

  const { value, style } = props;

  return (
    <img
      // src={cardMap[value] || cardBack}
      alt={`Card ${value}`}
      style={{ ...style }}
      className={"card"}
    />
  );
}

export default Card;
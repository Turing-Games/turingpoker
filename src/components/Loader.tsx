import React from "react";
import { getImagePath } from '../utils/string_utilities';
import cardBack from '@public/images/cards/turing-card-back.png';

function CardLoader({ style }: any) {
  return (
    <div className="tg-poker__card-loader" style={style}>
      <img src={getImagePath(cardBack)} alt="Card Back" />
      <img src={getImagePath(cardBack)} alt="Card Back" style={{ animationDelay: '0.3s' }} />
      <img src={getImagePath(cardBack)} alt="Card Back" style={{ animationDelay: '0.6s' }} />
    </div>
  );
}

export default CardLoader;

import React from 'react';
function CardLoader({ style }: any) {
  return (
    <div className="tg-poker__card-loader" style={style}>
      <img src={'../../static/images/cards/turing-card-back.png'} alt="Card Back" />
      <img src={'../../static/images/cards/turing-card-back.png'} alt="Card Back" style={{ animationDelay: '0.3s' }} />
      <img src={'../../static/images/cards/turing-card-back.png'} alt="Card Back" style={{ animationDelay: '0.6s' }} />
    </div>
  );
}

export default CardLoader;

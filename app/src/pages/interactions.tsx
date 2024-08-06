import * as React from 'react'
import Main from '@app/layouts/main';
import Card from '@static/images/cards/turing-card-back.png';


export default function Interactions() {

  return (
    <Main pageTitle='Leaderboard'>
      {/* cards */}
      <div className="anim-card-container relative m-[40px]">
        {
          Array(5).fill(0).map((_, i) => {
            return <img src={Card} className={`anim-card anim-card-${i} absolute top-0 left-0 w-[100px]`} />
          })
        }
      </div>
      <style>{`
        #root{overflow:auto!important}
      `}
        {
          Array(5).fill(0).map((_, i) => {
            return `
            .anim-card-container:hover .anim-card-${i}{
              animation: anim-card-${i} ${i * 1}s infinite alternate;
            }
            @keyframes anim-card-${i} {
              0% {
                transform: rotate(${i * 10}deg);
              }
              100% {
                transform: rotate(${i * 10}deg);
              }
            }
          `
          })
        }
      </style>
    </Main >
  )
}

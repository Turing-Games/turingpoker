import m from "mithril";
import { getImagePath } from '../utils/string_utilities'
import cardBack from '@public/images/cards/turing-card-back.png'

export default {
  view: (vnode) => {
    return m("div.tg-poker__card-loader", { style: { ...vnode.attrs.style } }, [
      m('img', {
        src: getImagePath(cardBack),
      }),
      m('img', {
        src: getImagePath(cardBack),
        style: {
          animationDelay: '0.3s'
        }
      }),
      m('img', {
        src: getImagePath(cardBack),
        style: {
          animationDelay: '0.6s'
        }
      }),
    ]
    )
  }
} 
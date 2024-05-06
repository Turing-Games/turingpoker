import m from "mithril";
import Logo from '../../public/images/logo.png'
import { getImagePath } from '../utils/string_utilities'

export default {
  view: (vnode) => {
    return m("div", {
      class: "tg-header",
    }, [
      m("div", {
        class: 'tg-header__logo',
        style: { left: '12px' }
      },
        m('img', {
          src: getImagePath(Logo),
        })
      ),
      // text
      m('div.tg-header__title', [
        m('h2', `Table: ${vnode.attrs.gameType}`),
        m('p', "Turing Games")
      ]),
      m("div", {
        class: 'tg-header__logo',
        style: { right: '12px' }
      },
        m('img', {
          src: getImagePath(Logo)
        })
      ),
      ...Array(4).fill('_').map((el, i) => {
        return (
          m("div", {
            class: `tg-header__squares tg-header__squares--${i}`
          })
        )
      })
    ]
    )
  }
} 
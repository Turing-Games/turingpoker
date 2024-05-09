import m from "mithril";
import Logo from '@public/images/logo.png'
import { getImagePath } from '../utils/string_utilities'
import loader from "./loader";

export default {
  view: (vnode) => {

    const players = vnode.attrs.players

    return m("div", {
      style: {
        margin: 'auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }
    }, [
      m("div", {
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
          m('h2', vnode.attrs.gameType ? `Table: ${vnode.attrs.gameType}` : 'Welcome!'),
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
      ),
      players?.length < 2 &&
      m("div", [
        m(loader, { style: { margin: '24px 0' } }),
        m("p", "Waiting for players to join...")
      ])
    ])
  }
} 
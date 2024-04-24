import Logo from '../../public/images/logo.png'
import { getImagePath } from '../utils/string_utilities'

export default {
  view: (vnode) => {
    return m("div", {
      class: "tg__header",
    }, [
      m("div", {
        class: 'tg__logo'
      },
        m('img', {
          src: getImagePath(Logo)
        })
      ),
      ...Array(4).fill('_').map((el, i) => {
        return (
          m("div", {
            class: `tg__header__squares tg__header__squares--${i}`
          })
        )
      })
    ]
    )
  }
} 
import Logo from '../../public/images/logo.png'

export default {
  view: (vnode) => {
    return m("div", {
      class: "tg__header",
    }, [
      m("div", {
        class: 'tg__logo'
      },
        m('img', {
          src: Logo
        })
      )
    ]
    )
  }
} 
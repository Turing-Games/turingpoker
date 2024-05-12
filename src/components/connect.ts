import m from "mithril";
// component to allow players to connect to game by game id or spectate
export default {
  view: ({ attrs }) => {
    const gameState = attrs.gameState;

    return m("div", {
      style: {
        display: 'flex',
        gap: '8px',
        justifyContent: 'center',
        marginTop: '48px',
        width: '100%'
      }
    }, [
      m("button", {
        onclick: () => gameState.sendAction("join")
      }, "Play"),
      m("button", {
        onclick: () => gameState.sendAction("spectate")
      }, "Spectate")
    ])

  }
} 
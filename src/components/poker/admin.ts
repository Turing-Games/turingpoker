import m from "mithril";

export default {
  oninit: async () => {
    const res = await fetch(`/parties/main/turing-games-poker`);
  },
  view: ({ attrs }) => {
    return m(`div`, "admin")
  }
} 
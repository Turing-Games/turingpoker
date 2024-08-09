export const games = {

  get: async (c) => {
    const usrStmt = c.env.DB.prepare('SELECT * from games;')
    try {
      const { results } = await usrStmt.all()
      return c.json(results);
    } catch (e) {
      return c.json({ message: JSON.stringify(e) }, 500);
    }
  },
  create: async (c) => {
    const params = await c.req.json()
    const usrStmt = c.env.DB.prepare('INSERT into games (id, name, autostart, minPlayers, maxPlayers, tournament_id) VALUES (?, ?, ?, ?, ?) ').bind(id, name, autostart, minPlayers, maxPlayers, tournamentId)

    return c.json()
  }
}
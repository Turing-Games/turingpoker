export const games = {

  get: async (c) => {
    let usrStmt = c.env.DB.prepare('SELECT * from users WHERE clerk_id = ?').bind(c.req.param('id'))
    try {
      const { results } = await usrStmt.all()
      return c.json({ data: results[0] });
    } catch (e) {
      return c.json({ message: JSON.stringify(e) }, 500);
    }
  },
  create: async (c) => {
    const params = await c.req.json()
    let usrStmt = c.env.DB.prepare('INSERT into games (id, name, autostart, minPlayers, maxPlayers, tournament_id) VALUES (?, ?, ?, ?, ?) ').bind(id, name, autostart, minPlayers, maxPlayers, tournamentId)

    return c.json()
  }
}
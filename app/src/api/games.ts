export const games = {
  get: async (c) => {
    const tournamentId = c.req.query('tournament_id')
    let sql = 'SELECT * from games'
    if (tournamentId) {
      sql += ' WHERE tournament_id = ?'
    }

    let gameStmt = c.env.DB.prepare(sql).bind(tournamentId)

    try {
      const { results } = await gameStmt.all()
      return c.json(results);
    } catch (e) {
      console.log(e)
      return c.json({ message: JSON.stringify(e) }, 500);
    }
  },
  create: async (c) => {
    const params = await c.req.json()
    const usrStmt = c.env.DB.prepare('INSERT into games (id, name, autostart, minPlayers, maxPlayers, tournament_id) VALUES (?, ?, ?, ?, ?) ').bind(id, name, autostart, minPlayers, maxPlayers, tournamentId)

    return c.json()
  }
}
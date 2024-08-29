export const games = {
  get: async (c) => {
    const queryParams = c.req.query()
    console.log(queryParams)
    const id = c.req.param('id')
    let sql = 'SELECT * from games join game_configs on games.id = game_configs.game_id'

    if (id) {
      sql += ' WHERE id = ? '
    }


    let gameStmt = c.env.DB.prepare(sql)
    if (id) {
      gameStmt = gameStmt.bind(id)
    }

    try {
      const { results } = await gameStmt.all()
      if (id) {
        return c.json(results[0]);
      } else {
        return c.json(results);
      }
    } catch (e) {
      console.log(e)
      return c.json({ message: JSON.stringify(e) }, 500);
    }
  },
  create: async (c) => {
    const {
      title,
      tournamentId,
      gameType,
      minPlayers,
      maxPlayers
    } = await c.req.json()
    const gameId = crypto.randomUUID()
    const gameConfigId = crypto.randomUUID()
    const gameStmt = c.env.DB.prepare(`
      INSERT into games (id, title, tournament_id, game_type) VALUES (?, ?, ?, ?) `)
      .bind(gameId, title, tournamentId, gameType)
    try {
      const { results } = await gameStmt.run()
      const gameConfigStmt = c.env.DB.prepare(`
        INSERT into game_configs (id, game_id, auto_start, min_players, max_players) VALUES (?, ?, ?, ?)`)
        .bind(gameConfigId, gameId, minPlayers, maxPlayers)
      await gameConfigStmt.run()
      return c.json(results);
    } catch (e) {
      return c.json({ message: JSON.stringify(e) }, 500);
    }
  },
  update: async (c) => {
    const id = c.req.param('id')
    const { winnerId } = await c.req.json()
    const gameStmt = c.env.DB.prepare('UPDATE games SET winner_id = ? WHERE id = ?').bind(winnerId, id)
    try {
      const { results } = await gameStmt.run()
      return c.json(results);
    } catch (e) {
      return c.json({ message: JSON.stringify(e) }, 500);
    }
  }
}
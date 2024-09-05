export const games = {
  get: async (c) => {
    const queryParams = c.req.query()
    const id = c.req.param('id')
    let sql = 'SELECT * from games join game_configs on games.id = game_configs.game_id'

    if (id) {
      sql += ' WHERE games.id = ? '
      if (queryParams.gameType) {
        sql += ' AND game_type = ? '
      }
    } else {
      if (queryParams.gameType) {
        sql += ' WHERE game_type = ? '
      }
    }


    let gameStmt = c.env.DB.prepare(sql)
    if (id) {
      if (queryParams.gameType) {
        gameStmt = gameStmt.bind(id, queryParams.gameType)
      } else {
        gameStmt = gameStmt.bind(id)
      }
    } else {
      if (queryParams.gameType) {
        gameStmt = gameStmt.bind(queryParams.gameType)
      }
    }

    try {
      const { results } = await gameStmt.all()
      if (id) {
        return c.json(results ? results[0] : {});
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
      id = '',
      title = '',
      tournamentId = null,
      gameType,
      minPlayers,
      maxPlayers,
      autoStart
    } = await c.req.json()
    const gameId = id || crypto.randomUUID()
    const gameConfigId = crypto.randomUUID()

    const gameStmt = c.env.DB.prepare(`
      INSERT into games (id, title, tournament_id, game_type) VALUES (?, ?, ?, ?) `)
      .bind(gameId, title, tournamentId, gameType)

    try {
      const { results } = await gameStmt.run()
      const gameConfigStmt = c.env.DB.prepare(`
        INSERT into game_configs (id, game_id, auto_start, min_players, max_players) VALUES (?, ?, ?, ?, ?)`)
        .bind(gameConfigId, gameId, autoStart, minPlayers, maxPlayers)
      await gameConfigStmt.run()
      return c.json(results);
    } catch (e) {
      console.log(e)
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
  },
  delete: async (c) => {
    const id = c.req.param('id')
    const gameStmt = c.env.DB.prepare('DELETE FROM games WHERE id = ?').bind(id)
    try {
      const { results } = await gameStmt.run()

      // pk test
      // await fetch(`${PARTYKIT_URL}/parties/${gameType}/${gameId}`, {
      //   method: "DELETE",
      //   body: JSON.stringify({
      //     action: "delete",
      //     id: gameId
      //   })
      // })
      return c.json(results);
    } catch (e) {
      return c.json({ message: JSON.stringify(e) }, 500);
    }
  },
  // partykit proxy routes
  pk: {
    get: async (c) => {

    }
  }
}
const configureGames = () => {

}

const generateGames = (c, tournament_id: string, gameType = '', size = 2) => {
  return new Promise(async (resolve, reject) => {
    const gameIds = Array(size).fill('_').map(() => crypto.randomUUID())
    try {
      const gameStmt = c.env.DB.prepare(`
        INSERT INTO games (id, tournament_id, game_type)
        VALUES ${gameIds.map((id) => `('${id}', '${tournament_id}', '${gameType}')`).join(',')}`)
      await gameStmt.run()
      resolve(true)
    } catch (e) {
      reject(e)
    }
  })
}

export const tournaments = {
  get: async (c) => {
    const withConfig = c.req.query('withConfig')
    const gameType = c.req.query('gameType')
    let statement = 'SELECT * from tournaments'
    if (withConfig) {
      statement += ' JOIN tournament_configs on tournaments.id = tournament_configs.tournament_id'
    }
    if (gameType) {
      statement += ' WHERE game_type = ?;'
    }
    let usrStmt = c.env.DB.prepare(statement)
    if (gameType) {
      usrStmt = usrStmt.bind(gameType)
    }
    try {
      const { results } = await usrStmt.all()
      return c.json(results);
    } catch (e) {
      return c.json({ message: JSON.stringify(e) }, 500);
    }
  },
  create: async (c) => {
    try {
      const { title = '', config, gameType = '' } = await c.req.json()
      const tournamentConfigId = crypto.randomUUID()
      const tournamentId = crypto.randomUUID()

      const configOptionLength = Object.keys(config).length
      const configValuesPlaceholders = configOptionLength > 0 ? `${Array(configOptionLength).fill('?').join(',')}` : ''
      const configValueColumns = configOptionLength > 0 ? `${Object.keys(config).join(',')}` : ''
      const configValues = configOptionLength > 0 ? Object.values(config) : []

      let tournamentStmt = c.env.DB.prepare('INSERT into tournaments (id, title, game_type) VALUES (?, ?, ?) ').bind(tournamentId, title, gameType)
      let configStmt = c.env.DB.prepare(`INSERT into tournament_configs (id, tournament_id, ${configValueColumns}) VALUES (?, ?, ${configValuesPlaceholders}) `).bind(tournamentConfigId, tournamentId, ...configValues)
      await tournamentStmt.run()
      await configStmt.run()

      await generateGames(c, tournamentId, gameType, config.size)
      return c.json()
    } catch (e) {
      console.log(e)
      return c.json({ message: 'Error creating tournament', error: e }, 500);
    }
  },
  delete: async (c) => {
    const id = c.req.param('id')
    try {
      let gameStmt = c.env.DB.prepare('DELETE from games where tournament_id = ? ').bind(id)
      let configStmt = c.env.DB.prepare('DELETE from tournament_configs where tournament_id = ? ').bind(id)
      let tournamentStmt = c.env.DB.prepare('DELETE from tournaments where id = ? ').bind(id)
      await configStmt.all();
      await gameStmt.all()
      await tournamentStmt.all()
      return c.json({ message: 'Tournament deleted' }, 200);
    } catch (e) {
      return c.json({ message: JSON.stringify(e) }, 500);
    }
  }
}
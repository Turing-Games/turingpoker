// Tournament tables will default to min of 2 players, max of 8, auto start is false
const generateTournamentGames = async (c, tournamentId: string, gameType = '', config: any, size: number) => {
  console.log(config)
  // game config
  const gameConfigOptionLength = Object.keys(config).length
  const gameConfigValuesPlaceholders = gameConfigOptionLength > 0 ? `${Array(gameConfigOptionLength).fill('?').join(',')}` : ''
  const gameConfigValueColumns = gameConfigOptionLength > 0 ? `${Object.keys(config).join(',')}` : ''
  const gameConfigValues = gameConfigOptionLength > 0 ? Object.values(config) : []

  return new Promise(async (resolve, reject) => {
    try {
      // create # of games based on size
      const gameIds = Array(size).fill('_').map(() => crypto.randomUUID())
      const gameStmt = c.env.DB.prepare("INSERT INTO games (id, tournament_id, game_type) VALUES (?, ?, ?)")
      const gameBatch = gameIds.map((id) => gameStmt.bind(id, tournamentId, gameType))
      const games = await c.env.DB.batch(gameBatch)
      console.log({ games })

      // create one config for each game)
      const gameConfigIds = Array(size).fill('_').map(() => crypto.randomUUID())
      const gameConfigStmt = c.env.DB.prepare(`INSERT INTO game_configs (id, game_id, ${gameConfigValueColumns}) VALUES (?, ?, ${gameConfigValuesPlaceholders})`)
      const configBatch = gameIds.map((id, i) => gameConfigStmt.bind(gameConfigIds[i], id, ...gameConfigValues))
      await c.env.DB.batch(configBatch)

      resolve(true)
    } catch (e) {
      reject(e)
    }
  })
}

export const tournaments = {
  get: async (c) => {
    const id = c.req.param('id')
    const relations = c.req.query('populate')?.split(',')
    const gameType = c.req.query('gameType')
    let statement = 'SELECT tournaments.*, COUNT(games.id) AS games_count FROM tournaments LEFT JOIN games ON games.tournament_id = tournaments.id'
    if (relations?.length > 0) {
      for (const relation of relations) {
        statement += ` LEFT JOIN ${relation} ON tournaments.id = ${relation}.tournament_id`
      }
    }
    if (id) {
      statement += ' WHERE tournaments.id = ?'
    }

    if (gameType) {
      statement += ' WHERE game_type = ?'
    }
    statement += ' GROUP BY tournaments.id;'
    let usrStmt = c.env.DB.prepare(statement)
    if (id) {
      usrStmt = usrStmt.bind(id)
    }
    if (gameType) {
      usrStmt = usrStmt.bind(gameType)
    }
    try {
      const { results } = await usrStmt.all()
      let games = []
      if (id) {
        const { results } = await c.env.DB.prepare('SELECT * from games where tournament_id = ?').bind(id).all()
        games = results
      }
      return c.json({
        tournaments: id ? results[0] : results,
        games: id ? games : []
      });
    } catch (e) {
      console.log(e)
      return c.json({ message: JSON.stringify(e) }, 500);
    }
  },
  create: async (c) => {
    try {
      const { title = '', gameConfig, tournamentConfig, gameType = '' } = await c.req.json()
      const tournamentConfigId = crypto.randomUUID()
      const tournamentId = crypto.randomUUID()
      // tournament config
      const tournamentConfigOptionLength = Object.keys(tournamentConfig).length
      const tournamentConfigValuesPlaceholders = tournamentConfigOptionLength > 0 ? `${Array(tournamentConfigOptionLength).fill('?').join(',')} ` : ''
      const tournamentConfigValueColumns = tournamentConfigOptionLength > 0 ? `${Object.keys(tournamentConfig).join(',')} ` : ''
      const tournamentConfigValues = tournamentConfigOptionLength > 0 ? Object.values(tournamentConfig) : []

      // insert tournament and tournament config
      const tournamentStmt = c.env.DB.prepare('INSERT into tournaments (id, title, game_type) VALUES (?, ?, ?) ').bind(tournamentId, title, gameType)
      const tournamentConfigStmt = c.env.DB.prepare(`INSERT into tournament_configs(id, tournament_id, ${tournamentConfigValueColumns}) VALUES(?, ?, ${tournamentConfigValuesPlaceholders})`)
        .bind(tournamentConfigId, tournamentId, ...tournamentConfigValues)
      await tournamentStmt.run()
      await tournamentConfigStmt.run()

      console.log(gameConfig)
      console.log(tournamentConfig)
      await generateTournamentGames(c, tournamentId, gameType, gameConfig, parseInt(tournamentConfig.size))
      return c.json()
    } catch (e) {
      console.log(e)
      return c.json({ message: 'Error creating tournament', error: e }, 500);
    }
  },
  delete: async (c) => {
    const id = c.req.param('id')
    try {
      const gameStmt = c.env.DB.prepare('DELETE from games where tournament_id = ? ').bind(id)
      const configStmt = c.env.DB.prepare('DELETE from tournament_configs where tournament_id = ? ').bind(id)
      const tournamentStmt = c.env.DB.prepare('DELETE from tournaments where id = ? ').bind(id)
      await configStmt.all();
      await gameStmt.all()
      await tournamentStmt.all()
      return c.json({ message: 'Tournament deleted' }, 200);
    } catch (e) {
      return c.json({ message: JSON.stringify(e) }, 500);
    }
  }
}
const configureGames = () => {

}

export const tournaments = {
  get: async (c) => {
    // const { withConfig } = await c.req.query
    const withConfig = c.req.query('withConfig')
    console.log(withConfig)
    const statement = withConfig ? 'SELECT * from tournaments JOIN tournament_configs ON tournaments.tournament_config_id = tournament_configs.id;' : 'SELECT * from tournaments;'
    let usrStmt = c.env.DB.prepare(statement)
    try {
      const { results } = await usrStmt.all()
      return c.json(results);
    } catch (e) {
      return c.json({ message: JSON.stringify(e) }, 500);
    }
  },
  create: async (c) => {
    try {
      const { title = '', config } = await c.req.json()
      const tournamentConfigId = crypto.randomUUID()
      const tournamentId = crypto.randomUUID()
      const configOptionLength = Object.keys(config).length

      const configValuesPlaceholders = configOptionLength > 0 ? `, ${Array(configOptionLength).fill('?').join(',')}` : ''
      const configValueColumns = configOptionLength > 0 ? `, ${Object.keys(config).join(',')}` : ''
      const configValues = configOptionLength > 0 ? Object.values(config) : []
      let configStmt = c.env.DB.prepare(`INSERT into tournament_configs (id ${configValueColumns}) VALUES (? ${configValuesPlaceholders}) `).bind(tournamentConfigId, ...configValues)
      let tournamentStmt = c.env.DB.prepare('INSERT into tournaments (id, title, tournament_config_id) VALUES (?, ?, ?) ').bind(tournamentId, title, tournamentConfigId)
      await configStmt.run()
      await tournamentStmt.run()
      return c.json()
    } catch (e) {
      console.log(e)
      return c.json({ message: 'Error creating tournament', error: e }, 500);
    }
  }
}
export const users = {
  get: async (c) => {
    const id = c.req.param('id')
    let sqlStmt = 'SELECT * from users'
    if (id) {
      sqlStmt += ' WHERE clerk_id = ? '
    }
    let usrStmt = c.env.DB.prepare(sqlStmt)
    if (id) {
      usrStmt = usrStmt.bind(id)
    }

    try {
      const { results } = await usrStmt.all()
      const users = id ? results[0] : results
      if (results.length > 0) {
        return c.json(users);
      } else {
        return c.json({ message: 'User not found' }, 404);
      }
    } catch (e) {
      return c.json({ message: JSON.stringify(e) }, 500);
    }
  },
  delete: async (c) => {
    const id = c.req.param('id')
    let usrStmt = c.env.DB.prepare('DELETE from users where clerk_id = ?').bind(id)
    try {
      const { results } = await usrStmt.run()
      return c.json(results);
    } catch (e) {
      return c.json({ message: JSON.stringify(e) }, 500
      );
    }
  },
  getKeys: async (c) => {
    const id = c.req.param('id')
    let usrStmt = c.env.DB.prepare('SELECT * from api_keys where user_id = ? ').bind(id)
    try {
      const { results } = await usrStmt.all()
      return c.json(results);
    } catch (e) {
      return c.json({ message: JSON.stringify(e) }, 500);
    }
  },
}
export const users = {
  get: async (c) => {
    let usrStmt = c.env.DB.prepare('SELECT * from users WHERE clerk_id = ?').bind(c.req.param('id'))
    try {
      const { results } = await usrStmt.all()
      return c.json({ data: results[0] });
    } catch (e) {
      return c.json({ message: JSON.stringify(e) }, 500);
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
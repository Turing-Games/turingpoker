
export const clerk = {
  create: async (c) => {
    const uuid = crypto.randomUUID()
    const clerkUser = await c.req.json()
    try {
      let { results } = await c.env.DB.prepare(
        'INSERT into users (id, clerk_id) VALUES (?, ?)'
      )
        .bind(`${uuid}`, clerkUser.data?.id)
        .all();
      return c.json(results);
    } catch (e) {
      return c.json({ message: 'Error signing up', error: e }, 500);
    }
  }
}
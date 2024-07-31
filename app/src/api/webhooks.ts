const buildDbQuery = (c: any, event = '', data = {}) => {
  const events = {
    'user.created': async () => {
      const uuid = crypto.randomUUID()
      return new Promise(async (resolve, reject) => {
        try {
          let { results } = await c.env.DB.prepare(
            'INSERT into users (id, clerk_id, username, profile_image_url) VALUES (?, ?, ?, ?)'
          )
            .bind(`${uuid}`, data?.data?.id, data?.data?.username, data?.data?.profile_image_url)
            .all();
          resolve(results);
        } catch (e) {
          reject({ message: `Error: ${data.type}`, error: e });
        }
      })
    },
    'user.updated': async () => {
      return new Promise(async (resolve, reject) => {
        try {
          let { results } = await c.env.DB.prepare(
            'UPDATE users SET username = ?, profile_image_url = ? WHERE clerk_id = ?'
          )
            .bind(data?.data?.username, data?.data?.profile_image_url, data?.data?.id)
            .all();
          resolve(results);
        } catch (e) {
          reject({ message: `Error: ${data.type}`, error: e });
        }
      })
    }
  }

  return new Promise(async (resolve, reject) => {
    try {
      const results = await events[event]()
      resolve(results);
    } catch (e) {
      reject(e);
    }
  });
}

export const webhooks = {
  clerk: {
    user: async (c) => {
      const clerkData = await c.req.json()
      try {
        const results = await buildDbQuery(c, clerkData.type, clerkData)
        return c.json(results);
      } catch (e) {
        console.log(e)
        return c.json({ message: `Error: ${clerkData.type}`, error: e }, 500);
      }
    }
  }
}
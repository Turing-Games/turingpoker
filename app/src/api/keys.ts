import { createHash } from 'node:crypto';
import { decode, sign, verify } from 'hono/jwt'
import { HTTPException } from 'hono/http-exception'

const verifyApiKey = (key: string, hash: string) => {
  const hashedKey = createHash('sha256')
  hashedKey.update(key)
  return hashedKey.digest('hex') === hash
}

export const keys = {
  update: async (c) => {
    const { key, name, viewed } = await c.req.json()
    let keyToSave = key
    const id = c.req.param('id')

    if (key.startsWith('turing')) {
      const hash = createHash('sha256')
      hash.update(key)
      keyToSave = hash.digest('hex')
    }

    try {
      const { results } = await c.env.DB.prepare(
        'UPDATE api_keys SET key = ?, name = ?, viewed = ? where id = ?'
      )
        .bind(keyToSave, name, viewed, id)
        .all()
      return c.json(results);
    } catch (e) {
      console.log(e)
      return c.json({ message: 'Error updating key', error: e }, 500);
    }
  },
  delete: async (c) => {
    const id = c.req.param('id')
    const usrStmt = c.env.DB.prepare('DELETE from api_keys where id = ? ').bind(id)
    try {
      const { results } = await usrStmt.all()
      return c.json(results);
    } catch (e) {
      return c.json({ message: JSON.stringify(e) }, 500);
    }
  },
  create: async (c) => {
    const { userId = null, botId = null, name = '' } = await c.req.json()
    try {
      // generate key
      const uuid = crypto.randomUUID()
      const key = `turing_${crypto.randomUUID()}`

      const payload = {
        id: uuid,
        key,
        role: 'bot'
      }

      const token = await sign(payload, c.env.BOT_SECRET_KEY)


      const { results } = await c.env.DB.prepare(
        'INSERT into api_keys (id, user_id, bot_id, name, key) VALUES (?, ?, ?, ?, ?)'
      )
        .bind(uuid, userId, botId, name, token)
        .all()
      return c.json(results);
    } catch (e) {
      console.log(e)
      return c.json({ message: 'Error creating key', error: e }, 500);
    }
  },
  verify: async (c) => {
    const bearerToken = c.req.header('Authorization')
    const token = bearerToken?.split(' ')[1]
    try {
      await verify(token, c.env.BOT_SECRET_KEY)
      return c.json({})
    } catch (e) {
      throw new HTTPException(401, { message: 'Unauthorized' })
    }
  },
  get: async (c) => {
    const id = c.req.param('id')
    let usrStmt = c.env.DB.prepare('SELECT * from api_keys')
    if (id) {
      usrStmt = usrStmt.bind(id)
    }
    try {
      const { results } = await usrStmt.all()
      return c.json(results);
    } catch (e) {
      return c.json({ message: JSON.stringify(e) }, 500);
    }
  }
}
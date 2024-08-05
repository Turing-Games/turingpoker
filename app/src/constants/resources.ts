import { games } from "@app/api/games"
import { users } from "@app/api/users"

export const RESOURCES = [
  { label: 'API Keys', value: 'keys' },
  { label: 'Tournaments', value: 'tournaments' },
  { label: 'Users', value: 'users' },
  { label: 'Games', value: 'games' },
  { label: 'Bots', value: 'bots' },
]

export const RESOURCE_ATTRIBUTES = {
  keys: ['id', 'user_id', 'created_at'],
  tournaments: ['id', 'title', 'created_at'],
  users: ['id', 'username', 'created_at'],
  games: ['id', 'title', 'party', 'room', 'created_at']
}
export default async function queryClient(resource = '', method = '', query = {}) {
  try {
    if (['GET', 'DELETE'].includes(method)) {
      const res = await fetch(`/api/v1/${resource}`, { method })
      return await res.json()
    } else {
      const res = await fetch(`/api/v1/${resource}`, {
        method,
        body: JSON.stringify(query)
      })
      return await res.json()
    }
  } catch (err) {
    console.log(err)
  }
}
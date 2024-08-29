export function buildUrl(path: string, params: any) {
  const pathWithParams = path + urlFilters(params)
  return pathWithParams
}

export function urlFilters(params: any) {
  return `?filters=${new URLSearchParams(deleteFalseyValues(params)).toString()}`
}

export function deleteFalseyValues(obj: any) {
  return Object.keys(obj).reduce((acc: any, key) => {
    if (obj[key]) {
      acc[key] = obj[key]
    }
    return acc
  }, {})
}
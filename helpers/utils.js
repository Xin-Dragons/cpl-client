export function hashify(url) {
  return `${url}?hash=${parseInt(Math.random() * 100000000)}`
}
export function getImagePath(image = '') {
  return image.replace('./', 'dist/')
}
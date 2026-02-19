export const avatarNames = ['лиса', 'ёж', 'заяц', 'медведь', 'сова', 'волк']

export const avatarImages = [
  '/assets/images/fox.png',
  '/assets/images/hedgehog.png',
  '/assets/images/hare.png',
  '/assets/images/bear.png',
  '/assets/images/owl.png',
  '/assets/images/wolf.png'
]

export function getAvatarIndex(userAvatar: number | string | undefined): number {
  if (typeof userAvatar === 'number') {
    return Math.max(0, Math.min(avatarImages.length - 1, userAvatar))
  }
  return 0
}
import fox from '../assets/images/fox.png'
import hedgehog from '../assets/images/hedgehog.png'
import hare from '../assets/images/hare.png'
import bear from '../assets/images/bear.png'
import owl from '../assets/images/owl.png'
import wolf from '../assets/images/wolf.png'

export const avatarNames = ['лиса', 'ёж', 'заяц', 'медведь', 'сова', 'волк']

// Use bundler-managed asset URLs so they work in production (Cloudflare Pages/Vite).
export const avatarImages = [
  fox,
  hedgehog,
  hare,
  bear,
  owl,
  wolf,
]

export function getAvatarIndex(userAvatar: number | string | undefined): number {
  if (typeof userAvatar === 'number') {
    return Math.max(0, Math.min(avatarImages.length - 1, userAvatar))
  }
  return 0
}
import type { User } from './storage'

const GOOGLE_NAMES = [
  'Cluck McPigeon',
  'Feather Account',
  'Beak McSass',
  'Pigeon Prime',
  'Sir Email III'
]

const APPLE_NAMES = [
  'Core Pigeon',
  'iFeather',
  'macPigeon',
  'PigeonOS User',
  'Sir TouchID III'
]

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

export function getMockUser(provider: 'google' | 'apple'): User {
  const idSuffix = Math.random().toString(36).slice(2, 10).toUpperCase()
  if (provider === 'apple') {
    const name = randomFrom(APPLE_NAMES)
    return {
      id: `apple_${idSuffix}`,
      name,
      email: `${name.toLowerCase().replace(/\s+/g, '.')}.${idSuffix.toLowerCase()}@icloud.com`,
      provider: 'apple'
    }
  }
  const name = randomFrom(GOOGLE_NAMES)
  return {
    id: `google_${idSuffix}`,
    name,
    email: `${name.toLowerCase().replace(/\s+/g, '.')}.${idSuffix.toLowerCase()}@gmail.com`,
    provider: 'google'
  }
}

export async function signInWithGoogle(): Promise<User> {
  // Mocked out for the satirical demo — never hits a real provider.
  await new Promise((resolve) => window.setTimeout(resolve, 260))
  return getMockUser('google')
}

export async function signInWithApple(): Promise<User> {
  // Mocked out for the satirical demo — never hits a real provider.
  await new Promise((resolve) => window.setTimeout(resolve, 260))
  return getMockUser('apple')
}

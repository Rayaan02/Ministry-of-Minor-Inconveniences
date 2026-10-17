export type QuestStatus = 'available' | 'active' | 'completed' | 'claimed'

export interface Quest {
  id: string
  title: string
  description: string
  reward: string
  objective: string
}

export const QUESTS: Quest[] = [
  {
    id: 'missing-sock',
    title: 'The Case of the Missing Left Sock',
    description: 'A distressed citizen reports their left sock has vanished without a trace from the laundry.',
    reward: 'An Official Sock Reconciliation Certificate',
    objective: 'Speak to the citizen near the Main Street and gather clues.'
  },
  {
    id: 'teabag-tragedy',
    title: 'Teabag Tragedy Advisory',
    description: 'A biscuit has been submerged in tea far earlier than protocol allows. This is a Code Biscuit emergency.',
    reward: 'One (1) Complimentary Dry Biscuit',
    objective: 'Investigate the tavern vicinity for soggy crumbs.'
  },
  {
    id: 'pigeon-patrol',
    title: 'Pigeon Patrol Duty',
    description: 'The Minister has authorized a very important patrol to ensure peak loafing conditions throughout the square.',
    reward: 'Ministerial Loafing License (Unrestricted)',
    objective: 'Check in at the town square and loaf with intent.'
  },
  {
    id: 'curious-chest',
    title: 'Contents of Utmost Unimportance',
    description: 'The Mysterious Chest in the meadow is making suspicious rattling noises. Probably nothing.',
    reward: 'A Sealed Envelope Containing Absolutely Nothing',
    objective: 'Inspect the secret chest and file an inconclusive report.'
  }
]

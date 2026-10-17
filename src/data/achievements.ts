export interface AchievementDef {
  id: string
  name: string
  description: string
}

export const ACHIEVEMENTS: Record<string, AchievementDef> = {
  firstComplaint: {
    id: 'firstComplaint',
    name: 'Petty Officer',
    description: 'Filed your first official complaint with the Ministry.'
  },
  threeComplaints: {
    id: 'threeComplaints',
    name: 'Repeat Customer of Suffering',
    description: 'Filed three complaints. The Ministry is, frankly, impressed by your commitment.'
  },
  promoted: {
    id: 'promoted',
    name: 'Unnecessary Promotion',
    description: 'You poked Sir Pigeon III five times and were promoted for it.'
  },
  universe: {
    id: 'universe',
    name: 'Cosmically Unfair',
    description: 'Filed a complaint at severity: The Universe Is Personally Against Me.'
  },
  archivist: {
    id: 'archivist',
    name: 'Honorary Archivist',
    description: 'Visited the Archives and reacted to a case with genuine feeling.'
  }
}

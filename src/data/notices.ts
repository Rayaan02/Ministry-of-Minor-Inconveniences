export interface Notice {
  id: string
  title: string
  body: string
  posted: string
  important?: boolean
}

export const ANNOUNCEMENTS: Notice[] = [
  {
    id: 'n1',
    title: 'Ministry Notice Board Now Open',
    body: 'The tee is open. The coffee is not. Please do not ask about the coffee.',
    posted: 'Today'
  },
  {
    id: 'n2',
    title: 'Missing: One (1) Brain Cell',
    body: 'Answered to the name “Brian”. Last seen being shared by the entire investigations department. Reward: an approving nod.',
    posted: '3 days ago',
    important: true
  },
  {
    id: 'n3',
    title: 'Form 44-B Now Requires Form 44-A',
    body: 'Form 44-A has been discontinued. You will need Form 44-A (Discontinued Edition). Ask at the far window. It is closed.',
    posted: 'Last Tuesday'
  },
  {
    id: 'n4',
    title: 'Pigeon Parking Regulations Updated',
    body: 'Birdbaths are now designated loading zones between 4am and 4:15am. Enforcement is carried out by pigeons, for pigeons.',
    posted: 'Fortnight ago'
  },
  {
    id: 'n5',
    title: 'Do Not Feed The Trainee',
    body: 'The trainee is fine. The trainee is simply on a 47-week orientation programme.',
    posted: 'Unknown date'
  },
  {
    id: 'n6',
    title: 'Mondays Temporarily Suspended',
    body: 'Following a record number of complaints, Mondays have been suspended pending investigation. Tuesday declined to comment.',
    posted: 'Yesterday',
    important: true
  },
  {
    id: 'n7',
    title: 'Lost Property: Three Biscuits, One Half-Eaten',
    body: 'Recovered from a mug. Evidence bag 12. No suspects. Many suspects.',
    posted: '2 hours ago'
  },
  {
    id: 'n8',
    title: 'Reminder: Complaining About Complaints',
    body: 'Requires a complaint. Which requires a form. Which requires a complaint. Escalation queue A is now 6,000 years long.',
    posted: 'Always'
  }
]

export const TICKER_LINES = [
  'BREAKING: Local pigeon promoted to Supreme Deputy Assistant Minister for the ninth time this week.',
  'REMINDER: The Ministry is fictional. Your suffering is real. This is satire.',
  'NOTICE: Sock investigations have been escalated to National Sock Emergency Level: Beige.',
  'WEATHER: Mild. Slightly disappointing. As requested.',
  'UPDATE: Monday has filed an appeal against being blamed for everything.',
  'ALERT: Someone has filed a complaint about filing complaints. We are reviewing it with delight.',
  'RUMOUR: The Archives contain a drawer that only opens if you believe in it.',
  'CONFIDENTIAL: The Ministry’s only functioning brain cell has requested a holiday.'
]

export const CLERK_REMARKS = [
  'Please remain calm. We have misplaced the emergency procedures.',
  'Your complaint has been forwarded to someone equally unqualified.',
  'The Ministry has reviewed your suffering. Unfortunately, it was hilarious.',
  'I have stamped this. It is now real. Legally. Allegedly.',
  'Do not approach the Archives drawer. It bites. Metaphorically. Maybe.',
  'We take your problem very seriously. Right after lunch.',
  'A pigeon will see you now. A pigeon will see you always.',
  'That form is invalid because it is slightly the wrong shade of cream.',
  'I have escalated this to myself. I will get back to me.',
  'Interesting. Now let me add it to the pile. The pile is a lifestyle.'
]

export const PIGEON_TOPICS = [
  {
    id: 'socks',
    question: 'Why do socks vanish in the wash?',
    answer:
      'An excellent question, citizen. Our findings indicate the machine operates a small door at the back. We have not found the door. We have found nine socks and a receipt for a door.'
  },
  {
    id: 'monday',
    question: 'Can you cancel Mondays?',
    answer:
      'We tried. Monday submitted a counter-argument of seventeen pages, all of which were just the word “no” repeated. The case remains open and deeply upsetting.'
  },
  {
    id: 'self',
    question: 'Who are you, exactly?',
    answer:
      'I am Sir Pigeon III, Supreme Deputy Assistant Minister of Unnecessary Paperwork. I hold nine honorary degrees, all in Administration, none verified.'
  },
  {
    id: 'brain',
    question: 'Is it true the Ministry has one brain cell?',
    answer:
      'We prefer “shared cognitive resource”. It is currently on its lunch break, which is whenever it feels like it.'
  },
  {
    id: 'fourth',
    question: 'Are you aware you are in a video game?',
    answer:
      'I am aware you keep clicking me, yes. If you click me five more times I shall be forced to promote you. It is Ministry policy. It is a strange policy.'
  },
  {
    id: 'compensation',
    question: 'What compensation can I expect?',
    answer:
      'A potato. An emotional support potato. It is a good potato. It has seen things.'
  }
]

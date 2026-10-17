import type { CaseContent, CaseFile, ComplaintDraft, SpriteKey, Suspect } from '../types'
import { getDepartment, getSeverity, INVESTIGATOR } from '../data/departments'

/* ============================================================
   Deterministic RNG — same complaint always yields the same
   absurd investigation, which makes the demo feel intentional.
   ============================================================ */
function hashString(input: string): number {
  let hash = 2166136261
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

function mulberry32(seed: number) {
  let a = seed >>> 0
  return function next(): number {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function pick<T>(rng: () => number, list: T[]): T {
  return list[Math.floor(rng() * list.length) % list.length]
}

function shuffle<T>(rng: () => number, list: T[]): T[] {
  const copy = [...list]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

/* ============================================================
   Investigation content bundles
   ============================================================ */
interface Bundle {
  id: string
  keywords: string[]
  suspects: Array<{ name: string; role: string; guilt: string; sprite: SpriteKey }>
  evidence: string[]
  verdicts: string[]
  actions: string[]
  comps: string[]
}

const BUNDLES: Bundle[] = [
  {
    id: 'socks',
    keywords: ['sock', 'socks', 'laundry', 'washing machine', 'washer', 'dryer', 'tumble', 'hosiery', 'drawer'],
    suspects: [
      {
        name: 'The Washing Machine',
        role: 'Prime Suspect, Domestic Appliance',
        guilt: 'Refuses all questions and simply spins when confronted.',
        sprite: 'machine'
      },
      {
        name: 'Sock Gremlins (Unlicensed)',
        role: 'Illegal Collectors',
        guilt: 'Operate an unlicensed sock exchange behind the drum.',
        sprite: 'creature'
      },
      {
        name: 'Gravity, But Only For Left Socks',
        role: 'Suspicious Physical Law',
        guilt: 'Disproportionately affects the left side of every drawer.',
        sprite: 'shadow'
      },
      {
        name: 'The Lint Filter',
        role: 'Accomplice With Secrets',
        guilt: 'Claims innocence while containing eleven years of evidence.',
        sprite: 'object'
      },
      {
        name: 'The Matching Sock Cartel',
        role: 'Organised Pairing Ring',
        guilt: 'Controls 94% of all successful pairings in the region.',
        sprite: 'person'
      }
    ],
    evidence: [
      'One sock was recovered from the machine’s darkest corner, visibly traumatised.',
      'Survivors report their partners simply “never came back”.',
      'Machine dust tested positive for 40% lint and 60% regret.',
      'A neighbour heard muffled spinning at 02:14, well outside legal laundry hours.',
      'Photographic evidence shows one sock entering and zero socks leaving.',
      'Nine socks were reported missing this year. Records confirm only eight ever existed.'
    ],
    verdicts: [
      'The washing machine is hereby ordered to return all sock-related property within one (1) standard load.',
      'All socks are reclassified as “emotionally fragile” and granted protective custody.',
      'The Ministry declares socks a protected species and bans unsupervised machine operation nationwide.'
    ],
    actions: [
      'The lint filter is to be publicly interrogated every Sunday at dawn.',
      'Every single sock must be issued a support group and a small folding chair.',
      'All washing machines must employ a Sock Reconciliation Officer by the end of the quarter.'
    ],
    comps: [
      'One (1) legally distinct sock and a certificate of partnership.',
      'A matching pair of the Ministry’s choosing. Colour not guaranteed. Colour rarely discussed.',
      'Twelve lint credits, redeemable absolutely nowhere.',
      'One emotional support sock, pre-lost for authenticity.',
      'A commemorative plaque on the washing machine reading “IT KNOWS”.'
    ]
  },
  {
    id: 'monday',
    keywords: [
      'monday', 'mondays', 'morning', 'mornings', 'alarm', 'week', 'weekday', 'work', 'job', 'sunday',
      'commute', 'deadline', 'meeting'
    ],
    suspects: [
      {
        name: 'The Gregorian Calendar',
        role: 'Repeat Offender Since 1582',
        guilt: 'Has arranged seven days per week with no consultation whatsoever.',
        sprite: 'object'
      },
      {
        name: 'Alarm Clock Manufacturers',
        role: 'Industrial Sound Criminals',
        guilt: 'Engineer a sound scientifically designed to feel like betrayal.',
        sprite: 'clock'
      },
      {
        name: 'Whoever Invented Responsibilities',
        role: 'Historical Menace',
        guilt: 'Has never once been located, questioned, or held accountable.',
        sprite: 'person'
      },
      {
        name: 'Coffee',
        role: 'Reluctant Accomplice',
        guilt: 'Fully aware of the situation and profiting from it.',
        sprite: 'object'
      },
      {
        name: 'The Concept Of Tuesday',
        role: 'Uninvolved Bystander',
        guilt: 'Was present. Did nothing. Watched the entire thing.',
        sprite: 'creature'
      }
    ],
    evidence: [
      'Mondays were found to occur suspiciously every seven days, without fail or apology.',
      'Coffee consumption spikes by 340% between 07:00 and 09:00 on the day in question.',
      'Witnesses report widespread sighing and at least two audible “honestly”s.',
      'A study of 4,000 beds confirms 100% of them were abandoned against their will.',
      'Official timestamps prove the weekend was shorter than advertised.',
      'One witness described the feeling as “like being gently sat on by a calendar”.'
    ],
    verdicts: [
      'Mondays are hereby ordered to begin at 12:00 PM and must knock first.',
      'All Mondays are downgraded to “a soft Tuesday” until further notice.',
      'The Ministry orders Monday to issue a written apology to all 8 billion affected parties.'
    ],
    actions: [
      'Alarm clocks must now wake users with a polite compliment before any noise occurs.',
      'A motivational pigeon will be assigned to every desk on Monday mornings.',
      'Morning meetings are banned before 11am, unless they are about snacks.'
    ],
    comps: [
      'Three imaginary holidays and one emotional support potato.',
      'A lifetime supply of Tuesday, lightly used.',
      'One extra hour of sleep, to be administered at a time of the Ministry’s choosing.',
      'A commemorative mug that never empties, subject to availability, physics, and mood.',
      'A gold star and permission to say “no” once, guilt-free.'
    ]
  },
  {
    id: 'snack',
    keywords: [
      'tea', 'coffee', 'biscuit', 'cookie', 'dunk', 'snack', 'fries', 'chips', 'crisps', 'chocolate',
      'cake', 'food', 'pizza', 'toast', 'mug', 'lunch', 'fridge', 'takeaway', 'leftovers'
    ],
    suspects: [
      {
        name: 'Gravity',
        role: 'Cruel And Unlicensed',
        guilt: 'Escalated the biscuit’s descent without a permit.',
        sprite: 'shadow'
      },
      {
        name: 'The Mug',
        role: 'Ceramic Co-Conspirator',
        guilt: 'Made no attempt to catch the biscuit despite ample opportunity.',
        sprite: 'object'
      },
      {
        name: 'Your Friend, Allegedly',
        role: 'Suspiciously Well-Fed',
        guilt: 'Was seen near the fries. Was seen eating the fries. Was seen smiling.',
        sprite: 'person'
      },
      {
        name: 'The Shared Fridge',
        role: 'Lawless Territory',
        guilt: 'Has no warden, no rules, and eleven unclaimed yoghurts.',
        sprite: 'machine'
      },
      {
        name: 'Momentum',
        role: 'Physics Consultant Turned Accomplice',
        guilt: 'Insists it was “just doing its job”, which is somehow worse.',
        sprite: 'creature'
      }
    ],
    evidence: [
      'The biscuit was located at the bottom of the mug, unrepentant.',
      'A thin film of tea has been seized as material evidence and drunk for science.',
      'Witness accounts confirm the fries left the container single-file and were never seen again.',
      'Fingerprints on the last remaining fry match several members of the group chat.',
      'Soup-level moisture readings suggest sabotage of structural biscuit integrity.',
      'The fridge log shows entry at 02:40 by “someone who definitely wasn’t hungry”.'
    ],
    verdicts: [
      'The biscuit is declared a national treasure and the mug is fined for negligence.',
      'Fries are hereby classified as personal property, protected by Ministry law and several pigeons.',
      'All dunking must be supervised by a qualified adult with a stopwatch.'
    ],
    actions: [
      'Mugs must be fitted with tiny guardrails and a biscuit retrieval net.',
      'Every communal fridge will be patrolled by an armed pigeon between meals.',
      'Fries must be counted aloud before and after any social gathering.'
    ],
    comps: [
      'One replacement biscuit, slightly damp, plus dignity support services.',
      'A bowl of fries and an apology written in ketchup.',
      'Two (2) future snacks, transferable but not refundable.',
      'A commemorative tea towel and a firm talking-to for the suspect.',
      'One jar of biscuits guarded by an emotional support pigeon.'
    ]
  },
  {
    id: 'tech',
    keywords: [
      'phone', 'battery', 'wifi', 'internet', 'charger', 'charging', 'lag', 'bluetooth', 'update', 'laptop',
      'screen', 'app', 'buffer', 'loading', 'signal', 'password', 'browser', 'cable', 'headphones', 'airpods'
    ],
    suspects: [
      {
        name: 'The Battery',
        role: 'Serial Dramatist',
        guilt: 'Has never once died at a reasonable percentage.',
        sprite: 'object'
      },
      {
        name: 'The Router',
        role: 'Moody Local Deity',
        guilt: 'Requires a ritual restart to perform tasks it has done for years.',
        sprite: 'machine'
      },
      {
        name: 'A Software Update From Last Month',
        role: 'Chief Saboteur',
        guilt: 'Introduced 14 features nobody asked for and removed the one that worked.',
        sprite: 'creature'
      },
      {
        name: 'Bluetooth',
        role: 'Chaotic Entity',
        guilt: 'Pairs with a stranger’s speaker from 40 metres away, ignores you at 4.',
        sprite: 'shadow'
      },
      {
        name: 'The Cloud',
        role: 'Vague And Uncooperative',
        guilt: 'Describes itself as “syncing” while doing demonstrably nothing.',
        sprite: 'bird'
      }
    ],
    evidence: [
      'The device powered down at exactly 1%, then refused to accept it had 1%.',
      'Logs show the Wi-Fi left at 21:03 without leaving a forwarding address.',
      'A buffer circle was observed spinning for eleven minutes and achieving nothing.',
      'Autocorrect altered a heartfelt message into a discussion about geese.',
      'Ninety-four percent of the storage is occupied by “other”, a category nobody can explain.',
      'The charger functions perfectly in every room except the one you are sitting in.'
    ],
    verdicts: [
      'The battery is ordered to provide honest percentages from this day forward.',
      'The router is hereby required to file a formal explanation for every outage.',
      'All notifications are to be delivered in person by a small pigeon, with feeling.'
    ],
    actions: [
      'Devices must be taught one (1) new trick per year and no more.',
      'The Ministry will install a single, enormous, extremely manual off switch.',
      'Autocorrect is suspended pending an independent review of the geese incident.'
    ],
    comps: [
      'One (1) power bank of questionable vintage and an encouraging nod.',
      'A pigeon-based messaging service for the next three days.',
      'Free removal of three (3) mystery files from your storage.',
      'A certificate confirming you were right about the Wi-Fi.',
      'A small but genuinely functioning cable, used but loved.'
    ]
  },
  {
    id: 'awkward',
    keywords: [
      'awkward', 'embarrassing', 'cringe', 'wave', 'waving', 'stranger', 'small talk', 'party', 'conversation',
      'eye contact', 'hello', 'text back', 'replied', 'social', 'meeting new', 'coworker', 'colleague'
    ],
    suspects: [
      {
        name: 'The Person Who Waved Back Too Late',
        role: 'Unidentified Man, Probably Fine',
        guilt: 'Waved at 30 metres, then again at 3 metres, then at nothing.',
        sprite: 'person'
      },
      {
        name: 'Small Talk Itself',
        role: 'Ancient Affliction',
        guilt: 'Has never once respected a natural pause in conversation.',
        sprite: 'creature'
      },
      {
        name: 'The Group Chat',
        role: 'Hostile Environment',
        guilt: 'Left your joke on read for eleven hours and counting.',
        sprite: 'shadow'
      },
      {
        name: 'Your Own Brain, At 3am',
        role: 'Internal Saboteur',
        guilt: 'Replays the incident in full HD with improved sound design.',
        sprite: 'object'
      },
      {
        name: 'The Waiter Who Said “Enjoy Your Meal”',
        role: 'Unwitting Opponent',
        guilt: 'Set a trap from which no response is acceptable.',
        sprite: 'bird'
      }
    ],
    evidence: [
      'The victim replied “you too” and immediately left the country in spirit.',
      'Bystanders confirm the wave was returned by a completely different person.',
      'Security footage shows the complainant walking the wrong way on purpose.',
      'The group chat has been muted, unmuted, and muted again within four minutes.',
      'Subject has rehearsed the conversation seven times and will rehearse it forever.',
      'A witness heard someone say “anyway” as a full evacuation strategy.'
    ],
    verdicts: [
      'The wave is legally reclassified as “a strong maybe” and struck from all records.',
      'All “you too” incidents are hereby pardoned, retroactively, forever.',
      'Small talk is fined and ordered to keep things brief.'
    ],
    actions: [
      'Mandatory training on the Head Nod, delivered by a pigeon with excellent posture.',
      'Every group chat must include one member legally obliged to reply to everyone.',
      'A nationwide 3-second buffer will be installed before anyone says “anyway”.'
    ],
    comps: [
      'One (1) socially acceptable exit phrase, valid for life.',
      'A small certificate you may show to nobody.',
      'Free pass to leave any event by saying you must check on a pigeon.',
      'Three years of protection from being perceived.',
      'A friendly pigeon who will never bring up the incident.'
    ]
  },
  {
    id: 'lost',
    keywords: [
      'keys', 'key', 'wallet', 'lost', 'losing', 'missing', 'forgot', 'forget', 'memory', 'misplaced',
      'glasses', 'phone charger', 'passport', 'umbrella', 'remote', 'pen'
    ],
    suspects: [
      {
        name: 'The Sofa',
        role: 'Confirmed Swallower',
        guilt: 'Contains 40% cushion, 40% crumbs, 20% of your things.',
        sprite: 'object'
      },
      {
        name: 'The Place You Already Checked',
        role: 'Repeatedly Innocent',
        guilt: 'Was in fact holding the item, but only after you gave up.',
        sprite: 'shadow'
      },
      {
        name: 'Your Own Hand',
        role: 'Holding The Item The Whole Time',
        guilt: 'Maintained possession for nine minutes while you panicked.',
        sprite: 'person'
      },
      {
        name: 'The Pockets Of A Jacket You Are Not Wearing',
        role: 'Seasonal Accomplice',
        guilt: 'Currently storing 3 keys and one receipt from 2019.',
        sprite: 'creature'
      },
      {
        name: 'The Twenty-Second Gap',
        role: 'Uncharted Period',
        guilt: 'An entire object vanished during a 20-second conversation.',
        sprite: 'clock'
      }
    ],
    evidence: [
      'The item was recovered under something, which is where items are always recovered.',
      'A thorough search of “everywhere” failed to include the actual location.',
      'Witness testimony describes the complainant announcing the loss with great confidence.',
      'A duplicate item was purchased and located within 40 seconds of arriving home.',
      'Traces of “it was right there” were found on the kitchen counter.',
      'The sofa was interviewed. The sofa was not forthcoming.'
    ],
    verdicts: [
      'The item is declared officially found, and the losing of it is officially ignored.',
      'All sofas are ordered to return contents within 48 hours or face being sat upon.',
      'The Ministry rules that you “probably left it in the other bag”.'
    ],
    actions: [
      'Every household must nominate one honest drawer and respect it.',
      'A Ministry pigeon will be assigned to point at things you are standing on.',
      'Items are to be kept in a specific place, as agreed, apparently.'
    ],
    comps: [
      'One (1) replacement keychain shaped like an apologetic pigeon.',
      'A small tray for your things and a stern talking-to for the sofa.',
      'A laminated list of the four places things actually are.',
      'Free retrieval service, one call per month, pigeons dispatch within an hour.',
      'A certificate of finding, issued without judgement. Mostly.'
    ]
  },
  {
    id: 'sleep',
    keywords: [
      'sleep', 'insomnia', 'tired', 'dream', 'bed', 'nap', 'snooze', 'awake', 'night', 'snore', 'pillow'
    ],
    suspects: [
      {
        name: 'Your Brain',
        role: 'Nocturnal Overachiever',
        guilt: 'Schedules 3am meetings to discuss 2014 in detail.',
        sprite: 'creature'
      },
      {
        name: 'The Bed',
        role: 'Comfort Failure',
        guilt: 'Achieves correct temperature in only one precise position.',
        sprite: 'object'
      },
      {
        name: 'The Pillow',
        role: 'Suspiciously Warm',
        guilt: 'Refuses to be cool on both sides simultaneously.',
        sprite: 'shadow'
      },
      {
        name: 'A Spring Behind The Wall',
        role: 'Intermittent Criminal',
        guilt: 'Makes a small noise only between 02:00 and 04:00.',
        sprite: 'machine'
      },
      {
        name: 'Daylight',
        role: 'Aggressive Local',
        guilt: 'Arrives before consent has been given.',
        sprite: 'clock'
      }
    ],
    evidence: [
      'The complainant was observed being fully awake and extremely annoyed at 03:41.',
      'A single passing car was heard and treated as a major event.',
      'One leg was repeatedly removed from the duvet for temperature sin reasons.',
      'A phone was checked 14 times, revealing nothing new on all 14 occasions.',
      'Witness accounts confirm the brain began playing a song from 2009 without permission.',
      'An alarm was set with genuine optimism.'
    ],
    verdicts: [
      'Your brain is hereby ordered to keep its thoughts until after breakfast.',
      'Sleep is declared a human right and is to be supplied in full, promptly.',
      'All 3am worrying is postponed indefinitely pending a review of nothing.'
    ],
    actions: [
      'A pigeon will be stationed at your window to shame the daylight.',
      'Thoughts must be written down and dealt with by a professional in the morning.',
      'The duvet is to be renegotiated with clear terms for both legs.'
    ],
    comps: [
      'One (1) nap, premium, with cushions. Non-negotiable.',
      'A heavily sedated afternoon and a commemorative eye mask.',
      'Twelve hours of “do not disturb”, enforced by pigeon.',
      'One warm drink and permission to be boring for a night.',
      'A certificate stating that you are, in fact, tired. Officially.'
    ]
  },
  {
    id: 'printer',
    keywords: ['printer', 'printing', 'paper jam', 'ink', 'toner', 'scanner', 'photocopier', 'scan', 'print'],
    suspects: [
      {
        name: 'The Printer',
        role: 'Sentient And Resentful',
        guilt: 'Can sense urgency from the next room and responds accordingly.',
        sprite: 'machine'
      },
      {
        name: 'Cyan, The Sacred Colour',
        role: 'Scarce Resource',
        guilt: 'Refuses to print a black page without it.',
        sprite: 'object'
      },
      {
        name: 'Paper Tray Two',
        role: 'Partially Loaded Deception',
        guilt: 'Always appears stocked. Never has been.',
        sprite: 'creature'
      },
      {
        name: 'The Job From Three Hours Ago',
        role: 'Ancient Unsolved Matter',
        guilt: 'Has jammed the queue with 240 pages of a document you cancelled.',
        sprite: 'shadow'
      },
      {
        name: 'The Documentation',
        role: 'Deliberately Incomplete',
        guilt: 'Describes a model that does not exist and never has.',
        sprite: 'person'
      }
    ],
    evidence: [
      'The printer displayed “Ready” while being categorically not ready.',
      'A jam was located in the one panel not described in the manual.',
      'Ink levels were reported as “low” for the eleventh consecutive month.',
      'The 240-page job was found nestled between two important single-page jobs.',
      'Witnesses confirm the complainant pressed print again “just to be safe”.',
      'The error message consisted of a light and no explanation whatsoever.'
    ],
    verdicts: [
      'The printer is found guilty of crimes against patience and is to be unplugged overnight.',
      'Cyan is granted emergency protection status and a small velvet case.',
      'All printing is suspended until the printer issues a written apology.'
    ],
    actions: [
      'Printers will be required by law to explain themselves in plain language.',
      'One pigeon will be assigned per office to personally deliver documents.',
      'Paper trays must be honest about their contents from this day forward.'
    ],
    comps: [
      'One (1) page, printed, in full, on the first attempt. Historic.',
      'A pigeon courier service for all urgent documents. Pigeon not responsible for weather.',
      'Free ink for a year and a supportive poster for the wall.',
      'A commemorative “NO JAM” badge, laminated.',
      'An emotional support staple remover.'
    ]
  },
  {
    id: 'weather',
    keywords: [
      'rain', 'raining', 'weather', 'umbrella', 'cold', 'hot', 'sun', 'wind', 'bus', 'traffic', 'train',
      'late', 'delay', 'drizzle', 'snow', 'storm'
    ],
    suspects: [
      {
        name: 'The Clouds',
        role: 'Uncoordinated Collective',
        guilt: 'Convene directly above the complainant and nowhere else.',
        sprite: 'bird'
      },
      {
        name: 'The Bus',
        role: 'Legendary Absence',
        guilt: 'Was reported as “2 minutes away” for 19 minutes.',
        sprite: 'machine'
      },
      {
        name: 'The Umbrella In The Other Bag',
        role: 'Perfectly Placed To Be Useless',
        guilt: 'Was at home. Was always at home. Knew about the rain.',
        sprite: 'object'
      },
      {
        name: 'Traffic',
        role: 'Ancient Local Phenomenon',
        guilt: 'Occupies every lane for no reason anyone can identify.',
        sprite: 'person'
      },
      {
        name: 'The One Puddle',
        role: 'Surgical Operator',
        guilt: 'Waits for the exact moment you are wearing the wrong shoes.',
        sprite: 'shadow'
      }
    ],
    evidence: [
      'Rain began 40 seconds after the complainant stepped outside without a coat.',
      'The bus arrived, displayed “Not In Service”, and left.',
      'A single vehicle delivered a perfect puddle wake to the ankles.',
      'Weather app confidently predicted sunshine throughout the incident.',
      'The umbrella was found dry at home, mocking everyone.',
      'Every other person on the street was mysteriously dry.'
    ],
    verdicts: [
      'The clouds are ordered to relocate to a designated weather zone immediately.',
      'The bus is fined for “2 minutes away” fraud and must explain itself at the depot.',
      'Rain is permitted only between the hours of 03:00 and 03:20 on Tuesdays.'
    ],
    actions: [
      'All umbrellas must be kept within 2 metres of the person who bought them.',
      'One pigeon meteorologist is to be appointed and must be taken seriously.',
      'Buses must announce their actual intentions, in words, out loud.'
    ],
    comps: [
      'A towel, warm, administered by pigeon at the earliest opportunity.',
      'One (1) taxi ride of poor quality, fully reimbursed in lint.',
      'Dry socks and the right to complain loudly without judgement.',
      'A tiny umbrella for a pigeon you may keep.',
      'One afternoon of sunshine, scheduled at your convenience, weather permitting.'
    ]
  },
  {
    id: 'messages',
    keywords: [
      'autocorrect', 'typo', 'text', 'texting', 'message', 'emoji', 'group chat', 'reply', 'typing',
      'seen', 'read receipt', 'spam', 'email', 'inbox', 'notification'
    ],
    suspects: [
      {
        name: 'Autocorrect',
        role: 'Serial Text Criminal',
        guilt: 'Has altered a sincere message into a discussion about geese.',
        sprite: 'machine'
      },
      {
        name: 'The Group Chat',
        role: 'Churning Nightmare',
        guilt: 'Produced 400 messages overnight, none of which mattered.',
        sprite: 'creature'
      },
      {
        name: 'The Read Receipt',
        role: 'Weaponised Timestamp',
        guilt: 'Confirms you were seen at 12:04 and ignored with conviction.',
        sprite: 'clock'
      },
      {
        name: 'The Three Dots',
        role: 'Appeared And Vanished',
        guilt: 'Typed for 40 seconds, then chose silence.',
        sprite: 'shadow'
      },
      {
        name: 'The Inbox',
        role: 'Bottomless Institution',
        guilt: 'Contains 4,912 unread items and one from a pigeon.',
        sprite: 'object'
      }
    ],
    evidence: [
      'The offending message was sent to the wrong chat entirely.',
      'A screenshot of the typo has been preserved for the record and for shame.',
      'The recipient replied with the thumbs up. Nothing else. Just the thumbs up.',
      'Messages sent “haha no worries!” were internally assessed as “worried”.',
      'The typo occurred in the one word you cannot afford to misspell.',
      'An unsend was attempted 14 minutes and 3 seconds too late.'
    ],
    verdicts: [
      'Autocorrect is hereby sentenced to 30 days of doing absolutely nothing.',
      'All group chats must include one pigeon of temperament who replies sensibly.',
      'The three dots are to be considered legally binding from now on.'
    ],
    actions: [
      'Every outgoing message will be read back to the sender by a stern pigeon.',
      'Read receipts must display a brief explanation for the delay.',
      'Autocorrect is banned from touching proper nouns, feelings, or dessert words.'
    ],
    comps: [
      'One (1) unsend, honoured retroactively, no questions asked.',
      'A small apology emoji, professionally composed.',
      'Free muting of one group chat for 48 hours with full legal cover.',
      'A typed-and-checked certificate of clear communication.',
      'An emotional support draft folder.'
    ]
  },
  {
    id: 'general',
    keywords: [],
    suspects: [
      {
        name: 'An Unidentified Local Rascal',
        role: 'At Large, Suspected Of Everything',
        guilt: 'Was seen nearby. Was arguably always nearby.',
        sprite: 'creature'
      },
      {
        name: 'The Laws Of Probability',
        role: 'Broadly Unhelpful',
        guilt: 'Insists the incident was “basically inevitable”.',
        sprite: 'shadow'
      },
      {
        name: 'The Department Of Everything',
        role: 'Declined Responsibility',
        guilt: 'Deferred the matter to a department that does not exist.',
        sprite: 'person'
      },
      {
        name: 'An Intern',
        role: 'Unsupervised',
        guilt: 'Was handed the matter on their second day and simply held it.',
        sprite: 'bird'
      },
      {
        name: 'The Weather',
        role: 'Present At The Time',
        guilt: 'Claims to be a coincidence and refuses to elaborate.',
        sprite: 'object'
      }
    ],
    evidence: [
      'The incident occurred at a time of day, which witnesses describe as “typical”.',
      'A small paper file was created. Nothing has been written in it.',
      'One pigeon was questioned at length and provided a full account of nothing.',
      'Photographs exist of the general area at approximately the correct moment.',
      'A form was submitted in triplicate, one copy lost deliberately.',
      'The Ministry’s only brain cell was consulted and requested a nap.'
    ],
    verdicts: [
      'The incident is hereby declared “someone else’s fault”, pending further nothing.',
      'The Ministry rules that the matter is entirely unacceptable and yet somehow common.',
      'All parties are to continue as normal while the Ministry looks thoughtfully out of a window.'
    ],
    actions: [
      'A pigeon will be assigned to the case and will follow you gently for three days.',
      'The matter is escalated to the Deputy Assistant of Escalations, who is on lunch.',
      'A new form will be invented, using your name, which is the highest honour available.'
    ],
    comps: [
      'One emotional support potato and a very official nod.',
      'Three imaginary holidays and a certificate of minor grievance.',
      'A pigeon-sized apology delivered in writing and with a small hat.',
      'Two (2) vouchers for absolutely nothing, valid forever.',
      'A plaque. It says your name. It is on a wall somewhere. Probably.'
    ]
  }
]

/* ============================================================
   Summary / framing templates
   ============================================================ */
const DURATIONS = [
  'seventeen minutes',
  'three working days',
  'one very long afternoon',
  'forty-five minutes and a biscuit',
  'a fortnight, generously',
  'two meetings',
  'nine cups of tea'
]

const WITNESS_LINES = [
  'four pigeons and one extremely confident intern',
  'two neighbours, three pigeons, and a hedge',
  'eleven witnesses, none of whom agreed',
  'one witness who claimed to have “seen everything”',
  'a pigeon who took detailed notes in a language nobody recognises',
  'several people who were technically present'
]

const SEVERITY_FRAMING: Record<string, string> = {
  mild: 'a minor inconvenience of enormous personal importance and zero national relevance',
  moderate: 'a moderately outrageous event that has ruined at least one entire day',
  national: 'an incident of grave national significance for a nation that does not exist',
  existential: 'a philosophical emergency requiring a full review of how the universe is run',
  universe: 'a cosmic injustice so severe that the Ministry had to sit down for a moment'
}

const STATUSES = [
  { status: 'OFFICIALLY RESOLVED', note: 'Resolution not guaranteed in any known universe.' },
  { status: 'CASE CLOSED (SORT OF)', note: 'Files may reopen spontaneously if the pigeon remembers.' },
  { status: 'RESOLVED, PROVISIONALLY', note: 'Applicable only in the Republic of Absolutely Nowhere.' },
  { status: 'RETROACTIVELY RESOLVED', note: 'Valid from a date of our choosing. Probably a Tuesday.' },
  { status: 'CLOSED PENDING A NAP', note: 'The investigator has earned it. Allegedly.' },
  { status: 'ESCALATED TO NOBODY', note: 'A formal decision that someone else should care.' }
]

function summarise(draft: ComplaintDraft, rng: () => number, deptName: string, evidence: string[]): string {
  const duration = pick(rng, DURATIONS)
  const witnesses = pick(rng, WITNESS_LINES)
  const framing = SEVERITY_FRAMING[draft.severity] ?? SEVERITY_FRAMING.mild
  const snippetSource = draft.description.trim().replace(/\s+/g, ' ')
  const snippet = snippetSource.length > 0 ? snippetSource.slice(0, 110) : draft.title
  const opener = pick(rng, [
    'Following a thorough investigation lasting',
    'After an exhaustive inquiry spanning',
    'Pursuant to a deeply unnecessary review lasting',
    'Having spent',
    'Following an emergency session that lasted'
  ])
  const closer = pick(rng, [
    `The department interviewed ${witnesses} before concluding that the evidence “speaks for itself, mostly”.`,
    `Investigators submitted ${evidence.length} exhibits, three of which were biscuits.`,
    `${deptName} convened at 03:47 to debate the matter and reached a unanimous decision after a short nap.`,
    `The Ministry’s only functioning brain cell was consulted. It declined to comment and asked to be left alone.`,
    `A full report was written on a napkin. The napkin has been filed. The filing system is a drawer.`
  ])
  return `${opener} ${duration}, this Ministry has determined that “${draft.title}” constitutes ${framing}. The complainant’s own account states: “${snippet}”. ${closer}`
}

/* ============================================================
   Public generator
   ============================================================ */
function matchBundle(text: string): Bundle {
  const haystack = text.toLowerCase()
  let best: { bundle: Bundle; score: number } | null = null
  for (const bundle of BUNDLES) {
    if (bundle.keywords.length === 0) continue
    let score = 0
    for (const keyword of bundle.keywords) {
      if (haystack.includes(keyword)) score += keyword.includes(' ') ? 3 : 2
    }
    if (score > 0 && (!best || score > best.score)) best = { bundle, score }
  }
  return best ? best.bundle : BUNDLES[BUNDLES.length - 1]
}

export function generateLocalContent(draft: ComplaintDraft): CaseContent {
  const seed = hashString(
    `${draft.title}|${draft.description}|${draft.complainant}|${draft.department}|${draft.severity}`
  )
  const rng = mulberry32(seed)
  const bundle = matchBundle(`${draft.title} ${draft.description}`)
  const deptName = getDepartment(draft.department).name

  const suspects: Suspect[] = shuffle(rng, bundle.suspects)
    .slice(0, 3)
    .map((suspect) => ({ ...suspect }))

  const evidence = shuffle(rng, bundle.evidence).slice(0, 3)
  const verdict = pick(rng, bundle.verdicts)
  const correctiveAction = pick(rng, bundle.actions)
  const compensation = pick(rng, bundle.comps)
  const summary = summarise(draft, rng, deptName, evidence)

  return { suspects, evidence, summary, verdict, correctiveAction, compensation }
}

export function pickStatus(seedText: string): { status: string; note: string } {
  const rng = mulberry32(hashString(`status:${seedText}`))
  return pick(rng, STATUSES)
}

export function investigatorLine(draft: ComplaintDraft): string {
  const severity = getSeverity(draft.severity)
  const rng = mulberry32(hashString(`line:${draft.title}${draft.complainant}`))
  const options = [
    `Your complaint has been forwarded to someone equally unqualified.`,
    `The Ministry has reviewed your suffering. Unfortunately, it was hilarious.`,
    `Severity logged as “${severity.label}”. We have adjusted the paperwork accordingly.`,
    `Please remain calm. We have misplaced the emergency procedures.`,
    `A pigeon has been assigned to your case. The pigeon is confident. That is all.`
  ]
  return pick(rng, options)
}

/* ============================================================
   Case assembly
   ============================================================ */
let caseCounter = 40

export function buildCase(
  draft: ComplaintDraft,
  content: CaseContent,
  options: { mode: 'demo' | 'ai'; aiModel?: string; seeded?: boolean } = { mode: 'demo' }
): CaseFile {
  const number = (caseCounter += 1)
  const anonymous =
    draft.complainant.trim().length === 0 || /^(anon|anonymous|n\/a)$/i.test(draft.complainant.trim())
  const complainant = anonymous ? 'Anonymous Citizen' : draft.complainant.trim()
  const status = pickStatus(`${draft.title}${number}`)
  return {
    id: `MMI-${String(number).padStart(5, '0')}`,
    number,
    createdAt: Date.now(),
    complainant,
    anonymous,
    title: draft.title.trim(),
    description: draft.description.trim(),
    department: draft.department,
    severity: draft.severity,
    investigator: INVESTIGATOR,
    suspects: content.suspects,
    evidence: content.evidence,
    summary: content.summary,
    verdict: content.verdict,
    correctiveAction: content.correctiveAction,
    compensation: content.compensation,
    status: status.status,
    statusNote: status.note,
    mode: options.mode,
    aiModel: options.aiModel,
    reactions: { justice: 0, outrageous: 0, sameHere: 0 },
    seeded: options.seeded ?? false
  }
}

export function setCaseCounter(next: number): void {
  caseCounter = Math.max(caseCounter, next)
}

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode
} from 'react'
import type { CaseContent, CaseFile, ComplaintDraft, Reactions, SeverityId } from '../types'
import { ACHIEVEMENTS } from '../data/achievements'
import {
  addReaction as addReactionToStore,
  clearEverything,
  EMPTY_PROFILE,
  loadCases,
  loadProfile,
  saveCase,
  saveProfile,
  type Profile,
  type User
} from '../lib/storage'
import { buildCase } from '../lib/generator'

export interface Toast {
  id: number
  message: string
  tone: 'good' | 'info' | 'promo'
  title?: string
}

interface StoreValue {
  cases: CaseFile[]
  profile: Profile
  toasts: Toast[]
  ready: boolean
  notify: (message: string, tone?: Toast['tone'], title?: string) => void
  dismissToast: (id: number) => void
  fileComplaint: (
    draft: ComplaintDraft,
    content: CaseContent,
    options: { mode: 'demo' | 'ai'; aiModel?: string }
  ) => CaseFile
  react: (caseId: string, key: keyof Reactions) => void
  registerPigeonClick: () => number
  unlock: (achievementId: string) => void
  resetWorld: () => void
  setUser: (user: User | undefined) => void
  setQuestStatus: (questId: string, status: import('../lib/quests').QuestStatus) => void
  setEntered: (value: boolean) => void
}

const StoreContext = createContext<StoreValue | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cases, setCases] = useState<CaseFile[]>([])
  const [profile, setProfile] = useState<Profile>(EMPTY_PROFILE)
  const [toasts, setToasts] = useState<Toast[]>([])
  const [ready, setReady] = useState(false)
  const toastId = useRef(0)
  const timers = useRef<number[]>([])

  useEffect(() => {
    setCases(loadCases())
    setProfile(loadProfile())
    setReady(true)
    return () => {
      timers.current.forEach((id) => window.clearTimeout(id))
      timers.current = []
    }
  }, [])

  const persistProfile = useCallback((next: Profile) => {
    setProfile(next)
    saveProfile(next)
  }, [])

  const dismissToast = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const notify = useCallback(
    (message: string, tone: Toast['tone'] = 'info', title?: string) => {
      toastId.current += 1
      const id = toastId.current
      setToasts((current) => [...current.slice(-2), { id, message, tone, title }])
      const timer = window.setTimeout(() => dismissToast(id), 5200)
      timers.current.push(timer)
    },
    [dismissToast]
  )

  const unlockWith = useCallback(
    (current: Profile, achievementId: string): Profile => {
      const def = ACHIEVEMENTS[achievementId]
      if (!def || current.achievements.some((item) => item.id === achievementId)) return current
      // Surface the achievement a tick later so toasts stack predictably.
      window.setTimeout(
        () => notify(def.description, 'promo', `ACHIEVEMENT UNLOCKED — ${def.name}`),
        320
      )
      return { ...current, achievements: [...current.achievements, { ...def, unlockedAt: Date.now() }] }
    },
    [notify]
  )

  const fileComplaint = useCallback<StoreValue['fileComplaint']>(
    (draft, content, options) => {
      const caseFile = buildCase(draft, content, options)
      setCases(() => saveCase(caseFile))

      let next: Profile = { ...profile, complaintsFiled: profile.complaintsFiled + 1 }
      next = unlockWith(next, 'firstComplaint')
      if (next.complaintsFiled >= 3) next = unlockWith(next, 'threeComplaints')
      if (draft.severity === ('universe' as SeverityId)) next = unlockWith(next, 'universe')
      persistProfile(next)
      return caseFile
    },
    [persistProfile, profile, unlockWith]
  )

  const react = useCallback<StoreValue['react']>(
    (caseId, key) => {
      setCases((current) => addReactionToStore(current, caseId, key))
      const already = profile.reactionGiven[caseId]
      const next: Profile = {
        ...profile,
        reactionGiven: { ...profile.reactionGiven, [caseId]: key }
      }
      persistProfile(unlockWith(next, 'archivist'))
      if (already === key) notify('Reaction noted. Twice. The Ministry respects the repetition.', 'info')
    },
    [notify, persistProfile, profile, unlockWith]
  )

  const registerPigeonClick = useCallback(() => {
    const clicks = profile.pigeonClicks + 1
    let next: Profile = { ...profile, pigeonClicks: clicks }
    if (clicks % 5 === 0) {
      if (!next.promoted) {
        next = { ...next, promoted: true }
        notify(
          'You have been promoted to Honorary Deputy Assistant of Pigeon Affairs. There is no pay. There is a hat.',
          'promo',
          'PROMOTION'
        )
      } else {
        notify('Another promotion. The hat is now taller. This is unsustainable.', 'promo', 'PROMOTION AGAIN')
      }
      next = unlockWith(next, 'promoted')
    } else {
      const remarks = [
        'Sir Pigeon III acknowledges your poking with tremendous dignity.',
        'Please stop poking the Minister. He is doing his best.',
        'That tickled. Legally speaking, that was assault on an official.',
        'Your enthusiasm has been noted in your permanent record.'
      ]
      notify(remarks[clicks % remarks.length], 'info')
    }
    persistProfile(next)
    return clicks
  }, [notify, persistProfile, profile, unlockWith])

  const unlock = useCallback(
    (achievementId: string) => {
      persistProfile(unlockWith(profile, achievementId))
    },
    [persistProfile, profile, unlockWith]
  )

  const setUser = useCallback(
    (user: User | undefined) => {
      const next = { ...profile, user }
      persistProfile(next)
      notify(
        user ? `You are now masquerading as ${user.name}.` : 'Your mock identity has been filed in the shredder.',
        user ? 'good' : 'info',
        user ? 'IDENTITY UPDATED' : 'SIGNED OUT'
      )
    },
    [persistProfile, profile, notify]
  )

  const setQuestStatus = useCallback(
    (questId: string, status: import('../lib/quests').QuestStatus) => {
      const nextQuests = { ...(profile.quests ?? {}), [questId]: status }
      const next = { ...profile, quests: nextQuests }
      persistProfile(next)
    },
    [persistProfile, profile]
  )

  const setEntered = useCallback(
    (value: boolean) => {
      const next = { ...profile, entered: value }
      persistProfile(next)
    },
    [persistProfile, profile]
  )

  const resetWorld = useCallback(() => {
    clearEverything()
    setCases(loadCases())
    setProfile(loadProfile())
    notify('All local Ministry records have been shredded. The Archives have been reseeded.', 'info', 'RESET COMPLETE')
  }, [notify])

  const value = useMemo<StoreValue>(
    () => ({
      cases,
      profile,
      toasts,
      ready,
      notify,
      dismissToast,
      fileComplaint,
      react,
      registerPigeonClick,
      unlock,
      resetWorld,
      setUser,
      setQuestStatus,
      setEntered
    }),
    [cases, profile, toasts, ready, notify, dismissToast, fileComplaint, react, registerPigeonClick, unlock, resetWorld, setUser, setQuestStatus, setEntered]
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore(): StoreValue {
  const context = useContext(StoreContext)
  if (!context) throw new Error('useStore must be used inside <StoreProvider>')
  return context
}

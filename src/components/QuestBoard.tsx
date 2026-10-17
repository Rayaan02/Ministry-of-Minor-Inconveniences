import { ListTodo } from 'lucide-react'
import { useState } from 'react'
import { QUESTS } from '../lib/quests'
import { useStore } from '../state/store'

export function QuestBoard() {
  const { profile, setQuestStatus } = useStore()
  const [open, setOpen] = useState(false)
  const quests = profile.quests ?? {}

  function start(id: string) {
    if (quests[id] !== 'available' && quests[id] !== undefined) return
    setQuestStatus(id, 'active')
  }

  function claim(id: string) {
    setQuestStatus(id, 'claimed')
  }

  return (
    <>
      <button
        type="button"
        className="btn btn-sm btn-secondary"
        onClick={() => setOpen(true)}
      >
        <ListTodo size={13} aria-hidden="true" /> QUEST BOARD
      </button>
      {open && (
        <div
          className="fixed inset-0 z-[95] flex items-center justify-center bg-navy/80 p-3"
          onClick={() => setOpen(false)}
        >
          <div
            className="panel w-full max-w-lg p-4 max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 mb-3">
              <div>
                <p className="badge" style={{ background: 'var(--lavender)' }}>
                  MINISTERIAL QUEST BOARD
                </p>
                <p className="font-pixel text-[11px] mt-2">VERY IMPORTANT BUSINESS</p>
              </div>
              <button
                type="button"
                className="btn btn-sm"
                onClick={() => setOpen(false)}
              >
                CLOSE
              </button>
            </div>
            <div className="grid gap-2">
              {QUESTS.map((q) => {
                const st = quests[q.id] ?? 'available'
                return (
                  <article key={q.id} className="tile flex-col items-start gap-2">
                    <div className="flex items-start justify-between gap-2 w-full">
                      <div>
                        <p className="font-pixel text-[9px] leading-relaxed">{q.title}</p>
                        <p className="text-base mt-1">{q.description}</p>
                        <p className="text-base mt-1 opacity-90">
                          <strong>Objective:</strong> {q.objective}
                        </p>
                        <p className="text-base mt-1 opacity-90">
                          <strong>Reward:</strong> {q.reward}
                        </p>
                      </div>
                      <span className="badge" style={{ background: st === 'claimed' ? '#79B86A' : 'var(--cream)' }}>
                        {st.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      {st === 'available' && (
                        <button type="button" className="btn btn-sm btn-secondary" onClick={() => start(q.id)}>
                          ACCEPT QUEST
                        </button>
                      )}
                      {st === 'active' && (
                        <button type="button" className="btn btn-sm btn-wood" onClick={() => claim(q.id)}>
                          CLAIM REWARD (DEMO)
                        </button>
                      )}
                      {st === 'claimed' && (
                        <span className="text-base opacity-80">Completed. Well done, citizen.</span>
                      )}
                    </div>
                  </article>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

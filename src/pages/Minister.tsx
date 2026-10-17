import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Bird, MessageSquareQuote, Trophy } from 'lucide-react'
import { PIGEON_TOPICS } from '../data/notices'
import { useStore } from '../state/store'
import { DialogueBox } from '../components/DialogueBox'
import { PodiumProp, SirPigeon } from '../components/Sprites'

export function Minister() {
  const { profile, registerPigeonClick, notify } = useStore()
  const [topicId, setTopicId] = useState<string | null>(null)
  const [beat, setBeat] = useState(0)

  const topic = PIGEON_TOPICS.find((item) => item.id === topicId) ?? null

  return (
    <div className="min-h-screen" style={{ background: 'var(--forest-green)' }}>
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="panel-navy p-4 mb-6">
          <p className="font-pixel text-[9px]" style={{ color: 'var(--golden-yellow)' }}>
            OFFICE OF THE MINISTER
          </p>
          <h1 className="font-pixel text-[14px] md:text-[17px] mt-2" style={{ color: 'var(--warm-cream)' }}>
            MEET SIR PIGEON III
          </h1>
          <p className="text-lg mt-2">
            Supreme Deputy Assistant Minister of Unnecessary Paperwork. Extremely formal. Confident for no reason.
            Occasionally aware that he is in a video game.
          </p>
        </div>

        <div className="panel p-5">
          <div className="flex flex-col sm:flex-row gap-6 items-center">
            <button
              type="button"
              onClick={() => {
                const clicks = registerPigeonClick()
                setBeat((value) => value + 1)
                if (clicks % 5 === 0) notify('You have been promoted. There is a hat.', 'promo', 'PROMOTION')
              }}
              className="shrink-0 cursor-pointer"
              aria-label="Poke Sir Pigeon III, the Minister"
              title="Poke the Minister (five pokes = promotion)"
            >
              <PodiumProp className="w-40">
                <SirPigeon className={`w-24 ${beat % 2 === 0 ? 'anim-bob' : ''}`} />
              </PodiumProp>
            </button>

            <div className="flex-1">
              <p className="font-pixel text-[10px] mb-2">MINISTERIAL RECORD</p>
              <ul className="space-y-2 text-lg">
                <li>
                  Total pokes received: <strong>{profile.pigeonClicks}</strong>
                </li>
                <li>
                  Promotions awarded: <strong>{Math.floor(profile.pigeonClicks / 5)}</strong>
                </li>
                <li>
                  Complaints filed by you: <strong>{profile.complaintsFiled}</strong>
                </li>
                <li>
                  Achievements: <strong>{profile.achievements.length}</strong>
                </li>
              </ul>
              <p className="text-base mt-3 opacity-85">
                Poke the Minister five times for an entirely undeserved promotion. He insists this is policy.
              </p>
            </div>
          </div>

          <div className="hr-pixel" />

          <h2 className="font-pixel text-[11px] mb-3 flex items-center gap-2">
            <MessageSquareQuote size={14} aria-hidden="true" /> ASK HIM A QUESTION
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {PIGEON_TOPICS.map((item) => (
              <button
                key={item.id}
                type="button"
                className="tile"
                aria-pressed={topicId === item.id}
                onClick={() => {
                  setTopicId(item.id)
                  setBeat((value) => value + 1)
                }}
              >
                <span className="text-lg">{item.question}</span>
              </button>
            ))}
          </div>

          {topic && (
            <div className="mt-6">
              <DialogueBox
                key={topic.id}
                speaker="SIR PIGEON III"
                lines={[topic.answer]}
                portrait={<SirPigeon className="w-14" />}
                finishLabel="ASK ANOTHER"
                onFinish={() => setTopicId(null)}
              />
            </div>
          )}

          {!topic && (
            <div className="mt-6">
              <DialogueBox
                key={`idle-${beat}`}
                speaker="SIR PIGEON III"
                lines={[
                  'Welcome to my office. The chair is not for sitting. It is for appearing busy.',
                  'If you have a problem, file a form. If you have a form, file a complaint about the form. Either way, the Ministry benefits.'
                ]}
                portrait={<SirPigeon className="w-14" />}
                finishLabel="VERY WELL"
              />
            </div>
          )}

          <div className="panel-navy p-4 mt-6">
            <h2 className="font-pixel text-[10px] mb-3 flex items-center gap-2" style={{ color: 'var(--golden-yellow)' }}>
              <Trophy size={14} aria-hidden="true" /> YOUR ACHIEVEMENTS
            </h2>
            {profile.achievements.length === 0 ? (
              <p className="text-lg">
                None yet. The Ministry’s record book is empty, which is either a fresh start or an administrative failure.
              </p>
            ) : (
              <ul className="grid gap-2 sm:grid-cols-2">
                {profile.achievements.map((achievement) => (
                  <li key={achievement.id} className="text-lg">
                    <span style={{ color: 'var(--golden-yellow)' }}>★</span> <strong>{achievement.name}</strong> —{' '}
                    {achievement.description}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex flex-wrap gap-3 mt-6">
            <Link className="btn btn-primary" to="/file">
              <Bird size={15} aria-hidden="true" /> FILE A COMPLAINT
            </Link>
            <Link className="btn btn-secondary" to="/">
              RETURN TO THE VILLAGE
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Archive,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Bell,
  Bird,
  Compass,
  FilePlus2,
  LogIn,
  LogOut,
  Menu as MenuIcon,
  RotateCcw,
  User,
  X
} from 'lucide-react'
import { CITIZEN_SPRITES } from './art'
import { DialogueBox } from '../components/DialogueBox'
import { AuthModal } from '../components/AuthModal'
import { InWorldArchives } from '../components/InWorldArchives'
import { InWorldMinister } from '../components/InWorldMinister'
import { InWorldMinistry } from '../components/InWorldMinistry'
import { InWorldNotices } from '../components/InWorldNotices'
import { QuestBoard } from '../components/QuestBoard'
import { useReducedMotion } from '../lib/useReducedMotion'
import { useStore } from '../state/store'
import {
  buildVillage,
  blocked,
  npcSolid,
  zoneNear,
  WORLD_H,
  WORLD_W,
  type Facing,
  type Npc,
  type Rect,
  type Village,
  type Zone
} from './map'
import { drawGround, drawMarker, drawShadow, drawSprite } from './render'

const PLAYER_SPEED = 76
const POSITION_KEY = 'mmi:world:position'

/** Opt-in hook (?debug=1) that lets automated checks drive frames without requestAnimationFrame. */
const DEBUG = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('debug')

type Dir = 'up' | 'down' | 'left' | 'right'

interface Player {
  x: number
  y: number
  facing: Facing
  moving: boolean
  anim: number
}

interface Transition {
  label: string
  route: string
}

declare global {
  interface Window {
    __mmiWorld?: {
      tick: (now: number) => void
      player: Player
      village: Village
      npcs: Npc[]
      camera: { current: { x: number; y: number } }
      keys: { current: Record<Dir, boolean> }
      interact: () => void
      zone: () => Zone | null
    }
  }
}

function loadPosition(): { x: number; y: number } | null {
  try {
    const raw = window.sessionStorage.getItem(POSITION_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { x: number; y: number }
    if (typeof parsed.x !== 'number' || typeof parsed.y !== 'number') return null
    return parsed
  } catch {
    return null
  }
}

function playerBox(x: number, y: number): Rect {
  return { x: Math.round(x) - 6, y: Math.round(y) - 8, w: 12, h: 8 }
}

function facingSprite(facing: Facing) {
  if (facing === 'up') return CITIZEN_SPRITES.back
  if (facing === 'left') return CITIZEN_SPRITES.left
  if (facing === 'right') return CITIZEN_SPRITES.side
  return CITIZEN_SPRITES.front
}

function npcSprite(npc: Npc) {
  if (npc.id === 'citizen') return facingSprite(npc.facing)
  return npc.sprite
}

export function WorldCanvas() {
  const navigate = useNavigate()
  const reduced = useReducedMotion()
  const { profile, cases, resetWorld, setUser } = useStore()

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const keysRef = useRef<Record<Dir, boolean>>({ up: false, down: false, left: false, right: false })
  const clickTargetRef = useRef<{ x: number; y: number } | null>(null)
  const viewRef = useRef({ zoom: 3, viewW: 380, viewH: 200, dpr: 1 })
  const camRef = useRef({ x: 0, y: 0 })
  const activeZoneRef = useRef<Zone | null>(null)
  const pausedRef = useRef(false)
  const interactRef = useRef<() => void>(() => {})

  const [prompt, setPrompt] = useState<{ id: string; label: string } | null>(null)
  const [location, setLocation] = useState('Village Square')
  const [menuOpen, setMenuOpen] = useState(false)
  const [dialogue, setDialogue] = useState<Zone['dialogue'] | null>(null)
  const [transition, setTransition] = useState<Transition | null>(null)
  const [touch, setTouch] = useState(false)
  const [greeted, setGreeted] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const [inworld, setInworld] = useState<'ministry' | 'archives' | 'notices' | 'minister' | null>(null)

  const village = useRef<Village | null>(null)
  const player = useRef<Player>({ x: 424, y: 158, facing: 'down', moving: false, anim: 0 })
  const npcs = useRef<Npc[]>([])
  const mountTime = useRef(performance.now())

  /* ---------------- setup ---------------- */
  if (!village.current) {
    const built = buildVillage()
    village.current = built
    npcs.current = built.npcs.map((npc) => ({ ...npc }))
    const saved = loadPosition()
    if (saved) {
      player.current.x = saved.x
      player.current.y = saved.y
    } else {
      player.current.x = built.spawn.x
      player.current.y = built.spawn.y
    }
    camRef.current.x = Math.max(0, Math.min(WORLD_W - 380, player.current.x - 190))
    camRef.current.y = Math.max(0, Math.min(WORLD_H - 200, player.current.y - 100))
  }

  useEffect(() => {
    setTouch(window.matchMedia('(hover: none)').matches || navigator.maxTouchPoints > 0)
  }, [])

  useEffect(() => {
    pausedRef.current = menuOpen || dialogue !== null || transition !== null
  }, [menuOpen, dialogue, transition])

  useEffect(() => {
    setLocation(village.current ? village.current.locationAt(player.current.x, player.current.y) : 'Village Square')
    const timer = window.setTimeout(() => setGreeted(true), 6000)
    return () => window.clearTimeout(timer)
  }, [])

  /* ---------------- transitions between pages ---------------- */
  const enterRoute = useCallback(
    (route: string, label: string) => {
      if (reduced) {
        navigate(route)
        return
      }
      setTransition({ label, route })
    },
    [navigate, reduced]
  )

  useEffect(() => {
    if (!transition) return
    const timer = window.setTimeout(() => navigate(transition.route), 460)
    return () => window.clearTimeout(timer)
  }, [transition, navigate])

  /* ---------------- interaction ---------------- */
  const interact = useCallback(() => {
    const zone = activeZoneRef.current
    if (!zone) return
    if (zone.route) {
      enterRoute(zone.route, zone.label)
      return
    }
    if (zone.dialogue) {
      keysRef.current = { up: false, down: false, left: false, right: false }
      setDialogue(zone.dialogue)
    }
  }, [enterRoute])

  interactRef.current = interact

  /* ---------------- keyboard ---------------- */
  useEffect(() => {
    const isTypingTarget = (target: EventTarget | null) => {
      const element = target as HTMLElement | null
      if (!element || !element.tagName) return false
      const tag = element.tagName.toLowerCase()
      return tag === 'input' || tag === 'textarea' || tag === 'select' || element.isContentEditable
    }

    const keyToDir = (key: string): Dir | null => {
      if (key === 'arrowup' || key === 'w') return 'up'
      if (key === 'arrowdown' || key === 's') return 'down'
      if (key === 'arrowleft' || key === 'a') return 'left'
      if (key === 'arrowright' || key === 'd') return 'right'
      return null
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (isTypingTarget(event.target)) return
      const key = event.key.toLowerCase()

      if (key === 'escape') {
        setMenuOpen(false)
        setDialogue(null)
        return
      }
      if (key === 'm') {
        if (!dialogue) setMenuOpen((value) => !value)
        return
      }
      if (menuOpen || dialogue) return

      const dir = keyToDir(key)
      if (dir) {
        event.preventDefault()
        keysRef.current[dir] = true
        clickTargetRef.current = null
        return
      }
      if (key === 'e' || key === 'enter' || key === ' ') {
        event.preventDefault()
        interactRef.current()
      }
    }

    const onKeyUp = (event: KeyboardEvent) => {
      if (isTypingTarget(event.target)) return
      const dir = keyToDir(event.key.toLowerCase())
      if (dir) keysRef.current[dir] = false
    }

    const onBlur = () => {
      keysRef.current = { up: false, down: false, left: false, right: false }
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('blur', onBlur)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('blur', onBlur)
    }
  }, [dialogue, menuOpen])

  /* ---------------- resize ---------------- */
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const resize = () => {
      const cssW = Math.max(240, container.clientWidth)
      const cssH = Math.max(240, container.clientHeight)
      const byWidth = Math.round(cssW / 460)
      const byHeight = Math.round(cssH / 165)
      const zoom = Math.max(2, Math.min(3, Math.min(byWidth, byHeight)))
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      viewRef.current = { zoom, viewW: cssW / zoom, viewH: cssH / zoom, dpr }
      const canvas = canvasRef.current
      if (canvas) {
        canvas.width = Math.round(cssW * dpr)
        canvas.height = Math.round(cssH * dpr)
        canvas.style.width = `${cssW}px`
        canvas.style.height = `${cssH}px`
      }
    }
    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(container)
    window.addEventListener('orientationchange', resize)
    return () => {
      observer.disconnect()
      window.removeEventListener('orientationchange', resize)
    }
  }, [])

  /* ---------------- pointer-to-walk ---------------- */
  const onCanvasPointerDown = useCallback((event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (pausedRef.current) return
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const { zoom } = viewRef.current
    const worldX = (event.clientX - rect.left) / zoom + camRef.current.x
    const worldY = (event.clientY - rect.top) / zoom + camRef.current.y
    clickTargetRef.current = { x: worldX, y: worldY }
  }, [])

  /* ---------------- main loop ---------------- */
  useEffect(() => {
    let frame = 0
    let last = performance.now()
    let hintShown = false

    const tick = (now: number) => {
      const built = village.current
      const canvas = canvasRef.current
      if (!built || !canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      const time = (now - mountTime.current) / 1000
      const { zoom, viewW, viewH, dpr } = viewRef.current
      const paused = pausedRef.current
      const me = player.current

      /* ---- movement ---- */
      let dx = (keysRef.current.right ? 1 : 0) - (keysRef.current.left ? 1 : 0)
      let dy = (keysRef.current.down ? 1 : 0) - (keysRef.current.up ? 1 : 0)

      const clickTarget = clickTargetRef.current
      if (dx === 0 && dy === 0 && clickTarget) {
        const tx = clickTarget.x - me.x
        const ty = clickTarget.y - me.y
        if (Math.abs(tx) < 4 && Math.abs(ty) < 4) {
          clickTargetRef.current = null
        } else if (Math.abs(tx) > Math.abs(ty)) {
          dx = Math.sign(tx)
          if (Math.abs(ty) > 3) dy = Math.sign(ty) * 0.6
        } else {
          dy = Math.sign(ty)
          if (Math.abs(tx) > 3) dx = Math.sign(tx) * 0.6
        }
      }

      if (!paused && (dx !== 0 || dy !== 0)) {
        const length = Math.hypot(dx, dy) || 1
        const stepX = (dx / length) * PLAYER_SPEED * dt
        const stepY = (dy / length) * PLAYER_SPEED * dt
        const others: Rect[] = npcs.current.map(npcSolid)

        const tryX = playerBox(me.x + stepX, me.y)
        if (!blocked(built, tryX, others)) me.x += stepX
        const tryY = playerBox(me.x, me.y + stepY)
        if (!blocked(built, tryY, others)) me.y += stepY

        if (Math.abs(dx) > Math.abs(dy)) me.facing = dx > 0 ? 'right' : 'left'
        else me.facing = dy > 0 ? 'down' : 'up'

        me.moving = true
        me.anim += dt
        if (!hintShown) {
          hintShown = true
          setGreeted(true)
        }
      } else {
        me.moving = false
      }

      /* ---- NPCs ---- */
      npcs.current.forEach((npc) => {
        if (!npc.wander || npc.speed <= 0) return
        npc.think -= dt
        const dxTo = npc.targetX - npc.x
        const dyTo = npc.targetY - npc.y
        if (npc.think <= 0 || (Math.abs(dxTo) < 3 && Math.abs(dyTo) < 3)) {
          npc.think = 2.5 + Math.random() * 3
          npc.targetX = npc.wander.x + Math.random() * npc.wander.w
          npc.targetY = npc.wander.y + Math.random() * npc.wander.h
          return
        }
        const steps = Math.max(Math.abs(dxTo), Math.abs(dyTo)) || 1
        const moveX = (dxTo / steps) * npc.speed * dt
        const moveY = (dyTo / steps) * npc.speed * dt
        const extra: Rect[] = [playerBox(me.x, me.y), ...npcs.current.filter((other) => other !== npc).map(npcSolid)]
        const boxX = npcSolid({ ...npc, x: npc.x + moveX })
        if (!blocked(built, boxX, extra)) npc.x += moveX
        const boxY = npcSolid({ ...npc, y: npc.y + moveY })
        if (!blocked(built, boxY, extra)) npc.y += moveY
        if (Math.abs(dxTo) > Math.abs(dyTo)) npc.facing = dxTo > 0 ? 'right' : 'left'
        else npc.facing = dyTo > 0 ? 'down' : 'up'
      })

      /* ---- camera ---- */
      const targetX = Math.max(0, Math.min(WORLD_W - viewW, me.x - viewW / 2))
      const targetY = Math.max(0, Math.min(WORLD_H - viewH, me.y - viewH / 2))
      const ease = paused ? 1 : Math.min(1, dt * 9)
      camRef.current.x += (targetX - camRef.current.x) * ease
      camRef.current.y += (targetY - camRef.current.y) * ease
      const camX = Math.round(camRef.current.x)
      const camY = Math.round(camRef.current.y)

      /* ---- draw ---- */
      ctx.setTransform(dpr * zoom, 0, 0, dpr * zoom, 0, 0)
      ctx.imageSmoothingEnabled = false
      ctx.clearRect(0, 0, viewW, viewH)
      ctx.translate(-camX, -camY)

      drawGround(ctx, built, camX, camY, viewW, viewH, time, !reduced)

      interface Drawable {
        depth: number
        x: number
        y: number
        sprite: ReturnType<typeof facingSprite>
        width: number
        bob: number
      }

      const drawables: Drawable[] = []
      built.objects.forEach((object) => {
        drawables.push({
          depth: object.y + object.sprite.grid.h,
          x: object.x,
          y: object.y,
          sprite: object.sprite,
          width: object.sprite.grid.w,
          bob: 0
        })
      })
      npcs.current.forEach((npc) => {
        const sprite = npcSprite(npc)
        drawables.push({ depth: npc.y, x: npc.x - sprite.grid.w / 2, y: npc.y - sprite.grid.h, sprite, width: sprite.grid.w, bob: 0 })
      })
      const meSprite = facingSprite(me.facing)
      const bob = me.moving && !reduced ? (Math.floor(me.anim * 7) % 2 === 0 ? -1 : 0) : 0
      drawables.push({ depth: me.y, x: me.x - meSprite.grid.w / 2, y: me.y - meSprite.grid.h + bob, sprite: meSprite, width: meSprite.grid.w, bob: 0 })
      drawables.sort((a, b) => a.depth - b.depth)

      drawables.forEach((item) => {
        drawShadow(ctx, item.x + item.width / 2, item.depth, item.width * 0.6)
        drawSprite(ctx, item.sprite, item.x, item.y)
      })

      /* ---- interaction markers + prompt ---- */
      const zone = zoneNear(built, me.x, me.y)
      if (zone) {
        drawMarker(ctx, zone.x, zone.y - 6, time, !reduced)
      }
      built.zones.forEach((other) => {
        if (other === zone) return
        const far = Math.hypot(other.x - me.x, other.y - me.y)
        if (far < other.radius + 40) drawMarker(ctx, other.x, other.y - 6, time, !reduced)
      })

      if ((zone?.id ?? null) !== (activeZoneRef.current?.id ?? null)) {
        activeZoneRef.current = zone
        setPrompt(zone ? { id: zone.id, label: zone.label } : null)
      }

      const nextLocation = built.locationAt(me.x, me.y)
      setLocation((current) => (current === nextLocation ? current : nextLocation))
    }

    let fallback = 0
    let lastFrameAt = performance.now()

    const loop = (now: number) => {
      frame = window.requestAnimationFrame(loop)
      lastFrameAt = performance.now()
      tick(now)
    }

    frame = window.requestAnimationFrame(loop)

    // Embedded preview panes can keep the document hidden, which suspends
    // requestAnimationFrame completely. Drive frames from a timer as a fallback.
    fallback = window.setInterval(() => {
      if (performance.now() - lastFrameAt > 300) tick(performance.now())
    }, 33)

    if (DEBUG && village.current) {
      window.__mmiWorld = {
        tick,
        player: player.current,
        village: village.current,
        npcs: npcs.current,
        camera: camRef,
        keys: keysRef,
        interact: () => interactRef.current(),
        zone: () => activeZoneRef.current
      }
    }

    return () => {
      window.cancelAnimationFrame(frame)
      window.clearInterval(fallback)
      if (DEBUG) delete window.__mmiWorld
    }
  }, [reduced])

  /* ---------------- persist position ---------------- */
  useEffect(() => {
    const save = () => {
      try {
        window.sessionStorage.setItem(POSITION_KEY, JSON.stringify({ x: player.current.x, y: player.current.y }))
      } catch {
        /* storage unavailable — position simply does not persist */
      }
    }
    window.addEventListener('beforeunload', save)
    return () => {
      save()
      window.removeEventListener('beforeunload', save)
    }
  }, [])

  /* ---------------- on-screen controls ---------------- */
  const press = useCallback((dir: Dir) => {
    keysRef.current[dir] = true
    clickTargetRef.current = null
  }, [])
  const release = useCallback((dir: Dir) => {
    keysRef.current[dir] = false
  }, [])

  const aiCase = cases.find((item) => item.mode === 'ai')
  const dirButton = 'flex h-14 w-14 items-center justify-center border-4 border-navy bg-paper active:bg-gold'

  return (
    <section className="relative mx-auto w-full max-w-[1200px] px-2 py-3 sm:px-4" aria-label="Village of Nowhere-in-Particular">
      <div
        className="relative overflow-hidden border-4 border-navy bg-grass"
        style={{ background: '#79B86A' }}
      >
        <div ref={containerRef} className="relative h-[clamp(340px,66vh,620px)] w-full">
          <canvas
            ref={canvasRef}
            onPointerDown={onCanvasPointerDown}
            className="absolute inset-0 block h-full w-full touch-none"
            style={{ imageRendering: 'pixelated' }}
            role="img"
            aria-label={`Pixel-art village. You are at ${location}.`}
          />

          {/* ---- HUD: top bar ---- */}
          <div className="pointer-events-none absolute inset-x-0 top-0 flex flex-wrap items-start justify-between gap-2 p-2">
            <div className="pointer-events-auto panel-tight panel px-2 py-1.5 max-w-[62%]">
              <p className="font-pixel text-[8px] leading-relaxed">MINISTRY OF MINOR INCONVENIENCES</p>
              <p className="flex items-center gap-1.5 text-base leading-tight mt-0.5">
                <Compass size={13} aria-hidden="true" /> {location}
              </p>
            </div>

            <div className="pointer-events-auto flex items-center gap-1.5 flex-wrap justify-end">
              {profile.user && (
                <span className="badge hidden sm:inline-flex" style={{ background: 'var(--golden-yellow)' }}>
                  <User size={11} aria-hidden="true" /> {profile.user.name}
                </span>
              )}
              <span className="badge hidden sm:inline-flex" style={{ background: 'var(--sky-blue)' }}>
                <Archive size={11} aria-hidden="true" /> {profile.complaintsFiled} FILED
              </span>
              <span className="badge" style={{ background: aiCase ? 'var(--lavender)' : 'var(--cream)' }}>
                {aiCase ? 'AI-ASSISTED' : 'DEMO MODE'}
              </span>
              <QuestBoard />
              <button
                type="button"
                className="btn btn-sm btn-secondary"
                onClick={() => setMenuOpen(true)}
                aria-expanded={menuOpen}
              >
                <MenuIcon size={13} aria-hidden="true" /> MENU
              </button>
            </div>
          </div>

          {/* ---- HUD: prompt ---- */}
          <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center px-2" role="status" aria-live="polite">
            {prompt ? (
              <button
                type="button"
                onClick={interact}
                className="pointer-events-auto btn btn-sm btn-primary anim-pop"
              >
                <span className="badge" style={{ background: 'var(--cream)', padding: '1px 5px', borderWidth: 2 }}>
                  {touch ? 'TAP' : 'E'}
                </span>
                {prompt.label.toUpperCase()}
              </button>
            ) : (
              greeted && (
                <p className="panel panel-tight px-2 py-1 text-base text-center">
                  {touch ? 'Use the D-pad to walk. Tap a spot to walk there.' : 'ARROWS or WASD to walk · E to interact · M for menu'}
                </p>
              )
            )}
          </div>

          {/* ---- HUD: touch controls ---- */}
          {touch && (
            <div className="absolute bottom-16 right-3 flex flex-col items-end gap-2">
              <button type="button" className={dirButton} aria-label="Walk up" onPointerDown={() => press('up')} onPointerUp={() => release('up')} onPointerLeave={() => release('up')} onPointerCancel={() => release('up')}>
                <ArrowUp size={20} aria-hidden="true" />
              </button>
              <div className="flex gap-2">
                <button type="button" className={dirButton} aria-label="Walk left" onPointerDown={() => press('left')} onPointerUp={() => release('left')} onPointerLeave={() => release('left')} onPointerCancel={() => release('left')}>
                  <ArrowLeft size={20} aria-hidden="true" />
                </button>
                <button type="button" className={dirButton} aria-label="Walk down" onPointerDown={() => press('down')} onPointerUp={() => release('down')} onPointerLeave={() => release('down')} onPointerCancel={() => release('down')}>
                  <ArrowDown size={20} aria-hidden="true" />
                </button>
                <button type="button" className={dirButton} aria-label="Walk right" onPointerDown={() => press('right')} onPointerUp={() => release('right')} onPointerLeave={() => release('right')} onPointerCancel={() => release('right')}>
                  <ArrowRight size={20} aria-hidden="true" />
                </button>
              </div>
              {prompt && (
                <button type="button" className="btn btn-sm btn-primary" onClick={interact}>
                  ACTION
                </button>
              )}
            </div>
          )}

          {/* ---- screens ---- */}
          {transition && (
            <div className="absolute inset-0 z-30 flex items-center justify-center bg-navy" aria-hidden="true">
              <div className="anim-pop panel px-4 py-3 text-center">
                <p className="font-pixel text-[10px] mb-1">{transition.label.toUpperCase()}</p>
                <p className="text-base">A clerk is stamping something. Please wait.</p>
              </div>
            </div>
          )}

          {dialogue && (
            <div className="absolute inset-x-0 bottom-0 z-30 p-3 sm:p-5">
              <div className="mx-auto max-w-2xl">
                <DialogueBox
                  speaker={dialogue.speaker}
                  lines={dialogue.lines}
                  accent={
                    dialogue.speaker.includes('SIR PIGEON')
                      ? 'var(--coral-red)'
                      : dialogue.speaker.includes('GUARD')
                        ? 'var(--forest-green)'
                        : dialogue.speaker.includes('SIGN') || dialogue.speaker.includes('LOST')
                          ? 'var(--wood-brown)'
                          : 'var(--sky-blue)'
                  }
                  finishLabel="GOODBYE"
                  onFinish={() => setDialogue(null)}
                />
                {dialogue.actions && (
                  <div className="mt-2 flex flex-wrap gap-2 justify-end">
                    {dialogue.actions.map((action) => (
                      <button
                        key={action.route}
                        type="button"
                        className="btn btn-sm btn-lavender"
                        onClick={() => {
                          const label = action.label
                          setDialogue(null)
                          enterRoute(action.route, label)
                        }}
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {menuOpen && (
            <div className="absolute inset-0 z-40 flex items-center justify-center bg-navy/80 p-3">
              <div className="panel w-full max-w-md max-h-full overflow-y-auto p-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="font-pixel text-[10px]">MINISTRY MENU</p>
                    <p className="text-base mt-1">Where would you like to be inconvenienced?</p>
                  </div>
                  <button type="button" className="btn btn-sm" onClick={() => setMenuOpen(false)} aria-label="Close menu">
                    <X size={14} aria-hidden="true" />
                  </button>
                </div>

                <ul className="grid gap-2">
                  {[
                    { to: '/file', label: 'FILE A COMPLAINT', icon: FilePlus2, hint: 'Form 44-B, in triplicate, emotionally.' },
                    { to: '/archives', label: 'THE ARCHIVES', icon: Archive, hint: 'Other people’s grievances, filed forever.' },
                    { to: '/notices', label: 'NOTICE BOARD', icon: Bell, hint: 'Announcements nobody asked for.' },
                    { to: '/minister', label: 'MEET THE MINISTER', icon: Bird, hint: 'Sir Pigeon III, in his natural habitat.' }
                  ].map((item) => {
                    const Icon = item.icon
                    return (
                      <li key={item.to}>
                        <button type="button" className="tile" onClick={() => navigate(item.to)}>
                          <span className="font-pixel text-[9px] flex items-center gap-2">
                            <Icon size={13} aria-hidden="true" /> {item.label}
                          </span>
                          <span className="text-base opacity-90">{item.hint}</span>
                        </button>
                      </li>
                    )
                  })}
                </ul>

                <div className="hr-pixel" />

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-base max-w-[18rem]">
                      Your progress is stored in this browser only. Fictional satire — no real government was inconvenienced.
                    </p>
                    {profile.user && (
                      <p className="text-base mt-1 opacity-90">
                        Signed in as {profile.user.name} ({profile.user.provider})
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <QuestBoard />
                    {profile.user ? (
                      <button
                        type="button"
                        className="btn btn-sm btn-wood"
                        onClick={() => {
                          setUser(undefined)
                          setMenuOpen(false)
                        }}
                      >
                        <LogOut size={13} aria-hidden="true" /> SIGN OUT
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-sm btn-secondary"
                        onClick={() => {
                          setMenuOpen(false)
                          setAuthOpen(true)
                        }}
                      >
                        <LogIn size={13} aria-hidden="true" /> SIGN IN WITH GOOGLE/APPLE
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn btn-sm btn-wood"
                      onClick={() => {
                        resetWorld()
                        setMenuOpen(false)
                      }}
                    >
                      <RotateCcw size={13} aria-hidden="true" /> RESET WORLD
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <p className="mt-2 text-base flex flex-wrap items-center gap-x-3 gap-y-1 justify-center text-center">
        <span className="badge" style={{ background: 'var(--golden-yellow)' }}>
          {touch ? 'TAP TO WALK' : 'WASD / ARROWS'}
        </span>
        <span>
          Walk up to the Ministry, the Archives, the Notice Board — or Sir Pigeon III — and press {touch ? 'ACTION' : 'E'}.
        </span>
      </p>

      <nav aria-label="All Ministry pages" className="sr-only">
        <ul>
          <li>
            <a href="#/file">File a complaint</a>
          </li>
          <li>
            <a href="#/archives">The Archives</a>
          </li>
          <li>
            <a href="#/notices">Notice board</a>
          </li>
          <li>
            <a href="#/minister">Meet the Minister</a>
          </li>
        </ul>
      </nav>

      <InWorldMinistry open={inworld === 'ministry'} onClose={() => setInworld(null)} />
      <InWorldArchives open={inworld === 'archives'} onClose={() => setInworld(null)} />
      <InWorldNotices open={inworld === 'notices'} onClose={() => setInworld(null)} />
      <InWorldMinister open={inworld === 'minister'} onClose={() => setInworld(null)} />
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} onSuccess={() => setAuthOpen(false)} />
    </section>
  )
}

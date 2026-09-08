/**
 * =============================================================================
 *  MOTION VOCABULARY
 * =============================================================================
 *  Apple describes springs with two designer-facing numbers instead of the
 *  physics triplet (mass / stiffness / damping):
 *
 *    · damping ratio — overshoot. 1.0 = critically damped (no bounce).
 *    · response      — how quickly the value reaches the target, in seconds.
 *                      NOT a duration; a spring has no fixed duration.
 *
 *  `spring()` below integrates exactly that model, so the whole site's motion
 *  is described in these two numbers and nothing else.
 *
 *  House rule: critically damped by default. Overshoot is reserved for motion
 *  the user's own gesture put in flight — a flick, a throw, a drag release.
 *  Bounce on a menu that merely faded in reads as decoration; bounce on a card
 *  you threw reads as physics.
 * =============================================================================
 */

/**
 * Spring presets as Apple describes them: a damping ratio and a response time.
 * `dampingRatio` 1 is critically damped (no overshoot); `response` is how long
 * the value takes to reach the target, not a duration — a spring has none.
 */
export const springs = {
  /** Repositioning, reveals, layout settles. */
  default: { dampingRatio: 1, response: 0.4 },
  /** Small, frequent changes that must feel instant. */
  snappy: { dampingRatio: 1, response: 0.25 },
  /** Drawers and sheets the user can throw. */
  drawer: { dampingRatio: 0.8, response: 0.3 },
  /** Landings after a flick. */
  momentum: { dampingRatio: 0.8, response: 0.4 },
} as const

type SpringOptions = {
  from: number
  to: number
  /** Release velocity in px/s — this is what removes the seam between a drag
   *  and the animation that follows it. */
  velocity?: number
  dampingRatio?: number
  response?: number
  onUpdate: (value: number) => void
  onComplete?: () => void
}

/**
 * A spring, integrated per animation frame.
 *
 * This is the standard second-order model Apple's `response`/`dampingRatio`
 * describes: acceleration = -ω²x - 2ζωv. Around twenty lines replaces an
 * animation library that cost 42 KB gzipped and a measurable slice of hydration
 * time on every page — for the one interaction on this site that genuinely
 * needs physics.
 *
 * Returns a cancel function. Cancelling mid-flight and starting a new spring
 * from the current value and velocity is what makes the motion interruptible.
 */
export function spring({
  from,
  to,
  velocity = 0,
  dampingRatio = 1,
  response = 0.4,
  onUpdate,
  onComplete,
}: SpringOptions): () => void {
  const omega = (2 * Math.PI) / response
  let offset = from - to
  let v = velocity
  let last = performance.now()
  let frame = 0

  const tick = (now: number) => {
    // Clamp dt so a backgrounded tab does not integrate one enormous step
    const dt = Math.min((now - last) / 1000, 1 / 30)
    last = now

    const acceleration = -omega * omega * offset - 2 * dampingRatio * omega * v
    v += acceleration * dt
    offset += v * dt

    // Settled: within half a pixel and effectively still
    if (Math.abs(offset) < 0.5 && Math.abs(v) < 10) {
      onUpdate(to)
      onComplete?.()
      return
    }

    onUpdate(to + offset)
    frame = requestAnimationFrame(tick)
  }

  frame = requestAnimationFrame(tick)
  return () => cancelAnimationFrame(frame)
}

/**
 * Where a flick would come to rest, using the same exponential decay as native
 * scroll. Snap to the target nearest THIS point, not nearest the release point
 * — that is what makes a small flick throw an element a long way.
 *
 * (The textbook v²/2a form is not what Apple ships; this is the decay form from
 * the Designing Fluid Interfaces sample code.)
 *
 * @param velocity      px per second at release
 * @param deceleration  0.998 ≈ normal scroll feel, 0.99 ≈ snappier
 */
export function project(velocity: number, deceleration = 0.998): number {
  return ((velocity / 1000) * deceleration) / (1 - deceleration)
}

/**
 * Progressive resistance past a boundary. A hard stop reads as "frozen"; easing
 * resistance reads as "responsive, but there is nothing more here."
 *
 * @param overshoot  how far past the bound the pointer has travelled
 * @param dimension  the size of the surface being dragged
 */
export function rubberband(overshoot: number, dimension: number, constant = 0.55): number {
  return (overshoot * dimension * constant) / (dimension + constant * Math.abs(overshoot))
}

/**
 * A gesture must clear a small threshold before it commits to a direction, so a
 * tap that wobbles by a pixel is still a tap.
 */
export const GESTURE_THRESHOLD_PX = 10

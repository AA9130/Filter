import type { Transition } from 'framer-motion'

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
 *  Motion exposes exactly these as `bounce` (inverse of damping ratio) and
 *  `visualDuration` (time to first reach the target, independent of settling).
 *
 *  House rule: critically damped by default. Overshoot is reserved for motion
 *  the user's own gesture put in flight — a flick, a throw, a drag release.
 *  Bounce on a menu that merely faded in reads as decoration; bounce on a card
 *  you threw reads as physics.
 * =============================================================================
 */

/** damping 1.0 · response 0.4 — repositioning, reveals, layout settles. */
export const springDefault: Transition = {
  type: 'spring',
  bounce: 0,
  visualDuration: 0.4,
}

/** damping 1.0 · response 0.25 — small, frequent UI changes that must feel instant. */
export const springSnappy: Transition = {
  type: 'spring',
  bounce: 0,
  visualDuration: 0.25,
}

/** damping ~0.8 · response 0.3 — drawers and sheets the user can throw. */
export const springDrawer: Transition = {
  type: 'spring',
  bounce: 0.2,
  visualDuration: 0.3,
}

/** damping ~0.8 · response 0.4 — momentum landings after a flick. */
export const springMomentum: Transition = {
  type: 'spring',
  bounce: 0.2,
  visualDuration: 0.4,
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

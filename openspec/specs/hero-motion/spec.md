# hero-motion Specification

## Purpose

Vanilla scroll/pointer motion (reveals, hero parallax, magnetic CTAs, header state) with zero dependencies, gated on fine-pointer and no-reduced-motion.

## Requirements

### Requirement: Scroll Reveals

Sections with `data-reveal` MUST fade/translate `24px → 0` over `0.7s` once via IntersectionObserver, using transform/opacity only. Under reduced-motion they SHALL appear instantly with no transition.

#### Scenario: Reveal on entry

- GIVEN a `data-reveal` section below the fold
- WHEN it enters the viewport
- THEN it animates once to full opacity at final position.

#### Scenario: Reduced-motion instant

- GIVEN `prefers-reduced-motion: reduce`
- WHEN a `data-reveal` section renders
- THEN it is immediately visible with no animation.

### Requirement: Hero Scroll Parallax

Hero copy MUST translate at `scrollY * 0.12` and fade to `0` by ~60vh; disabled entirely under reduced-motion.

#### Scenario: Parallax fade

- GIVEN a visitor scrolls the hero
- WHEN scroll passes toward 60vh
- THEN copy shifts proportionally and fades without layout shift.

### Requirement: Magnetic CTAs

CTAs MUST pull ≤6px toward a fine-pointer cursor with rAF throttle and spring back on leave; disabled under reduced-motion or coarse pointers.

#### Scenario: Magnetic pull and release

- GIVEN a fine-pointer hover on a CTA
- WHEN the cursor moves within range then leaves
- THEN the CTA translates toward it (≤6px) and returns to rest.

### Requirement: Header Scroll State

The header MUST gain `.scrolled` (stronger blur + border) past 24px scrollY.

#### Scenario: Scrolled header

- GIVEN top of page vs scrolled 30px
- WHEN states are compared
- THEN `.scrolled` is absent at top and present after 24px.

### Requirement: Reduced-Motion Hopf Canvas

The 2D Hopf loop MUST render exactly one frame at rest under `prefers-reduced-motion: reduce` with zero rAF, sr-only status and no visible banner, plus exactly one `renderOnce` frame per pointermove.

#### Scenario: Single frame zero rAF

- GIVEN `prefers-reduced-motion: reduce`
- WHEN the hero rests with no input
- THEN one 2D frame is visible; no rAF loop, timers, or autoplay run.

#### Scenario: Pointer-driven frames

- GIVEN the reduced-motion frame is shown
- WHEN the pointer moves over the hero
- THEN the system SHALL render one frame per move via `renderOnce`.

#### Scenario: Screen-reader status only

- GIVEN the reduced-motion hero
- WHEN status is inspected
- THEN the message is sr-only; no visible banner overlays the hero.

### Requirement: Explicit Consent Motion Override

The system MUST allow explicit `on` to run full rAF drift under OS RM and explicit `off` to hold a still frame without OS RM; `auto` MUST preserve existing reduced-motion behavior. Override MUST apply only to Hopf canvas; reveal/parallax/magnetic CSS RM rules SHALL NOT change. `on` MUST result only from direct toggle gesture.

#### Scenario: On forces drift under RM

- GIVEN OS RM is `reduce` and mode is `on`
- WHEN hero runs
- THEN rAF drift loop runs; pointer frames still apply.

#### Scenario: Off forces still without RM

- GIVEN OS RM is off and mode is `off`
- WHEN hero runs
- THEN exactly one frame shows with zero rAF (pointer single-frames allowed).

#### Scenario: Auto preserves current behavior

- GIVEN mode is `auto`
- WHEN OS RM is on vs off
- THEN still+pointer-frames vs full drift respectively, byte-identical to today.

#### Scenario: Non-canvas motion untouched

- GIVEN mode is `on` under OS RM
- WHEN reveals/parallax/magnetic render
- THEN they remain disabled/instant per existing RM rules.

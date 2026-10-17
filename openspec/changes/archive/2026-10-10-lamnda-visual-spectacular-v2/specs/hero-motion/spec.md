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

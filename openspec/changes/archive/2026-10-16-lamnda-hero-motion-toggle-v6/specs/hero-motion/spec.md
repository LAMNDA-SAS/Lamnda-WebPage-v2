# Delta for hero-motion

## ADDED Requirements

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

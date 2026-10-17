# Delta for services-content

## ADDED Requirements

### Requirement: Collections-Backed Services

Service, pillar, vision, and mission content MUST load from content collections (`title, pillar, priority, summary, bullets, lang`) so official texts swap via md files with no code change.

#### Scenario: Content swap without code

- GIVEN an editor replaces `src/content/services/*.md`
- WHEN the static build reruns
- THEN updated titles/summaries render with zero source-code edits.

### Requirement: Priority Full Cards and Summary Cards

The system MUST render 4 full cards (Notificaciones Inteligentes [1], Documentación Automatizada [2], Lead Scoring [5], Dashboards Dinámicos [7]) and 3 summary cards (Bots CRM, Tele-Agentes IA, Marketing Bots); Dashboards Dinámicos MUST use a CSS/SVG mock, never real product data.

#### Scenario: Card inventory

- GIVEN `/` renders `#services`
- WHEN cards are counted
- THEN 4 full + 3 summary cards exist with correct titles and pillar labels.

#### Scenario: Mock dashboard

- GIVEN the Dashboards Dinámicos card renders
- WHEN its visual is inspected
- THEN it is pure CSS/SVG mock with no external data fetch.

### Requirement: Pillars Strip and Vision/Mission Placeholders

The system MUST render the 3-pillar strip (Data Science / Cybersecurity / Automations) and vision/mission sections with explicit TBD placeholders that MUST NOT block build or deploy.

#### Scenario: Placeholders visible, build green

- GIVEN official vision/mission texts are still pending
- WHEN the site builds and renders
- THEN vision/mission show labeled TBD copy and the build succeeds.

#### Scenario: Secondary contact CTA

- GIVEN the services closing block renders
- WHEN the visitor reads `Tu aliado en la transformación digital`
- THEN a secondary `Solicita una demo` CTA linking to `#contact` is present.

# Q-GANG 3.0 — Unified UI / UX standard

## Information hierarchy
1. Events and clan activities (upcoming first, recent completed activities second).
2. Announcements (three concise entries; date/category/priority when available).
3. Codex (single compact entry point to full document).
4. Community links (Steam public, WhatsApp invite members-only).

## Typography
- Inter for every Q-GANG 3.0 surface: logo wordmark, navigation, headings, body, controls.
- No Cinzel, serif, Gothic, or all-caps section headings.
- Font sizes: page title 24–28px; section title 20–22px; card title 15–17px; body 14px; metadata 12px.
- Line height 1.4–1.55; WCAG-compliant contrast.

## Layout and rhythm
- Content max width 1160px; desktop horizontal gutters 24px; mobile 16px.
- Spacing scale: 4, 8, 12, 16, 24, 32px; avoid ad hoc values.
- Cards 8–12px radius, subtle 1px border, no heavy gradients/shadows.
- Header 56–64px; compact sections with 24–32px separation.
- No large decorative hero; prioritize useful activity content in first viewport.
- Desktop 3-column upcoming cards, 4 compact recent activities; mobile one-column, clear tap targets.
- Empty/loading/error states must preserve section layout and describe actual state.

## Event and activity semantics
- Upcoming: only future published events; sorted by starts_at.
- Completed: latest actual activities; do not pretend RSVP means attendance.
- Display event type as human-readable label, not raw type_id.
- Cards link to a real event detail route; no placeholder or broken navigation.
- Auth and RLS remain authoritative; do not expose private events through a privileged key.

## Announcements
- Compact rows with title, date, priority indicator only when grounded in data.
- Pinned and important announcements visibly differentiated without disruptive badges.
- Each announcement links to a real detail or valid list anchor; never a nonexistent route.

## Codex and links
- Codex uses scannable sections, numbered articles, sticky table of contents where appropriate.
- Steam group is public; WhatsApp invite link is visible only to authorized active members.
- Do not hardcode invitation URLs; use validated, managed settings.
- Links must have accessible labels, external-link behavior, and no fake actions.

## Quality gate before release
- Test 320/375/768/1024/1440px viewports; keyboard and focus states.
- Test guest, member, captain, deputy and leader permissions.
- Test no events, one event, many events, long Turkish titles, missing covers.
- Verify build, links, loading, runtime errors, security policies, and production rollback.
- Only merge/deploy to q-gang.com after explicit leader approval.

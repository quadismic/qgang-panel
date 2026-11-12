# Q-GANG 3.0 — Implementation blueprint

Status: development branch only. No production deployment or database migrations authorized by this document.

## Product
Modern, mobile-first clan platform. Motto: **Kardeşlik, daima.**
Primary home content: upcoming published events, then announcements and community.
Navigation: Home, Events, Community, Codex; Management visible only to authorized users.
No large hero. Dark charcoal/navy, restrained accents, readable typography, optimized event covers.

## Existing infrastructure
- Vercel: qgang-panel, Next.js.
- GitHub: quadismic/qgang-panel.
- Supabase: existing production project; retain Auth users, Storage objects, policies, records, IDs and history.
- Reuse profiles, community_memberships, connected_accounts, role_permissions, community_events, event_types, event_responses, event_attendance, fund_transactions and announcements.
- Preserve existing event attendance vs RSVP distinction; never infer attendance from RSVP.
- Preserve historical roles; review permission mapping before UI changes.

## Routes
/ home; /etkinlikler upcoming + archive; /etkinlikler/[id] event detail;
/topluluk membership and public profiles; /kodeks codex;
/yonetim overview; /yonetim/etkinlikler event CRUD;
/yonetim/uyeler membership and roles; /yonetim/butce transactions;
/yonetim/duyurular announcements.

## Event flow
Published event cards sorted by starts_at. Event detail shows organizer, type, date, venue, capacity, RSVP (going/maybe/not_going), verified attendance separately, optional Steam and WhatsApp links. New event form: title, type, starts_at, ends_at, description, links, optional cover/capacity. External URLs must be validated and opened safely. WhatsApp/Steam integration is link/share-first, not assumed API automation.

## Security and data preservation
1. Inventory current app routes, Supabase schema, Auth providers, RLS, Storage, Vercel env names (never disclose secret values).
2. Obtain verified backups and rollback plan before any database changes.
3. Build on feature branch, keep main untouched.
4. Reuse auth sessions; enforce authorization server-side and in RLS, not just hidden menus.
5. No schema destructive changes, no truncates, no auth resets, no domain or production deployment without explicit approval.
6. Test guest/member/captain/deputy/leader permissions and mobile flows.
7. Preview and user approval before merge/deploy.

## Milestones
M1 app shell + responsive navigation + read-only events from existing tables.
M2 event detail + RSVP and admin event management.
M3 member and budget modules.
M4 accessibility, authorization tests, preview acceptance and controlled launch.

## Current repository
Next.js 15, React 19, Supabase SSR and JS libraries are already installed. Reuse compatible dependencies before adding new ones.

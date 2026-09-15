# Q-GANG Frontend / Backend Contract

This document freezes the current frontend-facing contract before the UI is separated from Wix.

## Current bridge

```text
https://www.q-gang.com/_functions/qgang
```

The current client uses the same endpoint as both `AUTH_URL` and `API_URL`.

## Session model

The browser stores `qg_session` in localStorage or sessionStorage.

Current session data is expected to include at least:

- `token`
- `rumuz`
- `rol`

Authenticated requests attach the active token automatically.

## Public actions

The current frontend treats only these actions as public:

- `LOGIN`
- `KAYIT`

All other POST actions are normalized so the current session token is included.

## Request behavior

### GET

Authenticated GET requests append the session token as a query parameter.

The frontend currently deduplicates/caches the CMS snapshot for 8 seconds.

### POST

JSON payloads are sent to the same API endpoint.

After a successful mutation, the frontend invalidates its CMS snapshot cache.

## Authorization model

Frontend authorization is display/UX only and must never become the security boundary.

The client currently resolves permission checks in this order:

1. Leader role receives full UI access.
2. Backend-provided `myPermissions` effective permissions.
3. Role permission matrix fallback.

The external frontend must preserve this behavior for UX, but backend authorization remains authoritative.

## Known frontend modules

The current monolithic client contains these major views/flows:

- Authentication / registration
- Dashboard
- Members
- Points
- Q-Hall
- Mission center
- Events
- Budget
- Announcements
- Invitations
- Constitution / discipline
- Applications
- Access / permission management
- Organization
- Units
- Career
- Logs
- Seasons
- Feed / activity surfaces

## Compatibility rule

During Q-GANG UI v1, the backend contract is treated as frozen unless a backend change is explicitly required for security or headless compatibility.

A visual refactor must not silently rename actions, payload keys, roles, collection fields, session keys, or permission keys.

## Authentication migration

The current rumuz/password flow remains operational during the first external-frontend milestone.

Google authentication is a later migration stage. It must be introduced as an identity-layer change, not mixed into the initial visual extraction.

Target identity model:

```text
Google identity / Wix Member
          ↓
Q-GANG account mapping
          ↓
Q-GANG role + effective permissions
          ↓
Q-GANG application session
```

This allows the existing Q-GANG role and permission system to survive the identity-provider change.

## Security boundary for the external frontend

The new public client must NOT receive direct anonymous write access to Wix CMS collections.

Preferred transition:

```text
Browser
  ↓
Q-GANG authenticated API / server-side operations
  ↓
Wix CMS
```

Legacy CMS permissions identified in the architecture audit are migration debt, not the intended authorization model.

## Extraction order

1. API/session client
2. Shared application shell
3. Authentication gate
4. Dashboard
5. Read-only modules
6. Mutation-heavy modules
7. Admin/leader modules
8. Responsive/mobile pass
9. Google identity migration
10. Production-domain cutover

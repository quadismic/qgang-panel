# Q-GANG External Frontend Cutover Checklist

## Phase 0 — Baseline

- [x] Preserve `main` as production baseline.
- [x] Create/use `qgang-ui-v1` for active development.
- [x] Inventory Wix CMS collections.
- [x] Record legacy CMS permission risks.
- [x] Freeze the current frontend/backend contract.
- [ ] Obtain/version the exact production `http-functions.js` backend source.

## Phase 1 — Frontend extraction

- [ ] Create an external deployable frontend shell.
- [ ] Move API/session helpers out of the monolithic page.
- [ ] Preserve current login and registration behavior.
- [ ] Preserve role/effective-permission UI behavior.
- [ ] Render dashboard from production-compatible API data.
- [ ] Verify logout/session expiry.
- [ ] Verify CORS/cookie behavior from the external origin.

## Phase 2 — Module parity

- [ ] Members
- [ ] Points
- [ ] Q-Hall
- [ ] Mission center
- [ ] Events
- [ ] Budget
- [ ] Announcements
- [ ] Invitations
- [ ] Constitution / discipline
- [ ] Applications
- [ ] Access management
- [ ] Organization
- [ ] Units
- [ ] Career
- [ ] Logs
- [ ] Seasons / feed

## Phase 3 — Security

- [ ] Route every mutation through authenticated backend operations.
- [ ] Remove anonymous CMS mutation permissions.
- [ ] Restrict user/account data reads.
- [ ] Rotate/remove legacy password storage when Google identity migration is complete.
- [ ] Keep audit log server-controlled.
- [ ] Validate rate limiting on external-origin requests.
- [ ] Regression-test every role.

## Phase 4 — Q-GANG UI v1

- [ ] Establish one global design system.
- [ ] Full-screen desktop shell.
- [ ] Responsive tablet layout.
- [ ] Mobile navigation.
- [ ] Consistent cards, modals, tables, alerts and empty states.
- [ ] Loading/skeleton/error states.
- [ ] Accessibility/keyboard pass.
- [ ] Performance pass.

## Phase 5 — Identity

- [ ] Connect Google/member identity.
- [ ] Map verified identity to Q-GANG account.
- [ ] Preserve rumuz, role and permissions.
- [ ] Define fallback/recovery flow.
- [ ] Retire legacy password login only after migration coverage is verified.

## Phase 6 — Cutover

- [ ] Deploy external frontend to a non-production URL.
- [ ] Run parity/regression testing.
- [ ] Test mobile devices.
- [ ] Test Leader and non-Leader accounts.
- [ ] Verify all writes against production-compatible backend.
- [ ] Prepare rollback route.
- [ ] Point production domain only after sign-off.
- [ ] Keep previous Wix frontend available for immediate rollback during the cutover window.

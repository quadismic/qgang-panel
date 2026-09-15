# Q-GANG Architecture Baseline

## Target

Q-GANG will evolve from an embedded Wix panel into a full-screen web application while retaining Wix as the current data/business backend during the transition.

## Production source

- Stable branch: `main`
- Development branch: `qgang-ui-v1`
- Current frontend API: `https://www.q-gang.com/_functions/qgang`
- Wix site: Q-GANG
- Wix site ID: `f089fb58-cd44-4034-a494-904fd9df2a18`

## Migration architecture

```
GitHub repository
  -> Q-GANG frontend
  -> external/full-screen deployment
  -> Wix backend / CMS
```

The existing Wix Editor frontend stays untouched until the external frontend is verified. Domain migration happens only after functional parity.

## CMS inventory

Native Q-GANG collections currently include:

- QAyarlar
- QBudget
- QDavetKodlari
- QDisiplin
- QDuyurular
- QEvents
- QGorevTalepleri
- QKullanicilar
- QPuanArsiv
- QRutbeGecmisi
- QTuzuk
- QMembers
- QAuditLog
- QBasvuruArsiv
- QDavetler
- QFeed
- QGorevAsamalar
- QGorevler
- QGorevYorumlar
- QRateLimit
- QSessions
- QSezonlar

Wix Members collections are also available and can become the basis of the future Google/member identity layer.

## Security findings — do not ignore

The current CMS permission model contains legacy broad permissions that must be removed as part of the backend migration.

High priority examples:

- `QGorevTalepleri`: ANYONE can currently insert, update and remove.
- `QPuanArsiv`: ANYONE can currently insert, update and remove.
- `QRutbeGecmisi`: ANYONE can currently insert, update and remove.
- `QKullanicilar`: ANYONE can currently read and insert/update; the collection contains `sifre` and personal/account fields.
- `QDavetKodlari`: ANYONE can currently update.
- Several management collections allow every site member to mutate records.

These permissions must not be copied into the new public frontend architecture. Writes should go through authenticated/authorized server-side operations.

## Transition rules

1. Do not break the current live Wix frontend.
2. Do not switch the production domain until the external frontend passes regression testing.
3. Do not expose CMS write operations directly to anonymous clients.
4. Keep secrets and authentication tokens out of GitHub.
5. Preserve the current API contract while the UI is being rebuilt.
6. Introduce Google/member authentication only after the frontend/backend boundary is stable.
7. New product features remain out of scope until Q-GANG UI v1 is complete.

## Next implementation stages

1. Preserve and document current Wix data/API behavior.
2. Establish a headless/external frontend client against the existing Wix project.
3. Build a deployable full-screen frontend from `qgang-ui-v1`.
4. Verify all current read/write flows against Wix.
5. Harden permissions/authentication.
6. Perform Q-GANG UI v1 visual conversion.
7. Complete mobile/responsive pass.
8. Add Google authentication.
9. Add YouTube integration.
10. Move the main domain only after parity and QA.

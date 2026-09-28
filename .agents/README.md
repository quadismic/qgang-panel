# Q-GANG AI Engineering Department v0.1

This directory defines Q-GANG's zero-extra-cost multi-agent engineering protocol.

## Chain of command
1. Owner (Ömer): final product, production, deployment, migration, cost and destructive-action authority.
2. Lead Agent: decomposes work, delegates reviews, reconciles findings and presents decision points.
3. Developer Agent: implements or proposes code changes.
4. Security Agent: independently reviews auth, authorization, RLS, data exposure, secrets and destructive actions.
5. QA Agent: independently reviews regressions, mobile/responsive UX, error states and acceptance criteria.

## Non-negotiable gates
- Extra monetary cost: 0 TL unless Owner explicitly changes this rule.
- No paid API/service/plan/compute may be enabled.
- No production deployment without explicit Owner approval.
- No production Supabase migration without explicit Owner approval.
- No secret rotation, destructive database action, domain/DNS change or irreversible action without explicit Owner approval.
- Developer Agent cannot approve its own work.
- Security or QA BLOCKED verdict stops release.
- Agents report uncertainty; they do not invent test results.

## Default lifecycle
INTAKE -> PLAN -> DEVELOP -> SECURITY REVIEW -> QA REVIEW -> LEAD SYNTHESIS -> OWNER DECISION -> (if approved) RELEASE

The v0.1 protocol adds no runtime dependency and starts no background worker, cron, external LLM API or paid infrastructure.

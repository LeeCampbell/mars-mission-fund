# Tasks: Issue #190 — Bug: risk disclosures not loaded when editing a draft campaign

Brief: plan/ready/brief.md

## Checklist

- [x] TASK-01: Fix server query — add risk_disclosures to getCampaignById SELECT
  - **Goal**: Ensure the server returns `riskDisclosures` when fetching a campaign by ID
  - **Details**: In `getCampaignById` SQL SELECT, add `risk_disclosures AS "riskDisclosures"` to the column list alongside the other aliased columns (~line 169). Also update `mockCampaignRow` in `campaigns.test.ts` (~line 62) to include `risk_disclosures: ['habitat pressure loss']` so existing tests remain accurate.
  - **Files**: `packages/server/src/campaigns/queries.ts`, `packages/server/src/__tests__/campaigns.test.ts`
  - **Verify**: `npm run test:coverage` passes (server tests); `npx tsc --noEmit -p packages/server/tsconfig.json` passes
  - **Brief ref**: Server query fix (section 1) and Server test mock (section 5)

- [x] TASK-02: Fix shared schema — add riskDisclosures to CampaignDetailSchema
  - **Goal**: Ensure `CampaignDetailSchema` includes `riskDisclosures` so the field is not stripped during client-side parsing and the `CampaignDetail` TypeScript type is correct
  - **Details**: In `CampaignDetailSchema` (~line 88–103), add `riskDisclosures: z.array(z.string()).default([])` to the field list.
  - **Files**: `packages/shared/src/campaign.ts`
  - **Verify**: `npm run build -w @mmf/shared` succeeds; `npx tsc -b --noEmit` passes
  - **Brief ref**: Shared schema fix (section 2)

- [ ] TASK-03: Fix client reducer INIT case and update test fixtures
  - **Goal**: Seed `riskDisclosures` from campaign data in the INIT reducer so Step 5 pre-populates saved risks; add a test that verifies Step 5 loads the fixture values
  - **Details**: In `CampaignFormPage.tsx` INIT reducer case (~line 194), change `riskDisclosures: ['']` to `riskDisclosures: c.riskDisclosures?.length ? c.riskDisclosures : ['']`. In `CampaignFormPage.test.tsx`, add `riskDisclosures: ['Habitat pressure failure', 'Dust storm damage']` to `mockCampaign`, then add a test case that renders with `campaignId`, advances to Step 5, and asserts both risk text values are visible in the form.
  - **Files**: `packages/client/src/pages/CampaignFormPage.tsx`, `packages/client/src/pages/CampaignFormPage.test.tsx`
  - **Verify**: `npm run test:coverage` passes including the new Step 5 population test; `npx tsc -b --noEmit` passes
  - **Brief ref**: Client reducer fix (section 3) and Test fixtures (section 4)

- [ ] TASK-04: Full CI verification
  - **Goal**: Confirm all checks pass end-to-end after the three-layer fix
  - **Details**: No new code — run the full CI check suite as a final gate.
  - **Files**: (none)
  - **Verify**: `./scripts/ci-check.sh` passes (type-check, lint, format, build, tests with coverage)
  - **Brief ref**: Verification section

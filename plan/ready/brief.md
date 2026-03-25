# Brief: Issue #190 — Bug: risk disclosures not loaded when editing a draft campaign

## Goal

When a creator opens an existing draft campaign for editing and navigates to Step 5 (Risk Disclosures), the step shows a single empty text box rather than the previously saved risks. This is a three-layer hydration bug: the server query omits `risk_disclosures` from its SELECT, the shared Zod schema omits `riskDisclosures` from `CampaignDetailSchema` (so the client-side parse strips it even if the server returned it), and the client reducer's INIT case hardcodes an empty array instead of reading from the campaign data. All three must be fixed for risks to persist across edit sessions.

## Scope

**In scope:**
- Add `risk_disclosures AS "riskDisclosures"` to the `getCampaignById` SQL SELECT in `queries.ts`
- Add `riskDisclosures: z.array(z.string()).default([])` to `CampaignDetailSchema` in `@mmf/shared`
- Fix the INIT reducer case in `CampaignFormPage.tsx` to seed `riskDisclosures` from campaign data
- Update the `mockCampaign` fixture in `CampaignFormPage.test.tsx` to include `riskDisclosures` and add a test asserting Step 5 loads saved risks
- Update `mockCampaignRow` in `campaigns.test.ts` with `risk_disclosures` so existing server-side tests remain accurate

**Out of scope:**
- Changing how risk disclosures are saved (the write path works correctly)
- Any changes to the review/submit flow (already reads `risk_disclosures` correctly)
- E2E test additions (the fix is verifiable via unit tests and manual browser check)

## Approach

Three targeted edits in the order they affect data flow (server → shared → client):

**1. Server query fix** (`packages/server/src/campaigns/queries.ts`, ~line 169)**

In `getCampaignById`, the SQL SELECT is missing the column. Add `risk_disclosures AS "riskDisclosures"` to the column list alongside the other aliased columns.

**2. Shared schema fix** (`packages/shared/src/campaign.ts`, ~line 102)**

`CampaignDetailSchema` extends `CampaignSummarySchema` with several fields (lines 88–103) but `riskDisclosures` is absent. Add:
```typescript
riskDisclosures: z.array(z.string()).default([]),
```
This also fixes the `CampaignDetail` TypeScript type (it's inferred from the schema), so the client gets the field properly typed.

**3. Client reducer fix** (`packages/client/src/pages/CampaignFormPage.tsx`, ~line 194)**

In the `INIT` reducer case, change:
```typescript
riskDisclosures: [''],
```
to:
```typescript
riskDisclosures: c.riskDisclosures?.length ? c.riskDisclosures : [''],
```
This mirrors how other array fields (milestones, teamMembers) are handled — preserve existing data, fall back to a single empty entry if none.

**4. Test fixtures** (`packages/client/src/pages/CampaignFormPage.test.tsx`)**

- Add `riskDisclosures: ['Habitat pressure failure', 'Dust storm damage']` to `mockCampaign`.
- Add a test case: render with `campaignId`, advance to Step 5, assert both risk text values are present in the form.

**5. Server test mock** (`packages/server/src/__tests__/campaigns.test.ts`)**

Add `risk_disclosures: ['habitat pressure loss']` to `mockCampaignRow` (line ~62) so the existing `GET /v1/campaigns/:id` test assertions remain accurate after the SELECT clause change.

## Files to Create/Modify

| File | Action | Description |
| ---- | ------ | ----------- |
| `packages/shared/src/campaign.ts` | modify | Add `riskDisclosures` field to `CampaignDetailSchema` |
| `packages/server/src/campaigns/queries.ts` | modify | Add `risk_disclosures AS "riskDisclosures"` to `getCampaignById` SELECT |
| `packages/client/src/pages/CampaignFormPage.tsx` | modify | Fix INIT reducer to load `riskDisclosures` from campaign data |
| `packages/client/src/pages/CampaignFormPage.test.tsx` | modify | Add `riskDisclosures` to mock fixture; add Step 5 population test |
| `packages/server/src/__tests__/campaigns.test.ts` | modify | Add `risk_disclosures` to `mockCampaignRow` fixture |

## Dependencies

No new npm packages or external services required. All changes are confined to existing files.

## Verification

- **Build**: `npm run build -w @mmf/shared && npx tsc -b --noEmit && npx tsc --noEmit -p packages/server/tsconfig.json` succeeds
- **Unit tests**: `npm run test:coverage` passes (new test for Step 5 population)
- **Visual**: Log in as Creator → Dashboard → Edit a draft campaign that has saved risks → click Next to Step 5 → confirm risk disclosures are pre-populated → edit one risk → save draft → return to edit → confirm edited value persists
- **E2E**: Existing `campaign-lifecycle.spec.ts` still passes (no E2E changes needed; the fix is unit-testable)

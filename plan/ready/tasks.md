# Tasks: Issue #82 — Replace forbidden language in page copy

Brief: plan/ready/brief.md

## Checklist

- [ ] TASK-01: Replace forbidden language in AboutPage.tsx
  - **Goal**: Remove all 3 "invest*" occurrences in AboutPage.tsx with spec-compliant alternatives
  - **Details**:
    - Line 66: `Space investment is no longer reserved for billionaires` → `Space exploration funding is no longer reserved for billionaires`
    - Line 94: `co-investing in breakthrough technologies` → `co-funding breakthrough technologies`
    - Line 145: `Backers invest in outcomes they believe in` → `Backers fund outcomes they believe in`
  - **Files**: `packages/client/src/pages/AboutPage.tsx`
  - **Verify**: `grep -i "invest" packages/client/src/pages/AboutPage.tsx` returns no matches
  - **Brief ref**: Scope > AboutPage.tsx; Approach > Specific replacements

- [ ] TASK-02: Replace forbidden language in ContactPage.tsx
  - **Goal**: Remove the 1 "investor" occurrence in ContactPage.tsx with spec-compliant alternative
  - **Details**:
    - Line 144: `an investor seeking opportunities` → `a backer seeking opportunities`
  - **Files**: `packages/client/src/pages/ContactPage.tsx`
  - **Verify**: `grep -i "invest" packages/client/src/pages/ContactPage.tsx` returns no matches
  - **Brief ref**: Scope > ContactPage.tsx; Approach > Specific replacements

- [ ] TASK-03: Build verification and grep check
  - **Goal**: Confirm no TypeScript/lint errors and no remaining forbidden language in both files
  - **Details**:
    - Run `npm run build` from the repo root (or `packages/client`) and confirm it succeeds
    - Run `grep -ri "invest" packages/client/src/pages/AboutPage.tsx packages/client/src/pages/ContactPage.tsx` and confirm zero matches
  - **Files**: none (verification only)
  - **Verify**: Build exits 0; grep returns no output
  - **Brief ref**: Verification section

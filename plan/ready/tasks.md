# Tasks: Issue #33 — Create GitHub Actions CI workflow

Brief: plan/ready/brief.md

## Checklist

- [x] TASK-01: Create `.github/workflows/ci.yml`
  - **Goal**: Implement the complete GitHub Actions CI workflow file with all required triggers, job configuration, and quality-gate steps.
  - **Details**:
    - Create `.github/workflows/` directory if it doesn't exist.
    - Set triggers: `pull_request` targeting `main` and `push` to `main`.
    - Single job named `ci` running on `ubuntu-latest`.
    - Steps in order:
      1. `actions/checkout@v4`
      2. `actions/setup-node@v4` with `node-version: '22.x'` and `cache: 'npm'`
      3. `npm ci`
      4. `npx tsc -b --noEmit` (name: "Type-check")
      5. `npm run lint` (name: "Lint")
      6. `npm run format:check` (name: "Format check")
      7. `npm run lint:md` (name: "Markdown lint")
      8. `npm run build` (name: "Build")
      9. `npm run test:coverage` (name: "Test coverage")
      10. `npm audit` (name: "Audit")
    - Each step must have a descriptive `name:` field so failures are clearly attributed in the Actions UI.
  - **Files**: `.github/workflows/ci.yml` (create)
  - **Verify**: `cat .github/workflows/ci.yml` shows valid YAML with all 10 steps; optionally run a YAML linter to confirm syntax is valid.
  - **Brief ref**: Approach steps 1–4; Files to Create/Modify table

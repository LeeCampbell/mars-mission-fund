---
name: review-ux
description: Review the running application's UX against provided spec files. Takes snapshots at multiple viewports, checks navigation, and produces structured findings. Use when the user wants a UX audit, visual review, or spec compliance check of the running app.
allowed-tools: Bash(playwright-cli:*), Read, Write, Glob, Grep
---

# UX Review Skill

Review a running web application's UX against provided spec files and produce structured findings.

## Inputs

- **Spec files**: Provided by the user via `@` mentions (e.g. `@specs/standards/brand.md`, `@specs/tech/frontend.md`). These contain the rules to evaluate against.
- **Base URL**: Defaults to `http://localhost:5173`. Override by passing a URL as an argument (e.g. `/review-ux http://localhost:3000`).
- **Scope**: Optional page path(s) as additional arguments, or "all" to crawl from the homepage. Defaults to "all".

## Process

Follow these steps in order:

### 1. Read Spec Files

Read every spec file the user provided via `@` mentions. Extract actionable rules organised by category:
- Brand & visual rules (colours, typography, spacing, logos)
- Content & copy rules (voice, tone, forbidden language)
- Technical frontend rules (component patterns, accessibility requirements)
- Any other rules found in the specs

Summarise the extracted rules before proceeding.

### 2. Open Browser and Navigate

```bash
playwright-cli open <base-url>
playwright-cli snapshot
```

### 3. Discover Pages

If scope is "all": extract all internal navigation links from the snapshot to build a page list.
If specific paths were given: use those paths only.

### 4. Review Each Page

For each page, perform the following checks:

#### a. Navigation & Links
- Click through all navigation links and buttons — verify they resolve (no 404s, no dead ends)
- Verify back navigation works (`playwright-cli go-back`)

#### b. Layout & Responsiveness
Test at three viewport widths, snapshotting each:

```bash
playwright-cli resize 375 812
playwright-cli snapshot
playwright-cli resize 768 1024
playwright-cli snapshot
playwright-cli resize 1280 800
playwright-cli snapshot
```

At each width, check for:
- Content overflow or horizontal scrolling
- Overlapping elements
- Appropriate layout shifts (e.g. hamburger menu on mobile)

#### c. Visual Consistency (against spec rules)
- Token usage matches spec (colours, fonts, spacing)
- Typography hierarchy is consistent
- Spacing patterns are uniform
- Component styling matches spec patterns

#### d. Usability
- CTAs are clear and singular per viewport
- Forms have visible labels, validation feedback, and error states
- Empty states are handled (not blank screens)
- Loading states exist where expected

#### e. Accessibility
- Check for ARIA attributes on interactive elements:
  ```bash
  playwright-cli eval "JSON.stringify([...document.querySelectorAll('button, a, input, select, textarea')].filter(el => !el.getAttribute('aria-label') && !el.getAttribute('aria-labelledby') && !el.textContent.trim()).map(el => ({tag: el.tagName, id: el.id, classes: el.className})))"
  ```
- Check colour contrast issues via eval
- Check for focus indicators:
  ```bash
  playwright-cli eval "getComputedStyle(document.activeElement).outline"
  ```

#### f. Content & Copy
- No placeholder or lorem ipsum text
- Voice and tone match spec patterns
- No forbidden language patterns from spec

### 5. Compile Findings

Write findings to `/tmp/ux-review-findings.md` using this format:

```markdown
# UX Review Findings

**Date**: YYYY-MM-DD
**Base URL**: <url>
**Spec files reviewed**: <list>
**Pages reviewed**: <count>

## Summary

| Severity | Count |
|----------|-------|
| Critical | N |
| Major | N |
| Minor | N |

## Findings

| # | Severity | Category | Page | Element | Description | Spec Reference |
|---|----------|----------|------|---------|-------------|----------------|
| 1 | Critical | Navigation | /path | element | Description of issue | spec-file.md, section |
| 2 | Major | Layout | /path | element | Description of issue | spec-file.md, section |

## Recommendations

### Quick Fixes (can be done directly)
- [ ] Fix 1: description
- [ ] Fix 2: description

### Larger Changes (feed into plan.sh)
- [ ] Change 1: description
- [ ] Change 2: description
```

### 6. Close Browser

```bash
playwright-cli close
```

### 7. Report Results

After writing the findings file:
- Print a summary of findings by severity and category
- Tell the user the full findings are at `/tmp/ux-review-findings.md`
- If there are quick fixes, offer to address them directly
- If there are larger changes, suggest feeding the findings into `scripts/plan.sh`

## Severity Definitions

- **Critical**: Broken functionality — links that 404, forms that don't submit, pages that error
- **Major**: Spec violations, accessibility failures, layout breakage at standard viewports
- **Minor**: Inconsistencies, polish items, minor deviations from spec patterns

## Important Notes

- Always snapshot before and after interactions to capture state changes
- Compare what you see against the specific rules in the provided spec files — do not invent rules
- If the dev server is not running, tell the user and stop
- Be thorough but factual — only report issues you can actually observe in the snapshots

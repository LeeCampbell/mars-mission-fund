#!/usr/bin/env bash
set -euo pipefail

npm ci
npx playwright install --with-deps chromium
npm run prepare

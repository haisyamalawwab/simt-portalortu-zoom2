# ✅ Repository Cleanup Checklist

**Project:** SIMT Portal Ortu  
**Date Started:** _______________  
**Completed By:** _______________  

---

## Phase 1: Critical Security Fixes (IMMEDIATE)

- [ ] **Fix database tracking**
  - [ ] Add `db/*.db` to .gitignore
  - [ ] Add `*.pid` to .gitignore
  - [ ] Run: `git rm --cached db\custom.db`
  - [ ] Verify: Database no longer tracked in git

- [ ] **Remove runtime files**
  - [ ] Delete `.zscripts/dev.pid`
  - [ ] Run: `git rm --cached .zscripts\dev.pid`

- [ ] **Remove generator scripts**
  - [ ] Delete `download/generate_prd.js`
  - [ ] Delete `download/generate_prd_v2.js`
  - [ ] Delete `download/README.md`

- [ ] **Commit security fixes**
  - [ ] Run: `git add .gitignore`
  - [ ] Run: `git commit -m "security: fix database tracking and remove generators"`

**Status:** [ ] COMPLETE

---

## Phase 2: Code Cleanup (HIGH PRIORITY)

- [ ] **Update branding in src/app/layout.tsx**
  - [ ] Change title from "Z.ai Code Scaffold" to "SIMT Portal Ortu"
  - [ ] Change description to project description
  - [ ] Update authors from "Z.ai Team" to "Tim Development SIMT"
  - [ ] Replace z.ai logo URL with project logo
  - [ ] Update openGraph URL
  - [ ] Remove z.ai keywords

- [ ] **Check z-ai-web-dev-sdk usage**
  - [ ] Run: `Select-String -Path "src\**\*.ts*" -Pattern "z-ai-web-dev-sdk"`
  - [ ] If not found, remove: `bun remove z-ai-web-dev-sdk`
  - [ ] Update package.json name and description

- [ ] **Commit code cleanup**
  - [ ] Run: `git add src/app/layout.tsx package.json bun.lock`
  - [ ] Run: `git commit -m "chore: remove z.ai branding and unused dependencies"`

**Status:** [ ] COMPLETE

---

## Phase 3: Scripts Evaluation (MEDIUM PRIORITY)

**Decision:** Which deployment method?
- [ ] Linux VPS with existing scripts
- [ ] Windows/Laragon (remove scripts)
- [ ] Docker (remove scripts)
- [ ] Vercel/Netlify (remove scripts)

### If Keeping Scripts (Linux VPS):
- [ ] Update hardcoded paths in all .sh files
- [ ] Replace `/home/z/my-project` with actual path
- [ ] Test scripts on target server
- [ ] Update Caddyfile configuration

### If Removing Scripts:
- [ ] Delete `.zscripts` folder
- [ ] Create platform-specific scripts if needed
- [ ] Document build/start commands
- [ ] Run: `git add -A && git commit -m "chore: remove z.ai scripts"`

**Status:** [ ] COMPLETE

---

## Phase 4: Reference Material Cleanup (MEDIUM PRIORITY)

- [ ] **Create archive structure**
  - [ ] Create `docs-archive` folder
  - [ ] Create `deployment` folder

- [ ] **Move PRD documents**
  - [ ] Move `download/*.docx` to `docs-archive/`
  - [ ] Move `download/simt-visualisasi/` to `docs-archive/`

- [ ] **Handle Laravel reference**
  - [ ] Decision: [ ] Keep [ ] Archive [ ] Remove
  - [ ] If archive: Create zip file
  - [ ] If remove: Delete `download/simt-laravel/`

- [ ] **Move deployment configs**
  - [ ] Move `Caddyfile` to `deployment/`
  - [ ] Add deployment README if needed

- [ ] **Commit organization**
  - [ ] Run: `git add -A`
  - [ ] Run: `git commit -m "chore: reorganize reference materials"`

**Status:** [ ] COMPLETE

---

## Phase 5: Documentation Updates (LOW PRIORITY)

- [ ] **Create root README.md**
  - [ ] Project overview
  - [ ] Features list
  - [ ] Quick start guide
  - [ ] Link to docs/

- [ ] **Create CHANGELOG.md**
  - [ ] Version 1.0.0 entry
  - [ ] List major features
  - [ ] Document cleanup changes

- [ ] **Update docs/README.md**
  - [ ] Remove outdated Laravel references (if removed)
  - [ ] Update file structure documentation
  - [ ] Add cleanup notes

- [ ] **Commit documentation**
  - [ ] Run: `git add README.md CHANGELOG.md docs/`
  - [ ] Run: `git commit -m "docs: add root documentation"`

**Status:** [ ] COMPLETE

---

## Phase 6: Testing & Verification (CRITICAL)

- [ ] **Verify git status**
  - [ ] Run: `git status`
  - [ ] Confirm no unwanted files tracked
  - [ ] Confirm database not tracked

- [ ] **Test application**
  - [ ] Run: `bun install` (verify no errors)
  - [ ] Run: `bun run db:push` (verify schema works)
  - [ ] Run: `bun run dev` (verify app starts)
  - [ ] Test parent login endpoint
  - [ ] Test student login endpoint
  - [ ] Test dashboard endpoints

- [ ] **Verify build process**
  - [ ] Run: `bun run build`
  - [ ] Confirm successful build
  - [ ] Test production start: `bun run start`

- [ ] **Check .gitignore effectiveness**
  - [ ] Create test database file
  - [ ] Verify not shown in `git status`
  - [ ] Delete test file

**Status:** [ ] COMPLETE

---

## Phase 7: Final Review (BEFORE PRODUCTION)

- [ ] **Security checklist**
  - [ ] No database files tracked
  - [ ] No .env files tracked (except .env.example)
  - [ ] No secrets in code
  - [ ] No z.ai branding remaining

- [ ] **Code quality**
  - [ ] Run: `bun run lint` (fix any errors)
  - [ ] All TypeScript errors resolved
  - [ ] No console.log in production code
  - [ ] Proper error handling implemented

- [ ] **Documentation**
  - [ ] API documentation accurate
  - [ ] README.md complete
  - [ ] Deployment guide available
  - [ ] Environment variables documented

- [ ] **Repository health**
  - [ ] Clean git history
  - [ ] Meaningful commit messages
  - [ ] No large binary files tracked
  - [ ] .gitignore comprehensive

**Status:** [ ] COMPLETE

---

## Optional: Advanced Cleanup

- [ ] **Audit dependencies**
  - [ ] Remove unused packages
  - [ ] Update outdated packages
  - [ ] Check for security vulnerabilities

- [ ] **Set up CI/CD**
  - [ ] Create GitHub Actions workflow
  - [ ] Add automated tests
  - [ ] Add linting checks

- [ ] **Performance optimization**
  - [ ] Optimize bundle size
  - [ ] Add caching strategy
  - [ ] Configure CDN

**Status:** [ ] COMPLETE

---

## Completion Summary

**Total Phases:** 7  
**Phases Completed:** ___ / 7  
**Completion Date:** _______________  

### Results:

| Metric | Before | After |
|--------|--------|-------|
| Repository Size | ~80MB | _____ MB |
| Tracked Files | 150+ | _____ |
| Security Issues | 2 | _____ |
| Z.AI References | Multiple | _____ |
| Production Ready | 60% | ____% |

### Notes:
```
_________________________________________________________________

_________________________________________________________________

_________________________________________________________________

_________________________________________________________________
```

---

## Sign-off

**Developer:** ___________________ Date: __________  
**Reviewer:** ___________________ Date: __________  
**Approved for Production:** [ ] YES [ ] NO

---

**Generated by:** Kiro AI Assistant  
**Version:** 1.0.0  
**Date:** Juni 15, 2026

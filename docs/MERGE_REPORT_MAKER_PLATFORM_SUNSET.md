# Sunset of duplicate `maker-platform/` folder

Generated: 2026-04-20 (updated after AOS migration)

## What happened

1. **Duplicate folder removed:** `AOS/Project/maker-platform/` was deleted. Development consolidated on a single canonical clone.

2. **Attempted `frontend/src` merge (mtime-based) was unsafe and reverted:** Many files under the duplicate had **newer timestamps but zero bytes** (empty files), including pages and `gateway/nginx.conf`. Copying “newer” maker files into this repo would have **wiped working code**.

3. **Restored from Git:** `frontend/src/` and `README.md` were reset to the **last committed** state on `main` so the project stays buildable. **`gateway/nginx.conf`** was also verified restored (maker’s copy had been empty).

## AOS migration (2026-04-20)

The BitForge implementation was **merged into** **[AOS_Project](https://github.com/ranjithguggilla/AOS_Project)** as `main`. The standalone **`BitForge-DIY-Maker-Platform`** GitHub repository was **deleted** after migration; this repo is the single source of truth.

## Lesson

Do **not** merge duplicate trees using **mtime alone** when one copy may be corrupted. Prefer **git**, **diff review**, or restore from **GitHub / backup**.

## If you lost unique edits

The removed `maker-platform/` tree is gone from disk unless **Time Machine** or another backup has it. Recover from backup if you had changes only there.

## Canonical path

Work only in this repository (**AOS_Project**). Clone:

```bash
git clone https://github.com/ranjithguggilla/AOS_Project.git
cd AOS_Project
```

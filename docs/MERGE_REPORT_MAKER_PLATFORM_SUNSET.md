# Sunset of duplicate `maker-platform/` folder

Generated: 2026-04-20

## What happened

1. **Duplicate folder removed:** `AOS/Project/maker-platform/` was deleted. The single canonical codebase is **`BitForge-DIY-Maker-Platform/`** (this repo, with `.git`).

2. **Attempted `frontend/src` merge (mtime-based) was unsafe and reverted:** Many files under the duplicate had **newer timestamps but zero bytes** (empty files), including pages and `gateway/nginx.conf`. Copying “newer” maker files into this repo would have **wiped working code**.

3. **Restored from Git:** `frontend/src/` and `README.md` were reset to the **last committed** state on `main` so the project stays buildable. **`gateway/nginx.conf`** was also verified restored (maker’s copy had been empty).

## Lesson

Do **not** merge duplicate trees using **mtime alone** when one copy may be corrupted. Prefer **git**, **diff review**, or restore from **GitHub / backup**.

## If you lost unique edits

The removed `maker-platform/` tree is gone from disk unless **Time Machine** or another backup has it. Recover from backup if you had changes only there.

## Canonical path

Work only in:

`BitForge-DIY-Maker-Platform/`

Clone example:

```bash
git clone https://github.com/ranjithguggilla/BitForge-DIY-Maker-Platform.git
cd BitForge-DIY-Maker-Platform
```

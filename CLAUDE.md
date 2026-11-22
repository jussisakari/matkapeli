# Matkapeli – notes for Claude

A browser game for a parent and their 7-year-old daughter Ella. Finnish game texts, plain HTML/JS
(classic scripts, no build step, must work from `file://`), played on a tablet.
Live at https://jussisakari.github.io/matkapeli/. Pushing to `master` does NOT update the live game:
only a release does (`gh workflow run release.yml`, see `.github/workflows/release.yml`).
The release notes are made from the issues closed since the previous release.
`PLAN.md` describes every scene and feature.

## Working from GitHub issues
New features and bugs are written as GitHub issues (templates in `.github/ISSUE_TEMPLATE/`,
labels `feature` and `bug`).
- List open work: `gh issue list --label feature` (or `--label bug`), read one with `gh issue view N`.
- Implement it, test it lightly, update `PLAN.md`, and commit with `Closes #N` in the message
  so the issue closes when pushed to `master`.
- If an issue is unclear, ask in the chat (or comment on the issue) before guessing big things.

## Rules of the project
- Game texts in Finnish; code comments in English, simple enough for a child to follow.
- Speech bubbles stay until tapped (`until: Infinity`).
- Hero costumes use the names the family chose: Spiderman, Spin, Ghost Spider, Ironman, Black Panther. Otherwise no other famous characters by name or look – make our own.
- New script files go into `index.html` **and** the `FILES` list in `sw.js` (offline app).
  No need to bump `CACHE` in `sw.js` – the release workflow sets a new cache name for each release.
- Shortcuts for testing are listed at the top of `js/main.js` (`index.html#ulos` etc.).

## Testing
The laptop is slow. Keep headless Chrome tests short, run them in the background,
and always kill headless Chrome afterwards:
`Get-CimInstance Win32_Process -Filter "name='chrome.exe'" | ? { $_.CommandLine -like '*headless*' } | % { Stop-Process -Id $_.ProcessId -Force }`

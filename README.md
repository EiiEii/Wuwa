# Solaris Resonator Archive

An original mobile-first Wuthering Waves fan companion built with static HTML, CSS and JavaScript for GitHub Pages.

## What's in this build

- **Resonator archive:** 60 records through Version 3.7, including Rover forms separately, with live name search and filters by element, weapon, rarity and debut version.
- **Profile modal:** opens each character's current dataset fields, with explicit notes where detailed guides or artwork have not been added.
- **Favorites:** stored locally in the browser.
- **Team Lab:** build a three-character team and save/load custom teams on the device.
- **Convene Lab:** a simplified fan-made pull simulator with pity counters. It does not connect to the game and does not claim to reproduce live rates or guarantees.
- **Damage Lab:** transparent, user-editable estimate based on a simplified formula; not a game-accurate combat calculator.
- **Echo Codex and version timeline:** searchable starter Sonata index and version overview.
- **Build Notebook:** save your own weapon/Echo/stat/rotation notes per Resonator. A guide-search shortcut lets you check current external guides instead of presenting fabricated builds.
- **Personal Tier Board:** lets you rank characters yourself. It intentionally does not invent an objective/meta tier list.
- **Mobile-first responsive layout, dark/light theme, optional UI tones, favorites and local saves.**

## Files

- `index.html` — sections and controls
- `style.css` — Solaris-inspired responsive interface, theme and animations
- `app.js` — interactions and local persistence
- `data/resonators.json` — editable character roster
- `data/upcoming.json` — announced but not-yet-playable content, kept separate from the playable roster
- `SOURCES.md` — roster and update references / known limitations

## Publish on GitHub Pages

1. Download and extract the ZIP.
2. Create a repository on GitHub, or create a `wuwa` folder in your existing `eiieii.github.io` repository.
3. Upload **all extracted files**, including the `data` folder. Keep the directory structure unchanged.
4. If using a subfolder of your existing user site, upload the contents into `wuwa/`; your site URL will be `https://eiieii.github.io/wuwa/` (assuming that is your Pages repository).
5. If creating a separate repository, open **Settings → Pages**, choose **Deploy from a branch**, select `main` and `/ (root)`, then save.
6. Open the published Pages URL. The app loads the JSON roster using `fetch`, so test through GitHub Pages or a local HTTP server, not by opening `index.html` as a raw `file://` document.

## Artwork and accuracy status

This first build has original CSS-generated placeholders, not copyrighted character portraits. Each roster record has an `artwork` field so you can add an image URL you are permitted to use. Artwork has not been falsely mapped from search thumbnails or uncertain file names. If adding assets, prefer official media where allowed, check source terms, and provide attribution where required.

Roster identity and core fields were cross-checked against current community roster/build references, and the latest new playable character (Hsin in Version 3.7) was checked against the current Version 3.7 reporting and official patch notices. Community references can lag; check the latest game patch before claiming the roster remains complete. Suoming is listed separately as announced for Version 3.7 Phase II, not as playable on the build's reference date (12 October 2026).

Exact build rankings, full weapon recommendations, comprehensive voice lines, detailed Echo effects/drop tables, and in-game accurate damage calculations require separately verified datasets. This starter uses editable personal notes and external guide search instead of fabricating those facts. Favorites, saved teams, build notes, tier choices and theme are stored in the browser's local storage; they do not sync across devices.

## License and affiliation

Unofficial fan project. Wuthering Waves and its characters are property of Kuro Games. This website is not affiliated with or endorsed by Kuro Games. This starter uses no bundled official character art.

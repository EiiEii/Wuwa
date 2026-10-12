# Data references and verification notes

Checked on 12 October 2026.

- Official Wuthering Waves news index, including Version 3.7 notices and Hsin's profile reveal: https://wutheringwaves.kurogames.com/m/en/main/news
- Official Version 3.7 patch notes (Chinese-language official page): https://wutheringwaves.kurogames.com/zh-tw/main/news/detail/5562
- Wutheringlab character list and build guide index (community reference, page updated 11 October 2026): https://wutheringlab.com/
- Current Version 3.7 news / timing cross-check for Hsin and Suoming: https://www.wuwabuild.com/news/wuthering-waves-3-7-update
- Independent Version 3.7 release report: https://www.invenglobal.com/articles/26669/wuthering-waves-version-37-goes-live-with-new-resonator-hsin
- Additional broad roster cross-check: https://www.lootbar.com/blog/en/wuthering-waves-character-list.html

## Cautions

- The character fields in `data/resonators.json` are a community-compiled starter dataset, not an official API. Version assignments, weapon/element labels, and the list of forms should be reviewed against official patch notices when updating.
- Rover's attribute forms are split into records so users can filter/team-plan by form. Depending on how the user counts unique characters, the number of rows differs from the count of unique named playable Resonators.
- Hsin is part of Version 3.7. Suoming is kept in `data/upcoming.json` because the current reference date is 12 October 2026 and sources list the Phase II release for 22 October.
- This build intentionally does not bundle official character artwork or invent exact build rankings, voice lines, detailed Echo effects, or damage mechanics.

# Ankara 101 fonts

Only `Ankara101FontGate` loads these names. Home, onboarding, Saved, Detail and the retained Insider screen keep their existing font registry and typography.

Source: [official Google Fonts repository, pinned commit 47d54ca1ebb14fd864695f1d39dc734f39017c33](https://github.com/google/fonts/tree/47d54ca1ebb14fd864695f1d39dc734f39017c33/ofl). Each family has its original SIL Open Font License 1.1 text beside the TTF files. `provenance.json` records upstream filenames/URLs, versions, source/output checksums and every pinned axis. No font package or lockfile dependency was changed.

| Family / font version | Local roles | License |
|---|---|---|
| Bricolage Grotesque 1.001 | 400/500/600/700/800; native static instances, `wdth=100`, `opsz=14` | `bricolagegrotesque-OFL.txt` |
| Fraunces 1.000 | 400/600/700 and 400 Italic; static optical sizes 20/21/25/36/39/41; always `WONK=1`, `SOFT=0` | `fraunces-OFL.txt` |
| Instrument Serif 1.000 | Official Regular and Italic static TTFs | `instrumentserif-OFL.txt` |
| DM Serif Display 5.200 | Official Regular and Italic static TTFs, only masthead/slogan/Castle cover/Contents | `dmserifdisplay-OFL.txt` |
| Plus Jakarta Sans 2.071 (existing Expo package 0.4.2) | Existing application's official Expo font files; body, metadata, navigation and controls | Existing `@expo-google-fonts/plus-jakarta-sans/LICENSE_FONT`, SIL OFL 1.1; no replacement |

Variable source fonts were instantiated with FontTools 4.60.1 `instantiateVariableFont`, with all axes pinned, the complete glyph repertoire retained, and unique internal `A101…` names. The resulting fonts have no `fvar` table. This avoids depending on React Native variable-axis selection. Fraunces's upstream default `opsz=9` widened the Gordion introduction to five lines; the role-size instances reproduce the approved optical-size appearance and four-line flow. Bricolage's explicitly approved optical size stays 14 at every role.

The packaged `visual-approval-and-fonts.json` omits DM Serif Display, but live index master `1345:23708` uses it. The user explicitly approved adding its Regular/Italic files on 2026-10-16. It does not replace Bricolage, Fraunces, Instrument Serif or Plus Jakarta Sans in their approved roles.

The scoped loading gate waits before rendering editorial text. Error or a ten-second timeout gives Retry and Back, with no fallback look-alike face or automatic late switch after timeout. Retry starts a fresh attempt. Browser error, timeout, retry and safe-exit checks are separate from pending physical Redmi/font-loading acceptance.

Existing Plus Jakarta files used by the shared `GEZEK_FONT_FAMILIES` registry are `400Regular/PlusJakartaSans_400Regular.ttf`, `500Medium/PlusJakartaSans_500Medium.ttf`, `600SemiBold/PlusJakartaSans_600SemiBold.ttf` and `700Bold/PlusJakartaSans_700Bold.ttf` within that exact installed dependency. Its package and font licenses remain supplied by the unchanged lockfile dependency.

License records retain the complete official copyright and OFL wording; only CRLF/trailing whitespace was normalized for repository whitespace checks. `provenance.json` records both upstream and local license digests.

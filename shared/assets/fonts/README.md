# Bundled web fonts

These production WOFF2 files are bundled locally so the production build has no
font-network dependency. All three are variable fonts loaded via `next/font/local`
in `src/app/layout.tsx`.

| File | Family | Role | Axis | License |
| --- | --- | --- | --- | --- |
| `Satoshi-Variable.woff2` | Satoshi | Display / headings (`--font-display`) | `wght 300..900` | ITF Free Font License (Indian Type Foundry, via Fontshare) |
| `GeneralSans-Variable.woff2` | General Sans | Body / UI (`--font-body`) | `wght 200..700` | ITF Free Font License (Indian Type Foundry, via Fontshare) |
| `JetBrainsMono-Variable.woff2` | JetBrains Mono | Meta / mono (`--font-mono`) | `wght 100..800` | SIL Open Font License 1.1 (see `OFL.txt`) |

Satoshi and General Sans were retrieved from the Fontshare CDN
(`https://api.fontshare.com/v2/css?f[]=<family>@1`, the variable-axis endpoint).
Both are free for commercial use under the ITF Free Font License; retain this
attribution file alongside the font files when updating them.

Replaced in the 2027 redesign: Inter Variable and Outfit Variable were removed in
favour of the pairing above. The `@fontsource-variable/inter` and
`@fontsource-variable/outfit` devDependencies were dropped at the same time.

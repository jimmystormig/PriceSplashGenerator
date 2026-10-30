# Third-party software and assets

The repository's MIT license covers original project code. Dependencies retain their own licenses and notices.

| Direct runtime dependency | License used | Purpose |
| --- | --- | --- |
| [idb-keyval](https://github.com/jakearchibald/idb-keyval) | Apache-2.0 | Browser IndexedDB storage |
| [JSZip](https://github.com/Stuk/jszip) | MIT option of its MIT/GPL-3.0 dual license | ZIP exports |
| [SheetJS Community Edition](https://git.sheetjs.com/sheetjs/sheetjs) | Apache-2.0 | Excel imports and templates |

`public/third-party-notices.txt` contains installed production dependency license texts and available NOTICE files, including transitive dependencies. Vite copies it into the deployed site as `third-party-notices.txt`. Regenerate it with `npm run notices` after `npm ci` when dependencies change. Development tools retain their respective licenses in their installed packages; consult the lockfile for exact versions.

SheetJS is fetched from a versioned official tarball at `cdn.sheetjs.com`; see the manual update procedure in [CONTRIBUTING.md](CONTRIBUTING.md). Do not assume npm registry advisories completely cover this distribution.

No custom font files are included. The default font uses the browser/system Arial fallback stack. Uploaded fonts remain local to the browser; users must obtain the rights required for their use and generated graphics. Do not add proprietary fonts, branding, or sample spreadsheets without redistribution rights. Mentioning a font or retailer does not grant rights to its assets or imply endorsement.

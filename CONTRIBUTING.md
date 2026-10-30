# Contributing

Forks and reuse are welcome under the [MIT license](LICENSE). Issues and pull requests are welcome, but maintenance, reviews, and support are best effort. There is no guaranteed response time or commitment to accept a change.

## Getting started

Use Node.js 24 (`nvm use` if available), then run:

```sh
npm ci
npm run dev
```

Create a branch in your fork and keep each pull request focused. Explain the user-visible change, link any related issue, and include verification steps. Discuss substantial changes in an issue first. Contributions are provided under this repository's MIT license; retain applicable third-party notices.

Before opening a pull request, run:

```sh
npm test
npm run build
npm audit
```

For UI or rendering changes, also check the browser preview, PNG export, Excel import, and ZIP export as applicable. Add meaningful regression coverage for behavior changes. Do not commit generated `dist/`, credentials, personal data, customer spreadsheets, or fonts you cannot redistribute. Use synthetic data and freely redistributable assets in examples and tests.

## Dependency maintenance

Commit `package-lock.json` with dependency changes and validate using `npm ci`. Dependabot checks npm and GitHub Actions weekly; GitHub Actions are pinned to full commit SHAs with version comments. Review upstream release notes before accepting updates.

SheetJS is installed from an official external tarball rather than the npm registry. At least monthly, and before a release, manually check the [official installation guidance](https://docs.sheetjs.com/docs/getting-started/installation/nodejs/) and [upstream project](https://git.sheetjs.com/sheetjs/sheetjs) for releases and security information. npm audit and automated dependency review may not cover this distribution completely. For an update, choose a specific official version, update the tarball URL and lockfile using npm, and verify spreadsheet import/template compatibility, including legacy headers, malformed input, and row/size limits.

After changing production dependencies, run `npm run notices` and commit the updated `public/third-party-notices.txt`. CI verifies it matches installed dependencies. Review license changes and preserve any upstream NOTICE files. See [third-party documentation](THIRD_PARTY.md).

## Reporting problems

Use the bug or feature issue forms for ordinary reports. Include steps to reproduce, expected and actual behavior, browser/version, and synthetic sample data where useful. Never attach private spreadsheets or unlicensed fonts. Report suspected vulnerabilities privately using [the security policy](SECURITY.md).

Follow our [code of conduct](CODE_OF_CONDUCT.md) in issues, pull requests, and other project spaces.

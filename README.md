# Prissplash

Swedish browser-only price splash generator. Form editing, Excel import and template, custom fonts, Canvas PNGs, and ZIP batches. Products and fonts stay in IndexedDB on the current browser; clearing browser data removes them.

[Live app](https://jimmystormig.github.io/PriceSplashGenerator/) · [MIT license](LICENSE) · [Security policy](SECURITY.md)

## Reuse and support

Forks, modifications, and commercial reuse are welcome under the MIT license. Retain the license notice and applicable [third-party notices](THIRD_PARTY.md). Custom fonts and other third-party assets retain their own terms.

Maintenance, issues, and pull-request reviews are best effort, with no guaranteed response times. See [CONTRIBUTING.md](CONTRIBUTING.md) and the [code of conduct](CODE_OF_CONDUCT.md). Report suspected vulnerabilities privately using the security policy.

## Development

Use Node.js 24 (`nvm use` if available):

```sh
npm ci
npm run dev
```

Before submitting changes, run `npm test`, `npm run build`, and `npm audit`. Pull requests run CI automatically with read-only repository access. Dependency updates also require `npm run notices`; see the contribution guide for the manual SheetJS checks.

## Excel

Download the template in the app. The first worksheet is imported, with headers on row 1 and one product per row. Map columns before import. Blank comparison and saving fields calculate automatically. Multiprice quantity is the number of packages; price is the bundle total, regular price and weight refer to one package. Invalid rows stay editable and are excluded from exports. Maximum import: 5,000 rows / 20 MB. Font uploads: up to 15 MB.

## Deployment

GitHub Actions builds and publishes `dist` to GitHub Pages on pushes to `main` in the upstream repository. Repository Settings → Pages must use **GitHub Actions** as the build source. Deployment derives Vite's base path from Pages metadata, including renamed repositories and custom domains. Local builds default to `/PriceSplashGenerator/`; for another host, use `npm run build -- --base=/your-path/` (or `--base=/` for a root deployment).

### Deploying a fork

1. Fork the repository and enable GitHub Actions in the fork.
2. In Settings → Pages, select **GitHub Actions** as the source. Configure a custom domain there if needed.
3. In Settings → Secrets and variables → Actions → Variables, add the repository variable `ENABLE_PAGES` with value `true`.
4. Run **Deploy GitHub Pages** manually from Actions, or push to the fork's `main` branch. The `github-pages` environment must permit deployment from `main`.
5. Update project links in the README and package metadata, and security-reporting links in `SECURITY.md` and the issue-template configuration. Enable private vulnerability reporting in your fork.

Fork deployments are skipped until explicitly enabled. Pull requests only run checks; they cannot publish the site. The deployed `third-party-notices.txt` must remain available when redistributing the build.

The site and source are public; entered data and uploaded fonts are never sent to a server. Saving is local to the current browser and origin, not synced across devices. Use only fonts you have permission to use.

## Typography and details

Main prices use large kronor and small raised öre, or `:-` for whole kronor. The savings badge uses decimal commas and two equally sized decimal digits, e.g. `29,95` or `30,00`. Product names render in uppercase. Supplier and manufacturer share the quantity line; regular and comparison prices share the following line. Optional 30-day price and deposit text are omitted together when empty, so the purchase limit moves up.

The Excel columns `Leverantör` and `Pant tillkommer` are optional and older templates still work. Deposit accepts ja/nej, true/false, 1/0, or an empty cell (no). Invalid values remain editable and block that row's export until corrected with the checkbox.

Uploaded fonts and the selected font are saved immediately in IndexedDB; storage success or failure appears beside the font control. TrueType/OpenType weight metadata is respected, including ICA Rubrik Bold (700). Font files are never committed or hosted with the app. Fonts persist on this browser and origin until browser data or saved work is cleared.

The price-unit dropdown is labeled Enhet and offers st/frp; the weight/volume unit is labeled Viktenhet. New Excel templates use those headers. Older Enhet/Prissuffix templates still map correctly. Existing unsupported price units are retained and flagged for correction.

The splash group is 10% smaller with its center shifted 25 pixels to the right on a 1000-pixel canvas. Main prices are larger within the splash; multiprice labels, amounts, and units use separate vertical areas measured using actual font ink bounds.

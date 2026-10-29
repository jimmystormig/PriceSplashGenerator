# Prissplash

Swedish browser-only price splash generator. Form editing, Excel import and template, custom fonts, Canvas PNGs, and ZIP batches. Products and fonts stay in IndexedDB on the current browser; clearing browser data removes them.

## Development

Node.js 24: `npm ci`, `npm run dev`. Run `npm test` and `npm run build` before publishing.

## Excel

Download the template in the app. The first worksheet is imported, with headers on row 1 and one product per row. Map columns before import. Blank comparison and saving fields calculate automatically. Multiprice quantity is the number of packages; price is the bundle total, regular price and weight refer to one package. Invalid rows stay editable and are excluded from exports. Maximum import: 5,000 rows / 20 MB. Font uploads: up to 15 MB.

## Deployment

GitHub Actions builds and publishes `dist` to GitHub Pages on pushes to `main`. The Vite base is `/PriceSplashGenerator/`. Repository Settings → Pages must use GitHub Actions as the build source.

The site and source are public; entered data and uploaded fonts are never sent to a server. Saving is local to the current browser and origin, not synced across devices. Use only fonts you have permission to use.

## Typography and details

Prices use large kronor and small raised öre, or `:-` for whole kronor. Product names render in uppercase. Supplier and manufacturer share the quantity line; regular and comparison prices share the following line. Optional 30-day price and deposit text are omitted together when empty, so the purchase limit moves up.

The Excel columns `Leverantör` and `Pant tillkommer` are optional and older templates still work. Deposit accepts ja/nej, true/false, 1/0, or an empty cell (no). Invalid values remain editable and block that row's export until corrected with the checkbox.

Uploaded fonts and the selected font are saved immediately in IndexedDB; storage success or failure appears beside the font control. TrueType/OpenType weight metadata is respected, including ICA Rubrik Bold (700). Font files are never committed or hosted with the app. Fonts persist on this browser and origin until browser data or saved work is cleared.

# Security policy

## Supported versions

Security maintenance is best effort for the current `main` branch and the upstream GitHub Pages deployment. Older versions and independently maintained forks are not supported by the upstream maintainer.

## Report a vulnerability

Do not open a public issue for a suspected vulnerability. Use [Report a vulnerability](https://github.com/jimmystormig/PriceSplashGenerator/security/advisories/new) in the repository's Security tab to send a private report. Include reproduction steps, affected version or commit, impact, and a minimal synthetic example. Do not include credentials, private spreadsheets, or unlicensed fonts.

Reports, fixes, and coordinated disclosure are handled best effort; no response or remediation timeline is guaranteed. Avoid public disclosure of exploit details while a private report is being assessed.

## Data and dependencies

The application processes products and uploaded fonts in the browser and stores saved work in IndexedDB. GitHub hosts the public site; browser data is specific to the browser and origin. Do not submit sensitive data in issues or test fixtures. Keep your browser current and only import files and fonts from sources you trust.

Dependency scanning is supplemented by manual SheetJS checks described in [CONTRIBUTING.md](CONTRIBUTING.md). Audit results are not a guarantee that external tarballs or all vulnerabilities are covered.

## Fork maintainers

Enable private vulnerability reporting in your fork's Settings → Security and replace the upstream reporting link above with your own repository's link. Your fork's releases, deployments, and security response are your responsibility.

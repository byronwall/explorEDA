# Authorized browser review

No application scenario in this audit was completed. The included screenshots are real administrator-block pages. The capture utility records navigation, screenshots and console output; it does not certify any analytical behavior.

## Retained production target

The exact downloaded GitHub Pages build is `../evidence/deployment-build.zip`. It contains `artifact.tar`. Extract both layers into a new temporary folder outside your repository and serve that folder with a normal local HTTP server. For example, from the ZIP package root on a system with unzip, tar and Python:

```sh
mkdir -p /tmp/exploreda-review-362db580
unzip evidence/deployment-build.zip -d /tmp/exploreda-review-362db580
tar -xf /tmp/exploreda-review-362db580/artifact.tar -C /tmp/exploreda-review-362db580
python -m http.server 8765 --bind 127.0.0.1 --directory /tmp/exploreda-review-362db580
```

Run browser work only in an environment where navigation is authorized. Do not remove managed browser policies. The production build omits the development-only coverage matrix; omit `--coverage` for this target.

```sh
python browser/capture_review_targets.py --base-url http://127.0.0.1:8765 --output /tmp/exploreda-captures
```

Playwright and an installed browser are required. Use the approved CI/browser toolchain; the utility accepts `--chromium` or `--cdp` when an authorized browser is already available. It does not alter the repository or browser policy, and it does not mutate the app's data. Review actual behavior with the 35 scenarios in report 04/data/browser-scenarios.json and retain new proof independently from this blocked audit.

## Coverage recount

`python data/recount_coverage.py` validates the included source-transcribed manifest counts. This utility uses only the standard library and was run successfully during report QA. It does not fetch or execute current repository code and is not a browser test.

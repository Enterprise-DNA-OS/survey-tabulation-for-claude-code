---
description: Create a private full archive. It contains respondent records and raw source columns. Do not put it in git or share it publicly. Existing files cannot be overwritten.
---

Read CLAUDE.md. Create a private full archive. It contains respondent records and raw source columns. Do not put it in git or share it publicly. Existing files cannot be overwritten.

```bash
npm run survey -- export --out=exports/<new-name>.json --json
```

Replace angle-bracket values with the operator's records. If names are ambiguous, use the listed ID. Never invent an answer. Present the source wave, unweighted base, weight treatment and review gaps with the result.

---
description: Read docs/replace-q-research.md. Map the actual CSV headings and inspect the dry run. Repeat without --dry-run only after reconciling source counts.
---

Read CLAUDE.md. Read docs/replace-q-research.md. Map the actual CSV headings and inspect the dry run. Repeat without --dry-run only after reconciling source counts.

```bash
npm run survey -- import q-research --study="<study>" --name="<new wave>" --file="<private CSV>" --map="<private mapping JSON>" --source="<source description>" --exported-at=<UTC timestamp> --actor="<operator>" --dry-run --json
```

Replace angle-bracket values with the operator's records. If names are ambiguous, use the listed ID. Never invent an answer. Present the source wave, unweighted base, weight treatment and review gaps with the result.

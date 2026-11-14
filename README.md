# Survey Tabulation for Claude Code

Own the records and rules behind your survey summaries. Bring Q Research Software CSV exports into a database, compare weighted responses and retain the evidence behind each result.

## Three ways to use it

- **Do it yourself:** free MIT source. Run with Claude Code, Codex, OpenCode or Cursor.
- **We customise it:** Enterprise DNA maps your questions, weights and reporting rules. One setup fee, then a retainer.
- **We run it for you:** installed and operated through **Omni by Enterprise DNA**. One setup fee, then a retainer. [Talk to Sam](https://enterprisedna.co/omni/book?offer=replace-software&utm_campaign=q-research&utm_medium=readme).

## Start with fictional records

Node 20 or newer. PGlite runs locally. DATABASE_URL selects PostgreSQL.

```bash
npm install
npm run demo
npm run survey -- datasets
npm run survey -- crosstab --dataset="November wave" --variable=choice --by=region
npm run survey -- numeric --dataset="November wave" --variable=rating
npm run survey -- weight-check --dataset="November wave"
npm run survey -- weekly-review --json
npm run view
npm run docs
npm test
```

The demo has two synthetic waves, missing ratings, a stale source export and a study with overdue reviews. Seed is idempotent. Use an empty local database. This is a descriptive survey tabulation desk, not a full replacement for Q's modelling, significance testing or Office automation.

## The research week

Reconcile each wave with /datasets. Review /missingness and /weight-check before /frequencies, /crosstab or /numeric. Use /trend only after checking that question and category definitions agree. /weekly-review gathers overdue reviews and stale findings. /save-analysis records a result snapshot and /draft-report writes an internal paper without sending it.

[Methods](docs/methods.md) defines denominators, low-base masking and the limits of weighted estimates. [Import guide](docs/replace-q-research.md) shows the one-command CSV path. [Compliance](docs/compliance.md) cites the NZ privacy principles used for evidence checks.

## Ten questions the desk answers today

1. Which wave has the most missing ratings?
2. How does weighted channel preference differ by region?
3. How much do weights reduce the effective base?
4. Which saved findings became stale after an exclusion?
5. Which source exports are more than 30 days old?
6. Which studies lack purpose or review evidence?
7. What changed between two waves with the same response definitions?
8. Which respondents were excluded and why?
9. What exact specification produced this saved result?
10. Which zero-weight responses remain in the source count?

Q supports custom analysis too. These are working examples for this build, not claims that Q cannot calculate them. Detail, audit and export retain the source evidence needed to investigate exclusions and estimates.

## Commands

- /help: Read the available commands and flags.
- /studies: Review study owners, purpose and review dates.
- /datasets: Reconcile survey waves and respondent counts.
- /detail: Read a wave and its review notes before changing it.
- /cases: Review respondent IDs, weights, exclusions and reasons.
- /variables: Read the mapped variable types before choosing an analysis.
- /frequencies: Produce weighted category shares, with missing values excluded from the denominator.
- /crosstab: Compare a response by a categorical segment. This is descriptive, not a significance test.
- /numeric: Show a weighted mean and observed range.
- /weight-check: Review zero weights, range and the weight-only effective base.
- /missingness: Count missing answers among active respondents.
- /attention: Review missing evidence, overdue reviews and old source exports.
- /compliance: Read docs/compliance.md first. Report missing evidence against the cited principles. These checks do not certify compliance.
- /weekly-review: Prepare the Monday wave reconciliation, review queue and stale-analysis list. Then read weight-check and missingness for the current wave.
- /imports: Review source provenance, fingerprints and export dates.
- /history: Read saved analyses and whether their source or policy changed.
- /audit: Read operator-labelled changes. Labels are not authenticated identities.
- /add-study: Register the authorised study and its actual purpose and review dates.
- /update-study: Read studies first. Update supplied evidence or the small-base policy, recording why. Every saved analysis for this study becomes stale.
- /import: Read docs/replace-q-research.md. Map the actual CSV headings and inspect the dry run. Repeat without --dry-run only after reconciling source counts.
- /exclude: Read detail. Exclude a case for an operator-supplied reason, keeping its original data. Saved results become stale.
- /restore: Read detail and audit. Restore an excluded case with a reason. Saved results become stale.
- /log: Record the actual research review, not an invented decision.
- /save-analysis: Review the current evidence and specification. Save an immutable result snapshot.
- /draft-report: Choose a current saved analysis from history. Draft locally. Review sampling, missingness, weighting and disclosure before any release. Never send.
- /export: Create a private full archive. It contains respondent records and raw source columns. Do not put it in git or share it publicly. Existing files cannot be overwritten.
- /trend: Compare the same variable across dated waves. Check wording, category definitions and samples first. Differences are descriptive, not causal or significance claims.
- /customise: Add a field or change an operating rule with a migration and tests.
- /new-view: Add a read-only branded view from the database.

Every CLI command supports --json. Names match without case and IDs accept prefixes. Ambiguous matches list candidates and exit 1. Writes require --actor except file-only drafts and exports. Saved analyses are immutable. Source exclusions, restores and study policy updates invalidate them. Unknown flags fail.

## Documents and views

Edit brand.json, then run npm run docs for study review records and saved analysis records. npm run view renders wave health, overdue reviews and analysis history. Generated files are internal snapshots and stay out of git. Rerender after changes. [Why no front end](docs/why-no-front-end.md).

## Your first hour: ten things to ask for

1. Put our business name on the research pack.
2. List the latest survey waves.
3. Show missing responses by variable.
4. Explain the weight-only effective base.
5. Compare channel preference by region.
6. Check overdue study reviews.
7. Preview a Q export before import.
8. Record why a respondent was excluded.
9. Save a result and draft its internal report.
10. Add our study reference field with /customise.

## Scope and operation

The build does not collect surveys, send invitations or certify lawful use. It does not recreate Q's advanced statistical engine. Review [operations](docs/operations.md) before shared deployment and [research](docs/research.md) for the target evidence. Retain Q until the required analysis and source reconciliation are accepted. Agent subscriptions, hosting and operation remain your costs.

MIT. Not affiliated with Q Research Software, Displayr or Anthropic.

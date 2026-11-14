# Research record checks

Sources checked 2026-11-14. This is an evidence checklist for a New Zealand operator, not legal certification or a replacement for professional review. Australian and other deployments need their applicable rules configured before use.

| Check | Record test | Source |
|---|---|---|
| Purpose | Study purpose and owner are present | [NZ Privacy Principle 1](https://www.privacy.org.nz/privacy-principles/1/): necessary collection for a lawful business purpose |
| Accuracy review | A review date exists and has not passed | [NZ Privacy Principle 8](https://www.privacy.org.nz/privacy-principles/8/): assess information quality before use or disclosure |
| Retention review | A review date exists and has not passed | [NZ Privacy Principle 9](https://www.privacy.org.nz/privacy-principles/9/): do not keep personal information beyond its lawful need |

Run npm run survey -- compliance. Missing evidence blocks save-analysis and draft-report. The operator supplies review dates and documentary reasons. No fixed review interval is asserted to be law. A passed date check proves only that fields are present, not that the underlying review happened or the processing is lawful. The 30-day source-age check is an operating reminder, not a retention period. No automatic deletion occurs.

Use pseudonymous respondent IDs. Remove unnecessary identifying columns before export. The importer retains every raw column, including unmapped ones, so inspect the source first. Reading existing data is still possible while a study is on hold, for investigation and correction. Source files, private archives and generated drafts must be covered by access and retention procedures.

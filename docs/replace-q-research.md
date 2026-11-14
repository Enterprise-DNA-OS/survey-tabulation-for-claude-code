# Move a survey wave from Q Research Software

1. In Q, open Variables and Questions and select the variables you need. Export Variables to Excel, choosing labels rather than numeric codes for categorical variables. Save as CSV. Include a stable pseudonymous respondent ID and the final numeric weight if you use one.
2. Keep the Q project and a source data dictionary privately. CSV does not preserve all analysis settings or question structures. Compare the exported rows and variables with Q before importing.
3. Copy fixtures/mapping.json into a private folder. Set id to the exact ID heading, weight to the weight heading, and map each analysed variable's column, local name, kind and missing labels. If weight is omitted, every case has weight 1. This is explicit, not detected from the data. Remove unnecessary identifying columns before export.
4. Register the study with add-study, recording its owner, purpose and review dates. Run the one import command below as a dry run. Check the row count, variable count, zero weights and unmapped columns. Repeat without --dry-run after review.

```bash
npm run survey -- import q-research --study="Harbour Shopper Study" --name="Imported fixture" --file=fixtures/q-export.csv --map=fixtures/mapping.json --source="Synthetic Q-shaped fixture" --exported-at=2026-11-13T00:00:00Z --actor="Demo operator" --dry-run
```

The fixture is synthetic, not a downloaded customer export. Headers vary by project, which is why the mapping is required. A new import is transactional. Repeating identical content, mapping, source and timestamp under the same wave name is a no-op. Changed content under that name is rejected. Use a new wave name to retain previous evidence. Blank or duplicate IDs, malformed CSV, missing mapped columns, negative or nonfinite weights and nonnumeric numeric responses fail before any data is written.

Use datasets, missingness, weight-check and frequencies to reconcile with the same filters, exclusions, labels and weights in Q. No QPack, SAV file, model, R expression, automatic significance result, Office link or live connection is imported. Multi-response questions need a separately agreed mapping and analysis method. We customise those requirements before a switch.

Sources checked 2026-11-14: [CSV with labels](https://help.qresearchsoftware.com/hc/en-us/articles/4416438834575-How-to-Export-Save-data-as-a-CSV-File-with-Value-Labels), [sharing data and results](https://help.qresearchsoftware.com/hc/en-us/articles/4413557192975-How-to-Share-Data-And-Results). Exporting raw data does not preserve every transformation made in the output view. Check the source dictionary and compare a known result.

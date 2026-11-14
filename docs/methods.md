# Methods and limits

An active case is not excluded and has weight greater than zero. Zero-weight cases remain in the reconciliation but do not contribute to any estimate. Missing target answers are removed from the denominator for that target only. A missing segment is excluded from segmented analyses. A blank string is always missing. The mapping can name further missing labels. Numeric parsing rejects nonfinite values. A categorical value is a single label, not a multi-response set.

Category percentage is 100 times the sum of category weights divided by the sum of valid-answer weights. The weighted mean is the sum of value times weight divided by valid-answer weight. Minimum and maximum are observed values among active valid cases. Unweighted base is the number of those cases. Effective base is Kish's weight-only expression: sum(weight)^2 / sum(weight^2). It describes weight concentration only. It does not account for clusters, strata, finite populations or response bias. No confidence intervals or significance tests are provided.

The study min_base is an operator policy, default 5. Results for a group below that unweighted valid-answer base are masked. Category counts within a sufficiently large group are not masked. Totals, other outputs, source data and repeated queries can disclose small cells. Everything generated here is an internal working document. This is not a disclosure-control system.

Trend aligns variable names across waves. The researcher must check question wording, response codes, eligibility and weighting. A wave with a missing variable or incompatible type fails instead of silently becoming zero. Numeric trends require --kind=numeric. There is no paired-panel inference, automatic raking, multi-response analysis, regression, conjoint or MaxDiff. Existing Q project formulas, model outputs, chart layouts and report links need a separately scoped migration.

Read-only CLI results reflect current records. save-analysis stores the specification, result, source revision and actor. Study policy updates and exclusions increment source revisions. draft-report refuses a stale result or missing study review evidence. Rendered analysis records show their freshness at render time; rerender before review. Previously written files are snapshots and do not update themselves.

Input limits: weights must be between zero and one billion, and numeric answers between minus and plus one trillion. Larger values fail rather than risking nonfinite arithmetic. These are implementation bounds, not survey rules.

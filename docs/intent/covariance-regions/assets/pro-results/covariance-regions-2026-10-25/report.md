**Decision — Build descriptive covariance regions for scatter points and bubbles, estimated from each group’s complete chart-local source population before interactive filtering.** Use the arithmetic center, sample covariance with denominator \(n-1\), raw numeric field values, and a default covariance-distance radius \(k=2\). Categorical color produces one reference per group and facet; numeric color produces one reference per facet. An inside/outside action selects the complete source membership through the existing chart-owned `__ID` value filter. Own, peer, and workspace selections then intersect or highlight those records without moving the defining boundary. Persist settings, the existing selected-ID filter, and a small selection-origin marker; derive the model and geometry. Ship the complete linear-axis journey first, then projection of the same raw region through nonlinear axes and optional principal spread directions. Do not require research PRs #520, #524, or #526, a new selection engine, or outside demand.

# Covariance regions for linked scatter analysis

Design report for explorEDA  
Research date: **October 25, 2026, America/Indianapolis**  
Authoritative source baseline: **`9d64a021e35d312887b1bc848e307f42b6c3091f`**  
Companion: [implementation-plan.md](implementation-plan.md)

## 1. Access, scope, and evidence

**Access confirmed.** Both attachments were readable. The complete source packet contains 45 files, all read in full across the review. Nine narrowly relevant supplementary files were fetched and read at the exact full commit to settle filter, positional-ID, population, and facet behavior. Two demo history files were inspected in relevant sections only. The inventory at the end distinguishes these categories.

This report separates:

- **Source facts:** behavior established by the packet or exact-baseline supplementary source, cited by path and symbol.
- **External findings:** primary documents, product documentation, and source inspected during this run, identified as [S1]–[S14].
- **Proposals:** the chosen product, numerical implementation, integration, and acceptance contract. These are not shipped behavior.
- **Executed mathematical checks:** independent rational-arithmetic fixture calculations and a few independent boundary evaluations. No explorEDA application code, application test suite, browser journey, or export path was executed.

The attached mission and `docs/research/DIRECTION.md` make the repository owner the demand. The older gates in R004 and `scientific-multivariate-analysis/intent-brief.md` do not control this design. The three neighboring research PRs are treated as unbuilt proposals as instructed; their implementations are not prerequisites. This mission does not implement pooled/within/between decomposition, residual diagnostics, or parameterized notebooks.

### 1.1 What the source already provides

| Established source fact | Design consequence |
| --- | --- |
| `ScatterPlot/definition.ts: ScatterPlotSettings` already supports points, density, hexbin, contours, regression, paired summaries, marginals, sizes, and ordered connections, but no covariance-region setting. | Add one distinct analytical overlay. Keep existing contours and hand-authored ellipse annotations separate. |
| `pairedSummary.ts: pairedStats` uses finite X/Y pairs and \(n-1\) sample covariance. | Preserve its statistical definition; use a stable shared numerical helper rather than creating conflicting covariance meanings. |
| `fitPlan.ts: groupScatterRows` groups `plan.rowSets.facet` only when the color scale/legend is categorical. | Reuse canonical category identities and ordering, but supply the source-reference population instead of copying the live fit population. |
| `useScatterFits.ts` and `fitInputKey` exclude own-brush changes from fitting; peer filters can change the fit population. | That is useful precedent for separating model and projection, but it does not by itself keep a selected region fixed under peer filters. |
| `scatterPlan.ts: planScatter` separates all, chart, filtered, and facet rows. Finite pairs can be undrawn because of log domain, bubble size, or clipping. | Never estimate from visible glyphs or use point rendering as membership truth. |
| Supplementary `useGetLiveData.tsx: useGetAllIds` takes all rows and applies `localFilters`, without interactive filters. | This supplies the smallest sound reference ownership rule. |
| Supplementary `FacetRelated/FacetContainer.tsx` groups those all-source IDs, and layouts pass `facet.ids` plus semantic `facetKey`. | The reference can remain facet-specific even when peers exclude every row of that facet. |
| `FilterTypes.ts`, `applyFilter.ts`, and `categories.ts` support `{type:"value",field:"__ID",values:[...]}`; an empty array matches zero rows. | Reuse exact record selection, including an exact empty result. No quadratic filter type is needed. |
| `DataLayerProvider.tsx`, `carryRowSelections.ts`, and `sourceRowIdentity.ts` use distinct positional-filter and project-reference mechanisms. | Do not claim that project entity keys make scatter’s `__ID` selections durable across arbitrary replacement. |

All abbreviated library paths in this report start at `packages/explorEDA/src/`. Full paths and symbols appear in §8 and the final inventory.

## 2. What the analyst can accomplish

The feature should answer a specific question: **“How do these observed clouds differ in location, orientation, and spread, and which records lie inside or outside the boundary that has been declared?”**

The first useful journey is:

1. Choose two numeric fields in Scatter Plot and a categorical color field such as Batch.
2. Enable **Covariance region**. The default is radius **2**, with group-colored outlines and a small center mark.
3. Read the persistent description **“Raw values · radius 2 · reference: chart source”**. The source reference includes the chart’s local restrictions and current facet. It ignores interactive linked filters.
4. Compare the two centers, shapes, and orientations. Use the existing header trace control or Alt-click/Alt-Enter on a region to inspect its calculation.
5. In the trace, inspect the exact estimation records, excluded pairs, center, covariance, and inside/outside source records.
6. Choose **Select outside source rows** for Batch A. The chart writes its exact outside ID set into its ordinary linked selection.
7. Use another chart to narrow Phase. The reference remains unchanged; the trace distinguishes source membership from records currently passing other filters.
8. Save a complete analysis, undo/redo the selection, and reopen the saved analysis. The same rows, settings, radius, and selected IDs reproduce the relationship.

The proposed deterministic example contains 20 source records, 18 finite pairs, and two groups. Batch A has 11 finite pairs and Batch B has 7. At radius 2, the outside records are exactly **A10 and A11**; two incomplete pairs are unclassified. The complete data and independent expected values are in §7.

An outside record is not automatically erroneous, defective, anomalous, or causally important. Overlap between two regions is not a significance test. A larger outline is a larger sample-covariance spread in the selected coordinates; it is not a larger confidence interval for the mean. These distinctions are part of the feature’s meaning, not optional documentation.

## 3. Statistical and product alternatives

### 3.1 Which kind of region belongs first?

| Approach | What it answers and why it wins or loses here |
| --- | --- |
| **Descriptive sample-covariance region — choose first** | Summarizes observed center and joint spread, with a declared distance threshold and directly inspectable contributors. It needs no normality assumption to define its geometry or classify the supplied records. This matches the requested comparison and selection workflow. |
| **Confidence region for the population mean — defer** | Quantifies uncertainty about a mean under a sampling model. It usually shrinks with increasing sample size and answers a different question from the extent of an observed cloud. A point outside it is not thereby an unusual observation. |
| **Prediction region — defer** | Targets a future observation from a specified population and includes estimation uncertainty. Its calibration and assumptions differ from a fixed descriptive radius. |
| **Tolerance region — defer** | Seeks a population content at a stated confidence level. It requires two probability parameters and additional calibration, not just a percentage on an ellipse control. |
| **Robust location/scatter region — explore later** | Can reduce the influence of extreme records, but changes the estimator and the meaning of contributing/support rows. It needs explicit support, correction, reproducibility, and multimodality behavior. It is not a visual style for ordinary covariance. |
| **Covariance-scaled distance without an outline — supporting trace** | Gives an exact per-record relation to the model and works without a visible point. It is valuable in the trace, but alone makes comparing two clouds’ direction and spread unnecessarily indirect. |
| **Principal spread axes without a region — optional extension** | Makes center and dominant spread directions clear, including a degenerate line. It does not define an enclosed two-dimensional selection, and its numeric direction depends on coordinate units. |

Friendly, Monette, and Fox define the data ellipse through sample center, covariance, and a distance radius, while treating confidence ellipsoids as separate statistical objects [S1]. R’s `mahalanobis` documents the corresponding squared quadratic distance [S2]. These are the conceptual basis of the selected descriptive feature.

For two dimensions, under independent identically distributed bivariate normal sampling and \(n>2\), the **mean-confidence** threshold in sample-Mahalanobis units is:

\[
q_{\text{mean}} =
\frac{2(n-1)}{n(n-2)}F_{2,n-2}(1-\alpha).
\]

For one **independent future observation**, the corresponding prediction threshold is:

\[
q_{\text{new}} =
\frac{2(n+1)(n-1)}{n(n-2)}F_{2,n-2}(1-\alpha).
\]

These formulas are included to demonstrate why the meanings are not interchangeable, not to propose an inferential implementation [S4]. A tolerance region additionally distinguishes target content from confidence in achieving that content [S7].

### 3.2 Lessons from credible products and source

- **JMP Graph Builder and Bivariate**
  - Graph Builder exposes a mean point, correlation, coverage controls, and an option to perform computations on transformed coordinates.
  - Its Bivariate density-ellipse documentation explicitly invokes a fitted bivariate normal distribution.
  - Adopt the visible center and group comparison. Do not inherit a percentage label or let an axis-display change silently switch the statistical coordinate space. [S5, S6]

- **SAS ellipse procedures**
  - SAS explicitly separates mean-confidence from future-observation prediction and states their bivariate-normal assumptions.
  - Adopt its separation of statistical questions. The default explorEDA control should describe a raw distance radius instead of asking the analyst to choose between inference methods. [S4]

- **ggplot2 `stat_ellipse`**
  - Current documentation distinguishes `t`, `norm`, and Euclidean variants.
  - The inspected v4.0.3 source uses different covariance estimation branches and an F-based radius for its non-Euclidean variants.
  - Therefore, a generic call with a familiar `level` is not an independent oracle for this report’s \(n-1\), fixed-\(k\) geometry. Validate the exact formula instead. [S8, S9]

- **scikit-learn robust covariance and EllipticEnvelope**
  - MinCovDet distinguishes raw support and corrected/reweighted results and warns about multimodal populations.
  - EllipticEnvelope introduces an outlier decision threshold tied to a contamination parameter.
  - Adopt the distinction between estimation and classification policy. Do not silently trim rows or turn an outside count into an error count. [S10, S11]

A confusing point in the sources deserves explicit treatment: statistical and product literature sometimes uses “data,” “density,” “confidence,” and “prediction” loosely around similar-looking ellipses. The selected contract is defined by its formula, population, and radius. It does not infer a guarantee from the noun used in another product.

### 3.3 Why radius 2 is not “95%”

The boundary parameter is **\(k\), a positive covariance-scaled distance**, with \(q\le k^2\) inside. Radius 2 means a squared threshold of 4. It is an interpretable, conventional spread multiplier and a useful starting shape, not an empirical-coverage optimizer.

For a bivariate normal population with its **true** mean and covariance known, the squared distance has a chi-square distribution with two degrees of freedom. Integrating that density gives \(P(q\le k^2)=1-\exp(-k^2/2)\). Consequently, \(k=2\) corresponds to about **86.47%** in that specific population model; 95% would require approximately **2.44775** [S12, independent substitution]. These are explanatory counterexamples to the common “two sigma means 95%” mistake.

Those percentages are **not** promised for a finite sample tested against its own estimated covariance, a nonnormal cloud, or an adaptively filtered sample. The UI displays observed counts such as **9 of 11 source pairs inside**, and labels any fraction as an observed source share. It does not call that share confidence or calibrated coverage.

## 4. Reference ownership: the central design decision

### 4.1 Compare the three credible lifecycles

| Lifecycle | Decision |
| --- | --- |
| **Live per-group fitting from current peer-eligible rows** | Low initial drawing cost and consistent with current fits, but a peer filter can move the boundary after records have been selected. Keeping its original meaning then requires clearing/relabeling the result or preserving an origin model. Do not choose this as the first lifecycle. |
| **Explicit source-defined reference** | **Choose.** Fit each source group/facet after chart-local restrictions and before interactive filters. It is stable through linked exploration, reproducible from saved rows/settings, and requires no frozen matrix or reference-row snapshots. |
| **Captured/frozen reference with a separate tested population** | Useful for baseline-versus-new-data work, but adds source binding, stored estimation provenance, replacement/release actions, and refresh semantics. Defer that state until this distinct capability is intentionally built. |

The chosen reference is **fixed with respect to interactive filters**, not immutable across data replacement. “Chart source” is a declarative population rule; it is not a saved copy of historical measurements.

A chart-local restriction is how an analyst deliberately changes the reference. For example, restricting the chart’s population to Phase=Core estimates a Core reference. Clicking Core in a peer chart instead examines Core records against the full chart-source reference. This distinction must be visible in both trace scope and documentation.

The source provides the appropriate seam: `useGetAllIds(settings)` applies `localFilters` to all rows; `FacetContainer` groups those full-source IDs. Current regression still uses peer-eligible `rowSets.facet`. Both overlays can coexist, but their traces must state their different population rules.

### 4.2 Population definitions

For one semantic facet \(f\) and one categorical group \(g\):

| Symbol / role | Exact definition |
| --- | --- |
| \(R_{fg}\), reference candidates | All current source IDs passing the chart’s `localFilters`, belonging to facet \(f\), and belonging to group \(g\). No interactive chart, peer, Rows, or workspace filter changes this set. |
| \(E_{fg}\), estimation pairs | Members of \(R_{fg}\) with finite parsed numeric X and Y. They supply both coordinates of every covariance term. |
| \(T_{fg}\), currently tested/eligible pairs | \(E_{fg}\cap\) the chart’s peer/workspace-eligible IDs before its own interactive filter. This is the current readout scope. |
| \(I_{fg},O_{fg}\), source memberships | Classify all \(E_{fg}\) against its declared region. \(I\) contains boundary points; \(O\) is the remaining numerically classifiable pairs. These are the sets selection actions materialize. |
| \(U_{fg}\), unclassified | Missing/nonfinite pairs, and finite pairs whose region is unavailable or numerically unusable. They are not silently assigned outside. |
| \(M\), selected record IDs | The complete \(I_{fg}\) or \(O_{fg}\) for one chosen region and side, stored in the existing chart-owned ID filter. |
| \(V_{fg}\), drawable/current marks | The appropriate drawn-point subset after the renderer’s log-domain, size, clipping, display-mode, and filter treatment. It can differ from \(E\), \(T\), and \(M\). |
| Geometry | A projection of the reference model through the axes. Screen vertices and clipping have no authority over \(I\), \(O\), or \(M\). |

“Currently tested” is a readout subset: the engine also classifies all reference pairs so that a region selection behaves like an ordinary filter. For a usable model, \(I\cap O=\varnothing\) and \(I\cup O=E\), except any explicitly reported numerical classification failures. For an unavailable model, there is no inside/outside partition.

Counts must say which set they describe. Do not show a single unlabeled “N” that alternates between estimation, selected, or visible rows.

### 4.3 Selection semantics

**Select the complete source membership, not only the records currently visible through other filters.** If Batch A has two outside source rows but Phase=Core currently hides both, the action reads:

- **Select 2 outside source rows**
- **0 currently pass other filters**

The resulting chart filter stores both IDs. The linked result is initially empty. Clearing the peer Phase filter reveals those same two selected members; the region and its selected set have not changed.

This is ordinary conjunction of owned filters. It avoids a hidden “whatever happened to be visible when clicked” snapshot. It also avoids a dynamically recomputed selection that repeatedly refits itself.

An action addresses **one region in one facet**:

- Selecting inside A never selects B merely because a B point lies geometrically inside A’s outline.
- Selecting outside A means outside among A’s reference pairs, not “every row in the workspace that is not inside A.”
- No implicit union/intersection of overlapping regions, all-group selection, or cross-group testing is needed in M1.
- Numeric color gives one region. Numeric codes deliberately mapped through a categorical scale follow the existing categorical-scale grouping semantics.
- Missing categorical values follow existing typed category-key semantics and can form a group if its X/Y pairs are valid.

The action replaces the chart’s current interactive `filters` with one `__ID` value filter and a semantic origin marker in **one** `updateChart` call. It leaves `localFilters` intact. Zero membership writes `values: []`; it does not remove the filter.

### 4.4 Interaction and lifecycle rules

| Event | Required behavior |
| --- | --- |
| Any non-region own-filter action, including points, brushes, legends, marginals, facet headings, filter-chip/sidebar edits, and clear | Reference unchanged. Remove the prior region-origin marker and its old owned ID result in the same transaction; preserve the new action's intended ordinary filter, including a new generic ID result when applicable. |
| Peer or workspace filter | Reference and source memberships unchanged. Current counts and linked intersections update. Keep an outline/trace route even when no current points pass. |
| Chart-local restriction, X/Y field, radius, categorical grouping definition, or facet definition changes | Recompute the reference and clear region-origin marker plus its owned ID result atomically. State that the region changed and its prior selection was cleared. |
| Theme, palette colors, title, label formatting, bubble-size setting, bounds, pan, or zoom | Preserve model and membership. Update drawing/labels only. A color-scale change from categorical to numeric is semantic and does clear the result. |
| Disable the region or switch to an unsupported surface display | Clear the region-owned selection and marker in the same explicit action; retain unrelated selections only when they are not the region-owned result. |
| Clear chart filters / empty-plot click | Clear the ID filter and marker together. Escape must follow the existing active-editor/trace precedence, then clear the active selection when the plot owns the key. |
| Actual source reorder, changed measurements, addition/removal, or replacement with retained settings | Recompute the reference and clear the region-owned result before applied state is reported; show a visible source-change reason. Do not silently carry the old “inside/outside” claim. |
| Exact-equal rows in the same order supplied as a new array | Preserve when the existing equality utility establishes equality. Do not use object identity alone as evidence of a changed population. |
| Full analysis reopen / same-source history restore | Restore rows and settings together, recompute derived results, and restore the exact ID filter and marker. |
| Unbound settings/text import onto another source | Apply the configuration, but strip the region marker and its owned positional-ID filter at the import boundary; tell the user the region selection was not carried. |

Facet invalidation follows effective row/column partition semantics. Changing visible facets, pagination, focused panel, or wrap column count is presentation only and preserves the result. Grid-versus-wrap changes invalidate only when they actually change the partition, such as adding or removing column grouping. The equal-array preservation rule requires a new guard using the existing equality utility; the baseline provider detects data prop identity changes and does not already make that structural comparison.

The refresh policy is intentionally conservative: even a pure reorder clears a region-origin selection, although the numeric reference may be identical. This avoids pretending that arbitrary positional filters, row-order-dependent calculations, or local `__ID` restrictions have durable record identity. Existing generic point/brush selections retain their current carry behavior. A later identity improvement can preserve more cases without changing the statistical contract.

## 5. Controls, drawing, and trace design

### 5.1 Initial controls and defaults

Use the current compact settings section, not a new scientific analysis sidebar.

- **Covariance region:** off by default; enable explicitly.
- **Radius:** default 2. Offer convenient 1, 2, 3 values and a custom numeric input.
  - Accept finite \(k>0\) only when \(k^2\) is also positive and finite; reject squared-radius underflow and overflow.
  - Radius is not a percentage, standard error, or unit on either original axis.
  - Invalid drafts do not apply. A continuous edit is one undo step.
- **Grouping:** inherited from categorical color; no second group picker.
- **Reference:** fixed explanatory value **Chart source** in M1.
- **Coordinate space:** fixed explanatory value **Raw values**.
- **Pooled overlay:** omitted when categorical groups exist; no pooled/within/between decomposition is introduced.
- **Principal axes:** an optional display added in M2, initially off.
- **Method menus, robust switches, confidence levels, and automatic outlier rules:** absent.

At rest, show a compact non-hover description containing radius, raw-space meaning, and reference scope. It must survive image export. Put detailed assumptions and scope in the trace rather than opening settings with a paragraph.

### 5.2 Drawing and pointer behavior

- Use a thin colored outline, a contrast halo where necessary, and a small center mark. Default to no area fill so overlapping groups and source points remain legible.
- Use the main marks’ categorical palette and dimming conventions. A group with zero current matches retains a subdued reference outline and a zero-current count.
- Draw through the existing `ScatterSvg` clip/export route. Do not create a separate chart renderer or persist screen geometry.
- Hit-test a narrow outline stroke; do not cover the whole enclosed area with an invisible click target.
- A nearby point retains its row action. An explicit region-stroke action selects inside. An empty-plot action clears. A drag still brushes, including one that starts near the outline.
- Provide **Select outside source rows** in the region’s trace/context menu. Give overlapping regions distinct names in the header trace list.
- Alt-click and Alt-Enter trace. Enter/Space select inside for the focused region subject. Context-menu keyboard access exposes outside selection.
- Use visible text/`aria-label` and the existing tooltip components; no native `title` or SVG `<title>`. Do not add an Inspect button.

The baseline’s unsized points use a different click path from bubbles, and its keyboard traversal is bubble-specific. These are concrete integration tasks, not behavior the overlay inherits automatically.

### 5.3 Trace content

Each region target needs:

1. **Identity and meaning:** X/Y names and units; facet; typed category; “sample covariance”; raw coordinate space; radius; source-reference rule.
2. **Estimation:** candidate count, finite-pair count, exact estimation IDs, and excluded records with explicit reasons.
3. **Model:** center, \(n-1\) denominator, 2×2 covariance with squared/cross-product units, and correlation when defined.
4. **Membership:** inside, outside, unclassified source counts; exact corresponding record lists; currently eligible/intersected counts separately.
5. **Visibility:** pairs hidden by axis bounds, log-domain exclusions, or invalid size. These are drawing exclusions, not absent estimation rows.
6. **Selection state:** selected side/region and stored exact record set; local-versus-linked behavior according to the provider policy.
7. **Availability:** insufficient pairs, singular structure, near-singularity, overflow, or unsupported drawing projection, without treating missing results as zero.

Reuse `TraceReadout`, `TraceSection`, existing row tracing, `ChartTraceScope`, and revision behavior. An open trace must refresh through the established mechanism or close when stale; it must never retain old counts under a new revision.

## 6. Numerical and geometric contract

### 6.1 Preparation and moments

Use `finiteNumber` from `lib/valueParsing.ts` after the application’s existing field preparation/calculation rules. “Raw” means the numeric field values **before the axis transform**; it does not bypass calculated fields or type preparation.

For \(E=\{z_i=(x_i,y_i)^T\}_{i=1}^{n}\):

\[
\mu=\frac1n\sum_i z_i,\qquad
S=\frac1{n-1}\sum_i(z_i-\mu)(z_i-\mu)^T.
\]

Both coordinates of every covariance entry use the **same finite pair set**. Do not calculate X variance from one marginal population and Y variance from another. R documents the sample denominator and warns that separately completed entries can produce unsuitable covariance matrices [S3].

Keep distinct records with repeated coordinates. Give every record equal weight. Bubble size, frequency-looking fields, or color values do not implicitly become statistical weights.

The existing `pairedStats` missing counts have X-first precedence: a row with both coordinates missing increments missingX only. Either preserve and label that exclusive partition, or expose the clearer disjoint reasons **X invalid only / Y invalid only / both invalid** in the new trace. Do not sum two independent missing-field counts and call them excluded rows.

### 6.2 Decomposition, radius, and membership

For a usable positive-definite covariance:

\[
S=Q\,\mathrm{diag}(\lambda_1,\lambda_2)\,Q^T,\quad
\lambda_1\ge\lambda_2>0.
\]

The boundary is

\[
z(t)=\mu+kQ
\begin{bmatrix}\sqrt{\lambda_1}&0\\0&\sqrt{\lambda_2}\end{bmatrix}
\begin{bmatrix}\cos t\\\sin t\end{bmatrix},
\quad 0\le t<2\pi.
\]

The semiaxis lengths are \(k\sqrt{\lambda_1}\) and \(k\sqrt{\lambda_2}\). Either eigenvector sign describes the same shape; a circle has no uniquely meaningful major direction.

For a query pair \(z\):

\[
q(z)=(z-\mu)^TS^{-1}(z-\mu).
\]

**Mathematical inclusion is \(q\le k^2\); boundary equality belongs inside.** Outside is \(q>k^2\). An unavailable query/model is unclassified. The polygon used for rendering, point radius, hit-stroke width, and screen pixel rounding never determine record membership.

Compute distances by a stable solve in scaled coordinates rather than materializing a large raw inverse. The inverse shown in fixtures is an independent oracle, not a mandate to use that algorithm.

### 6.3 Floating-point implementation proposal

The statistical formula above is settled. The following numerical implementation is proposed for a local TypeScript prototype:

1. Choose an observed anchor per coordinate. Form differences from that anchor, then normalize each coordinate by a nonzero characteristic spread/range. Detect subtraction overflow explicitly.
2. Compute offset means using compensated summation. Keep the anchor plus mean offset internally so high-offset membership does not rely only on a rounded displayed center.
3. Accumulate centered normalized cross-products with compensated sums, using \(n-1\). Reconstruct raw covariance only where representable.
4. Use the normalized 2×2 matrix for positive-definiteness/conditioning and the distance solve. Use a scaled symmetric 2×2 eigensolver for geometric axes; compute the smaller eigenvalue with a cancellation-conscious route.
5. Reject nonfinite intermediate results with a numerical status. Do not silently clip an extreme record, drop it from \(n\), add diagonal jitter, or turn a negative eigenvalue into a positive one.

LAPACK’s small symmetric eigensolver explicitly notes that the smaller eigenvalue can lose accuracy when the determinant suffers cancellation [S13]. Its documentation supports a careful numerical seam, not a claim that a direct quadratic formula is always safe.

**Prototype candidates, not validated production thresholds:**

| Quantity | Starting candidate and required proof |
| --- | --- |
| Near-singularity | Test a dimensionless correlation/normalized-matrix condition, initially \(1-|\rho|\le10^{-12}\) as unavailable. Prove behavior on F6 under unit changes; revise before shipping if the distance oracle shows unacceptable error. |
| Roundoff-sized negative eigenvalue/correlation overshoot | Permit only an explicitly bounded rounding correction relative to normalized scale; test a candidate around \(64\epsilon\). Larger violations are numerical failures, not repair opportunities. |
| Boundary comparison | Start with \(\tau_q=64\epsilon\max(k^2,|q|)\) only for accepted, well-conditioned inputs, with no absolute 1 floor. A point within the band is included and identified as boundary-rounded if exposed in the trace. This is a numerical inclusion convention, not an exact real-arithmetic guarantee. |
| Projection error | Start M2 at a maximum 0.5 CSS-pixel chord deviation, with 0.25 pixels explored if the export comparison requires it. Membership remains independent of this number. |

Here \(\epsilon\) is `Number.EPSILON`. None of these tolerances is a statistical guarantee. In particular, the simple boundary band is **not** a proved error bound for a poorly conditioned model. The worker must compare against the exact rational fixtures and high-precision stress cases. If a model cannot support reliable classification, report it unavailable; do not widen the tolerance until a desired set of records fits.

F1’s \(10^{-9}\) boundary probes are deliberate guards against an overly generous epsilon. Add a small-radius test at \(k=10^{-10}\): the center remains inside, while the representable query `(10 + 1e-7, 20)` is outside, with squared distance about \(4.44\times10^{-15}\) against a threshold of \(10^{-20}\). An absolute epsilon floor must not turn the tolerance into an undisclosed larger radius. Reject `k=1e-200` when its square underflows to zero, and `k=1e200` when its square overflows. Near-machine-precision ties need an exact oracle for the actual represented input values before a production threshold is accepted; unresolved comparisons must become explicitly unclassified or make the model unavailable, never be repaired by a broad inclusion band.

### 6.4 Degenerate and difficult populations

| Case | Required result |
| --- | --- |
| No finite pair | No center or covariance; explain zero pairs. |
| One finite pair | Center available, covariance unavailable. No inside/outside action. |
| Two pairs | Sample covariance exists but has rank at most one. No two-dimensional classification. |
| Collinear pairs / one constant coordinate | Report covariance and singular status. M2 may draw an informational spread segment. Do not enable region selection. |
| Both coordinates constant | Report the center and zero covariance. No area or classification. |
| Nearly singular | Distinguish mathematically full rank from numerically unusable. Use a dimensionless criterion and explicit status. |
| Unequal units/scales | Normalize internally for numerical work without changing the raw-space statistical definition. An absolute raw-eigenvalue cutoff is unacceptable. |
| High offsets | Anchor and center before products; do not use \(E[XY]-E[X]E[Y]\). Precision already lost in input numbers cannot be recovered. |
| Repeated points | Preserve all contributing IDs and use the true \(n\). Deduplicating coordinates changes sample covariance. |
| Extreme records | Include them in ordinary covariance. Show their effect through the trace; do not silently robustify. |
| Nonfinite/invalid fields | Exclude from finite pairs using shared parsing; show exact reasons and IDs. |
| Overflow/underflow that defeats reliable geometry or classification | Return an unavailable numerical result; keep records inspectable. A screen drawing failure must not fabricate an empty member set. |

A pseudoinverse by itself is not a bounded degenerate ellipse: for a rank-one covariance it ignores displacement orthogonal to the supported line and can classify an off-line point as inside. F4 demonstrates this directly. A future singular-membership feature would require a support-subspace test and a meaningful tolerance. It is deliberately excluded from this implementation.

### 6.5 Units, axes, and projection

For an invertible affine coordinate change \(z'=Az+b\):

\[
\mu'=A\mu+b,\quad S'=ASA^T,\quad q'(z')=q(z).
\]

Thus unit conversion with offset, reflection, and axis swapping must preserve record membership when the reference and tested coordinates are transformed consistently. The **whole region** transforms; the numeric principal-axis angle need not remain the same after unequal rescaling of X and Y. In mixed units, the displayed direction is a coordinate-space summary, not a unit-independent physical direction.

- **Axis bounds, zoom, and clipping:** change projected geometry and hidden-mark counts only. Do not change \(E\), covariance, \(I/O\), or selected IDs. Use `limits`, not deprecated `min/max`.
- **Categorical X or Y:** covariance region unavailable. Never interpret band positions as measurements.
- **Log/symlog:** calculation remains in raw units. An ellipse mapped through a nonlinear transform is generally not a screen ellipse.
  - M1 keeps raw statistics and valid membership accessible but suppresses nonlinear-axis boundary drawing with an actionable notice: **“Use linear axes to display this raw covariance region.”**
  - M2 samples the raw boundary and maps each valid segment through the existing scales.
  - On log axes, nonpositive finite observations remain in the raw reference and membership. They are not drawable. Split boundary paths at invalid domains and viewport intersections; never connect across a missing arc.
  - Do not silently enable JMP-like transformed-coordinate estimation. If analysts intentionally want a log-space covariance, they can choose explicitly calculated log fields as X/Y; that produces a separately named raw field analysis.
- **Bubble sizes:** invalid size can hide a pair’s glyph but does not remove that pair from the region.
- **Raster/canvas point rendering:** does not change the region computation. An SVG region can remain over existing points and export through the same shell.

For M2, partition the periodic raw curve at its analytic intersections with positive log domains and relevant plot boundaries before adaptive sampling. A midpoint-only subdivision of an entire closed curve can miss curvature or tiny visible arcs; seed quadrants/extrema, measure additional interior points, and use the independently known raw curve as the geometry oracle. If a segment budget is exhausted, report limited drawing fidelity rather than changing membership or claiming a false full boundary.

## 7. Independently reproducible fixtures

These fixtures specify mathematical truth independently of the proposed implementation. Original record labels are for human comparison; actual stored `__ID` values are numeric positions.

### F1 — Rotated cloud and exact boundary probes

Reference records:

| ID | X | Y |
| --- | ---: | ---: |
| A1 | 12 | 21 |
| A2 | 8 | 19 |
| A3 | 11 | 19 |
| A4 | 9 | 21 |
| A5 | 10 | 20 |

\[
n=5,\quad \mu=(10,20),\quad
S=\begin{bmatrix}5/2&1/2\\1/2&1\end{bmatrix},
\quad
S^{-1}=\begin{bmatrix}4/9&-2/9\\-2/9&10/9\end{bmatrix}.
\]

\[
q=\frac{4\,dx^2-4\,dx\,dy+10\,dy^2}{9},\qquad
\lambda_{\pm}=\frac{7\pm\sqrt{13}}4.
\]

The major direction is \(\frac12\operatorname{atan2}(2,3)\), approximately **16.84503376299°**. At \(k=2\), the semiaxes are \(\sqrt{7+\sqrt{13}}\approx3.256616537983\) and \(\sqrt{7-\sqrt{13}}\approx1.842402975610\).

An independent parameterization, not using the eigensolver under test, is:

\[
x(t)=10+\sqrt2(2\cos t+\sin t),\qquad
y(t)=20+\sqrt2(\cos t-\sin t).
\]

Reference memberships: \(q(A1..A4)=2,\ q(A5)=0\). Radius 2 includes all five; radius 1 includes only A5.

**The following are query probes; do not add them to the estimation population.**

| Probe and coordinates | Exact \(q\) | Radius-2 result |
| --- | ---: | --- |
| P0=(10,20) | 0 | Inside |
| P1=(13,20) | 4 | Inside, boundary |
| P2=(11,22) | 4 | Inside, boundary |
| P3=(10,22) | 40/9 | Outside |
| P4=(12,22) | 40/9 | Outside |
| P5=(12,20) | 16/9 | Inside |
| P6=(14,20) | 64/9 | Outside |
| P7=(23/2,20) | 1 | Inside; boundary at radius 1 |
| P8=(13−\(10^{-9}\),20) | \(4(3-10^{-9})^2/9\) | Inside |
| P9=(13+\(10^{-9}\),20) | \(4(3+10^{-9})^2/9\) | Outside |

Exact probe sets: inside **P0,P1,P2,P5,P7,P8**; outside **P3,P4,P6,P9**.

### F2 — An actual outside source record and sensitivity to extremes

Append A6=(100,20) to F1, and recompute from all six records:

\[
\mu=(25,20),\qquad
S=\begin{bmatrix}1352&2/5\\2/5&4/5\end{bmatrix}.
\]

Distances in A1–A6 order are:

\[
[1040/751,\ 1090/751,\ 1040/751,\ 1090/751,\ 125/751,\ 3125/751].
\]

At radius 2, inside is **A1–A5**, outside is **A6**. Its squared distance \(3125/751\approx4.161118508655\) is above 4 even though it participated in estimation.

An exact radius-2 boundary is:

\[
x(t)=25+52\sqrt2\cos t,\quad
y(t)=20+2\left[\frac{\sqrt2}{130}\cos t+\sqrt{\frac{6759}{8450}}\sin t\right].
\]

The extreme record changes the center from X=10 to X=25 and X variance from 2.5 to 1352. This is ordinary covariance behavior, not evidence that the record should be removed.

### F3 — Repeated coordinates

Duplicate every F1 coordinate under five new record IDs. Then:

\[
n=10,\quad\mu=(10,20),\quad
S=\begin{bmatrix}20/9&4/9\\4/9&8/9\end{bmatrix}=\frac89S_{F1}.
\]

Each noncenter record has \(q=9/4\); both center records have \(q=0\). Radius 2 includes all **ten distinct IDs**. Coordinate deduplication would produce the wrong covariance and contributor list.

### F4 — Insufficient and singular populations

| Reference records | Exact moments | Required membership behavior |
| --- | --- | --- |
| Empty | No center or covariance | No classification |
| [(5,7)] | Center (5,7); covariance unavailable | No classification |
| [(8,19),(12,21)] | Center (10,20); \(S=[[8,4],[4,2]]\); eigenvalues 10,0 | All pairs untestable |
| [(0,0),(1,2),(2,4)] | Center (1,2); \(S=[[1,2],[2,4]]\); eigenvalues 5,0 | All pairs untestable |
| [(5,1),(5,2),(5,3)] | Center (5,2); \(S=[[0,0],[0,1]]\) | All pairs untestable |
| Three records at (7,−3) | Center (7,−3); zero covariance | All pairs untestable |

Inside/outside actions are unavailable, not empty-result selections. In M2, radius-2 informational spread endpoints are respectively:

- Two-point case: \((10\pm4\sqrt2,20\pm2\sqrt2)\).
- Collinear three-point case: \((-1,-2)\) and \((3,6)\).
- Constant-X case: \((5,0)\) and \((5,4)\).
- Rank zero: center only.

The rank-one pseudoinverse would give \(q(1,3)=4/25\) for the line \(y=2x\), despite the point being off that line. The constant-X pseudoinverse gives \(q(6,2)=0\), despite X=6 being off X=5. These are rejection fixtures for a pseudoinverse-only membership shortcut.

### F5 — Affine transformations and large offsets

Transform every F1 reference and query consistently:

| Transform | Expected center | Expected covariance |
| --- | --- | --- |
| \((X+10^{12},Y-10^{12})\) | (1000000000010,−999999999980) | F1 covariance |
| \((1000X+7,-2Y+11)\) | (10007,−29) | \([[2500000,-1000],[-1000,4]]\) |
| \((Y,X)\) | (20,10) | \([[1,1/2],[1/2,5/2]]\) |
| \((-X,Y)\) | (−10,20) | \([[5/2,-1/2],[-1/2,1]]\) |

Exact distances and memberships are invariant. Integer source offsets used here are representable in binary64; a \(10^{-9}\) probe offset added to \(10^{12}\) is not necessarily distinguishable after binary64 input rounding. Keep rational invariance tests separate from representable-number implementation tests.

### F6 — Near-singularity without an absolute unit cutoff

For rational \(\delta>0\), use \([(-1,-1),(0,\delta),(1,1)]\):

\[
\mu=(0,\delta/3),\quad
S=\begin{bmatrix}1&1\\1&1+\delta^2/3\end{bmatrix},
\quad \det S=\delta^2/3.
\]

\[
\lambda_\pm=\frac{2+\delta^2/3\pm\sqrt{4+\delta^4/9}}2.
\]

| \(\delta\) | Exact determinant | Approximate minor/major ratio |
| --- | --- | ---: |
| \(10^{-4}\) | 1/300000000 | \(8.33\times10^{-10}\) |
| \(10^{-5}\) | 1/30000000000 | \(8.33\times10^{-12}\) |
| \(10^{-6}\) | 1/3000000000000 | \(8.33\times10^{-14}\) |
| \(10^{-8}\) | 1/30000000000000000 | \(8.33\times10^{-18}\) |

All four are mathematically full rank; the implementation may report some numerically unavailable. For all positive \(\delta\), each of these three estimation records has exact \(q=4/3\). Verify numerical status under the F5 unit transformations. Do not “fix” this case by treating a tiny raw eigenvalue as a unit-independent rank decision.

### F7 — Runnable two-cloud example

Use this exact CSV, preserving order and all repeated records. `Size` is a visual field, not a weight.

```csv
Record,Batch,Phase,X,Y,Size
A01,A,Core,10,20,1
A02,A,Core,10,20,1
A03,A,Core,10,20,1
A04,A,Core,9,19,1
A05,A,Core,11,21,1
A06,A,Core,9,21,1
A07,A,Core,11,19,1
A08,A,Core,9,21,1
A09,A,Core,11,19,1
A10,A,Extended,6,16,1
A11,A,Extended,14,24,1
A12,A,Core,,20,1
B01,B,Core,18,20,1
B02,B,Core,18,20,1
B03,B,Core,18,20,1
B04,B,Core,16,22,1
B05,B,Core,20,18,1
B06,B,Core,17,19,1
B07,B,Core,19,21,1
B08,B,Core,18,,1
```

| Group | Exact center and covariance | Radius-2 source membership |
| --- | --- | --- |
| A, \(n=11\) | \(\mu=(10,20)\); \(S=[[19/5,3],[3,19/5]]\) | Inside A01–A09; outside A10,A11; A12 invalid pair |
| B, \(n=7\) | \(\mu=(18,20)\); \(S=[[5/3,-1],[-1,5/3]]\) | Inside B01–B07; outside empty; B08 invalid pair |

A’s eigenvalues are \(34/5,4/5\), major direction 45°, and semiaxes \(2\sqrt{34/5},2\sqrt{4/5}\). B’s eigenvalues are \(8/3,2/3\), major direction −45°, and semiaxes \(2\sqrt{8/3},2\sqrt{2/3}\).

A distances are 0 for A01–A03; \(5/17\) for A04,A05; \(5/2\) for A06–A09; \(80/17\) for A10,A11. B’s center rows have 0; its other four finite pairs have 3.

Actual ID expectations in the stated order:

- A inside: **[0,1,2,3,4,5,6,7,8]**
- A outside: **[9,10]**
- B inside: **[12,13,14,15,16,17,18]**
- B outside: **[]**
- Invalid pairs: **[11,19]**

Totals across per-group classifications are 16 inside, 2 outside, 2 invalid pairs. This total is explanatory, not an implicit all-groups action.

**Peer versus local proof:**

- Peer Phase=Core leaves A’s reference \(n=11,\mu=(10,20),S=[[19/5,3],[3,19/5]]\). A has 9 currently eligible finite pairs and 0 currently eligible outside pairs. Selecting A outside still writes **[9,10]** and yields zero linked rows until Core is cleared.
- A chart-local Phase=Core restriction changes A’s reference to \(n=9,\mu=(10,20),S=[[3/4,-1/4],[-1/4,3/4]]\). A04 and A05 then have exact \(q=4\) and remain inside; A06–A09 have \(q=2\). All nine are inside. This is a deliberate reference edit and clears an old region selection.
- Own A-outside selection leaves the reference unchanged and shows exactly A10,A11 in the linked records.
- Selecting B outside is an exact zero-row selection, not clear-all.

For visibility tests, set A01’s Size to −1 in a separate input fixture: it remains an estimation pair but has no bubble glyph. Bound X to [9,19]: hidden rows and boundary clipping do not change membership. Use categorical Batch and then a numeric color scale to verify two models versus one model.

### F8 — Exact raw boundary with log-domain gaps

Translate F1 by \((-10,-20)\). Its reference is \([(2,1),(-2,-1),(1,-1),(-1,1),(0,0)]\), with center zero and unchanged covariance. All five records remain inside at radius 2. With both display axes positive-log, only the first record has drawable coordinates; the center itself is also undrawable. Neither fact removes the other four records from estimation or membership.

The translated raw boundary is \(x(t)=\sqrt2(2\cos t+\sin t)\), \(y(t)=\sqrt2(\cos t-\sin t)\). Both coordinates are positive only on the periodic arc \(t\in(-\arctan 2,\pi/4)\), modulo \(2\pi\). Split at the domain endpoints and clip to the viewport; do not close that arc with a straight chord.

For a controlled projection test, use a 400×300 plot before margins and positive-log domains [0.1,10] on both axes:

\[
p_x=200(1+\log_{10}x),\qquad p_y=150(1-\log_{10}y).
\]

- Raw boundary point (1,2) maps to \((200,\ 150(1-\log_{10}2))\), approximately **(200,104.8455006504)**.
- At \(t=0\), the boundary point \((2\sqrt2,\sqrt2)\) maps to approximately **(290.3089986992,127.4227503252)**.
- Raw boundary point (3,0) has no positive-log Y position and must never become a finite endpoint joined to another arc.

For a separate controlled symlog test with constant 1, use \(h(v)=\operatorname{sign}(v)\ln(1+|v|)\), domains [−3,3], and the same plot dimensions. Then \(p_x=200(1+h(x)/\ln4)\), \(p_y=150(1-h(y)/\ln4)\). The boundary point (3,0) maps to **(400,150)**, and (1,2) maps to **(300,31.1278124459)**. All five reference records have drawable symlog coordinates; clipping still has no membership effect. This is an explicit projection-test configuration, not a claim about the application's automatic symlog constant. D3's primary documentation and source define these scale mappings [S14].

The listed scale-coordinate substitutions and raw boundary values were independently evaluated in scratch. The application tessellator and its error budget remain unverified.

### 7.1 Reproduce the exact arithmetic

The core below is the independent reference approach used in scratch. It uses rational arithmetic and a direct 2×2 quadratic; it does not call explorEDA or the proposed TypeScript solver.

```python
from fractions import Fraction as F

def moments(rows):
    if not rows:
        return None, None
    n = len(rows)
    mean = tuple(sum((F(row[j]) for row in rows), F(0)) / n for j in range(2))
    if n < 2:
        return mean, None
    covariance = tuple(tuple(
        sum(((F(row[j]) - mean[j]) * (F(row[k]) - mean[k])
             for row in rows), F(0)) / (n - 1)
        for k in range(2)) for j in range(2))
    return mean, covariance

def q(point, mean, covariance):
    if covariance is None:
        return None
    a, b, c = covariance[0][0], covariance[0][1], covariance[1][1]
    determinant = a * c - b * b
    if determinant <= 0:
        return None  # The chosen contract does not classify singular regions.
    dx, dy = F(point[0]) - mean[0], F(point[1]) - mean[1]
    return (c * dx * dx - 2 * b * dx * dy + a * dy * dy) / determinant

reference = [(12,21), (8,19), (11,19), (9,21), (10,20)]
mean, covariance = moments(reference)
assert mean == (10, 20)
assert covariance == ((F(5,2), F(1,2)), (F(1,2), F(1)))
assert [q(row, mean, covariance) for row in reference] == [2,2,2,2,0]
assert q((13,20), mean, covariance) == 4
assert q((11,22), mean, covariance) == 4
assert q((10,22), mean, covariance) == F(40,9)
print("F1: center, sample covariance, and exact boundary checks passed.")

outlier = reference + [(100,20)]
mean2, covariance2 = moments(outlier)
assert mean2 == (25,20)
assert covariance2 == ((F(1352), F(2,5)), (F(2,5), F(4,5)))
assert [q(row, mean2, covariance2) for row in outlier] == [
    F(1040,751), F(1090,751), F(1040,751),
    F(1090,751), F(125,751), F(3125,751)
]
print("F2: the exact outside source record is A6.")

a = [(10,20)] * 3 + [(9,19),(11,21),(9,21),(11,19),
                      (9,21),(11,19),(6,16),(14,24)]
b = [(18,20)] * 3 + [(16,22),(20,18),(17,19),(19,21)]
ma, sa = moments(a)
mb, sb = moments(b)
assert sa == ((F(19,5),F(3)), (F(3),F(19,5)))
assert sb == ((F(5,3),F(-1)), (F(-1),F(5,3)))
assert [i for i,row in enumerate(a) if q(row,ma,sa) > 4] == [9,10]
assert all(q(row,mb,sb) <= 4 for row in b)
mc, sc = moments(a[:9])
assert sc == ((F(3,4),F(-1,4)), (F(-1,4),F(3,4)))
assert q(a[3],mc,sc) == q(a[4],mc,sc) == 4
print("F7: A10/A11 outside; local Core boundary inclusion verified.")

transforms = [
    lambda x,y: (x + 10**12, y - 10**12),
    lambda x,y: (1000*x + 7, -2*y + 11),
    lambda x,y: (y,x),
    lambda x,y: (-x,y),
]
expected = [q(row, mean, covariance) for row in reference]
for transform in transforms:
    rows = [transform(*row) for row in reference]
    mt, st = moments(rows)
    assert [q(row,mt,st) for row in rows] == expected
print("F5: four affine transformations preserve exact distances.")

for delta in [F(1,10**4),F(1,10**5),F(1,10**6),F(1,10**8)]:
    rows = [(-1,-1),(0,delta),(1,1)]
    mn, sn = moments(rows)
    assert sn[0][0]*sn[1][1]-sn[0][1]**2 == delta**2/3
    assert all(q(row,mn,sn) == F(4,3) for row in rows)
print("F6: mathematical full rank and exact distances verified.")
```

These checks establish expected mathematical values. They do not establish production floating-point tolerances, exported pixels, cache correctness, source identity, or application behavior.

## 8. Repository design and integration

### 8.1 Saved configuration

A concrete proposed shape is:

```ts
type ScatterCovarianceRegionSettings = {
  /** Descriptive radius in covariance-scaled units; default 2 when enabled. */
  radius: number;
  /** M2 only: informational principal spread directions. */
  principalAxes?: boolean;
};

type ScatterCovarianceSelection = {
  side: "inside" | "outside";
  /** Canonical facet/category identity, never a label or path index. */
  regionKey: string;
};

// Optional additions to ScatterPlotSettings:
type ScatterCovarianceFields = {
  covarianceRegion?: ScatterCovarianceRegionSettings;
  covarianceSelection?: ScatterCovarianceSelection;
};
```

The configuration’s documented semantics fix method to ordinary sample covariance, reference to chart source, and coordinates to raw numeric values. There is no need to persist repeated literal method/reference fields in every chart in this one-version application.

The existing `filters` array holds the one authoritative selected-ID list. `covarianceSelection` provides ownership and an explanation, not a second predicate or list. It is valid only with an enabled region and exactly one chart-owned numeric `__ID` value filter from that action. Reject malformed combinations in saved validation; clear marker/result together on normal mutations that invalidate them.

Encode `regionKey` from the semantic facet ID and typed category key, with explicit tokens for unfaceted/ungrouped cases. Never concatenate ambiguous display labels. Preserve missing categories and type distinctions such as number 1 versus string "1".

### 8.2 Small module seams

| Proposed module or existing file | Responsibility |
| --- | --- |
| New `ScatterPlot/pairedMoments.ts` | Stable finite-pair center/covariance helper shared with `pairedSummary.ts`; preserve its existing population contract. |
| New `ScatterPlot/covarianceRegionMath.ts` | 2×2 decomposition, status, parameterized raw boundary, stable distance solve, numerical comparison policy. No React or pixel-based membership. |
| New `ScatterPlot/covarianceRegionPlan.ts` | Source/facet/group partitioning, estimation and current row roles, exact memberships and trace data. |
| New `ScatterPlot/covarianceRegionMarks.ts` | Project a valid raw model through current axis descriptors; M1 linear, M2 nonlinear pieces. |
| New `ScatterPlot/useCovarianceRegions.ts` | Cache model/membership on analytical inputs; project separately; provide trace targets/resolution. |
| New `ScatterPlot/CovarianceRegionLayer.tsx` | Outline, center, focus targets, narrow hit strokes, optional M2 directions. |
| New `ScatterPlot/CovarianceRegionSettings.tsx` and `CovarianceRegionTraceBody.tsx` | Compact controls and explanatory existing-style trace. |
| New `providers/lib/covarianceSelection.ts` or equivalent narrowly scoped helper | Atomic ownership cleanup for setting/data transitions; do not put lifecycle side effects in rendering. |
| Existing `definition.ts`, `ScatterPlot.tsx`, `ScatterSvg.tsx`, `ScatterPlotSettingsPanel.tsx` | Types, planner/render integration, input arbitration, and settings placement. |
| Existing trace union/dispatcher files | New region trace kind and body using current owner/kind/id/revision routing. |
| Existing `saveDataUtils.ts`, `lib/dsl/settingKeys.ts`, `DataLayerProvider.tsx` | Validation, exhaustive setting paths, stable serialization, restore and transactional source-change cleanup. |
| Demo/docs files in the plan | Runnable synthetic example, coverage, documented settings, full browser journey, and image export proof. |

Keep modules focused; names are proposed, not claims that these files already exist. Do not refactor the entire large scatter renderer or demo dashboard file as a prerequisite.

### 8.3 Cache and exactness

The existing `fitInputKey` is not a region cache key: it hashes peer-eligible facet rows and includes inputs irrelevant to the selected reference. Introduce a region-specific cache using the actual data/preparation/calculation generation, X/Y field identity, source-local restrictions, full-source facet/group identities, and radius for membership. Reuse stable source column maps and set partitions where available.

Separate:

- **Moments:** depend on reference values and grouping, not radius, peers, pixels, or axis scale.
- **Membership:** depends on moments, tested source pairs, and radius, not display bounds.
- **Current counts/highlighting:** depend on current filter eligibility.
- **Projection:** depends on model, scales, dimensions, and clipping.
- **Colors/labels:** depend on display metadata and theme.

A cache signature may optimize recomputation, but an order-sensitive 32-bit hash is not proof of source equality or a safe restoration identity. Do not use the existing `hashIds` as a durable selection receipt. No derived cache update may call `updateChart` or generate a saved-state timestamp.

### 8.4 Focused source issues that must be handled

These are consequences of adding the feature, not an unrelated robustness audit:

- `ScatterPlot.selectPoint` checks the first value of a single ID filter without also requiring `values.length===1`. Add that length guard so clicking the first member of a multirow region selection selects the point instead of accidentally toggling everything off.
- `ScatterSvg` ordinary unsized clicks pass through `useBrush.onPlotClick`; a late `onClick` handler alone is insufficient. Integrate region hit arbitration before empty-plot clear.
- `planScatter` currently treats an empty `facetIds` array as unrestricted. The region planner must treat absent facet restriction and explicitly empty facet as distinct. Correct the narrow shared seam if the overlay and points otherwise disagree.
- Current plot-body gating can hide all SVG content when current facet rows are empty. The source reference must still have an outline or accessible trace route when peers leave zero current matches.
- Rectangular density branches to `DensityScatter`; hexbin/contour have separate hit meanings. M1’s enabled overlay is points/bubbles only. Existing density and contour algorithms are unchanged.
- Trace target aggregation must preserve semantic facet identity. Do not assume a header target list already exposes every paginated/hidden facet.

### 8.5 Persistence, history, and source replacement

`toSavedChart` passes ordinary scatter settings through; `saveToStructure` already serializes charts. Add known-property validation in `saveDataUtils.isChart` and the exhaustive keys in `CHART_SETTING_KEYS.scatter`. No new top-level population store or analysis format version is needed.

| Boundary | Contract |
| --- | --- |
| Full `SavedAnalysisStructure` | Contains raw data and settings. This is the authoritative portable route for reproducing the same reference and exact selected records. |
| `SavedDataStructure` on the same source/order | Preserve configuration, marker, and ID filter. Host echo must produce the same fingerprint and no rebuild loop. |
| Demo same-source history | Selection, marker, and configuration are one checkpoint. Undo/redo restores them together; tracing and responsive layout add none. |
| Source refresh with retained settings | Clear only region-owned result/marker before publication, then recompute. Preserve generic existing carry behavior. |
| Changed data and changed savedData supplied together | The current API trusts the pair. The host must supply matching data/settings; this design cannot infer identity from arbitrary props. |
| Unbound settings/Dashboard text import | Keep region configuration, strip region-owned positional selection at the import action, and give a visible explanation. Do not strip in generic same-source `restoreFromStructure`. |
| Same-source Dashboard text round-trip | Preserve the region options, origin marker, and exact ID value filter. Test empty and nonempty filters with no export omissions. |
| Image export | Preserve resting region, center, and raw/radius/reference wording; omit hit/focus/editor affordances using `data-export="omit"` as appropriate. |

`carryRowSelections` matches whole-row content under its existing refresh path, with a same-position fast path. It does not prove that unselected estimation rows stayed unchanged. Therefore preserving selected records alone would not preserve a covariance boundary.

`sourceRowIdentity` can resolve project entity references, but it is not wired into `ValueFilter.__ID`. Do not attach per-row region metadata or build a stable-key platform to make this initial overlay seem more portable.

For a relevant calculation/type-preparation change, clear the region result before a new analytical model is exposed. Use semantic inputs, not every broad `nonce` change: a label/palette edit must not clear the selection. A first implementation may conservatively invalidate on all actual calculation edits if dependency information is insufficient, provided that rule is explicit and tested.

### 8.6 Notebook and folder behavior

Respect `CrossfilterWrapper.localSelections`. In notebook mode chart selections can remain local rather than filtering sibling charts; workspace filters still operate according to that host policy. Region source membership and the local selected state remain available, but the UI must not promise dashboard-wide linkage where the provider disables it.

`filteredIds` alone is insufficient to express notebook-local selection highlighting because global Crossfilter dimensions are cleared in local-selection mode. Evaluate the chart-owned ID result for its own local state.

Folder dashboards and notebooks should persist the same chart settings through their existing owners. A folder source refresh follows the declared refresh rule; a complete saved analysis or unchanged-source reopen restores normally. No notebook parameterization, new source schema, or research-PR implementation is required.

## 9. Milestones and proof obligations

The companion plan makes these independently shippable increments concrete.

### M1 — Complete source-reference region journey

Ship points/bubbles, linear boundary drawing, group/facet comparison, exact traces and source-ID selection, stable linked-filter meaning, validation, save/restore, Dashboard text, undo, source refresh behavior, and keyboard access together.

The same milestone includes:

- `/docs/scatter` sections for covariance meaning, source reference versus linked filters, exact records, unavailable cases, saves, and refresh.
- One runnable `/examples/scatter-covariance-regions` using F7.
- Focused numerical, population, input, persistence, and export tests.
- A `covariance-regions.e2e.ts` file **and explicit Playwright project entry**.
- Real pointer and keyboard checks at **1280, 783, and 390 CSS pixels**.
- Nonlinear-axis notice with raw statistics/membership preserved; no false screen ellipse.

**Main risk:** accidentally using live/visible rows or letting selected IDs and their origin change in separate updates.

### M2 — Preserve the same meaning through nonlinear views

Add log/symlog projection of the raw curve, domain-gap splitting, bounded approximation, and optional principal spread axes/degenerate line summaries. Do not add a transformed-space estimator or new selection policy.

Extend the same example with scale views and F1/F4/F5 geometry, update `/docs/scatter`, and prove unchanged IDs through scale/zoom/export/undo/reload at the same widths.

**Main risk:** drawing across an invalid log arc, hiding the wrong population, or making a unit-dependent direction look intrinsically physical.

No additional milestone is required for frozen historical references, robust estimators, inferential regions, or pooled decomposition. Their disposition is explicit below; they are not hidden prerequisites.

### Verification standard

Tests should assert analytical meaning:

- Exact estimation/current/member ID sets and fixture values.
- Boundary inclusion, degenerate unavailability, and no inference claims.
- Region invariance under own/peer filters and view changes.
- Deliberate invalidation on source/reference changes.
- One user action → one saved state/history entry.
- Exact empty selection versus unrestricted selection.
- Resting image content and usable keyboard/touch flows.

Do not test private cache layout or SVG vertex count as a substitute for the region equation and selected IDs. Measure fitting, membership, projection, and click latency with representative row/group counts before introducing workers, indexes, approximate membership, or category truncation.

## 10. Stable recommendation register

IDs identify decisions, not implementation order. Keep them stable in Codex’s disposition record.

| ID / classification | Recommendation and one-sentence reason |
| --- | --- |
| **CR-001 · Build** | Add descriptive raw-space sample-covariance regions because they directly answer the requested center/direction/spread and record-inspection question. |
| **CR-002 · Build** | Use complete chart-local source/facet/group references because ownership keeps the defining boundary stable through linked filtering without frozen state. |
| **CR-003 · Build** | Use radius 2 with an explicit positive distance parameter because a percentage would imply a calibration the chosen method does not provide. |
| **CR-004 · Build** | Inherit grouping from categorical color and semantic facets because the current grouping conventions already preserve typed category identity. |
| **CR-005 · Build** | Separate estimation, current eligibility, source membership, selection, and drawing because visible marks are not a reliable analytical population. |
| **CR-006 · Build** | Materialize one region’s complete source-side membership in a chart-owned `__ID` filter because the existing filter engine already supports exact and empty sets. |
| **CR-007 · Build** | Add only a small side/region origin marker because atomic ownership cleanup needs provenance but no persistent per-row metadata or second ID list. |
| **CR-008 · Build** | Clear region results on semantic/reference and actual source changes because retaining selected record identities alone cannot preserve the defining covariance boundary. |
| **CR-009 · Build** | Guarantee full-analysis and same-source restoration while stripping region selections at unbound imports because positional IDs do not provide cross-source identity. |
| **CR-010 · Build** | Use anchored/scaled stable moments and a guarded 2×2 solve because raw offsets, unequal units, and near-singularity can corrupt naïve arithmetic. |
| **CR-011 · Build** | Make rank-deficient/unusable regions unclassifiable because pseudoinverse-only membership would invent unbounded strips or planes. |
| **CR-012 · Build** | Keep all memberships in raw field coordinates because axis transforms and zoom should not silently redefine the statistic. |
| **CR-013 · Build** | Use the existing SVG/trace/input conventions with explicit keyboard subjects because the region must support a complete accessible inspection and selection journey. |
| **CR-014 · Build** | Ship validation, Dashboard text, image/record export, host echo, history, and docs in M1 because a drawing alone cannot retain analytical meaning. |
| **CR-015 · Build** | Add nonlinear projection and optional principal spread axes in M2 because these extend the same analytical model into useful views without adding estimators. |
| **CR-016 · Explore** | Calibrate conditioning, boundary rounding, and projection tolerances in a local numerical prototype because the proposed constants are not yet implementation evidence. |
| **CR-017 · Defer** | Defer live-versus-held and arbitrary separate-reference modes because the selected source ownership rule already provides stable linked comparison with much less state. |
| **CR-018 · Defer** | Defer confidence, prediction, tolerance, and robust-region methods because each changes the statistical question or estimator and deserves an explicit later contract. |
| **CR-019 · Avoid** | Avoid automatic anomaly/error labels, percentage claims, silent regularization, and pixel-based membership because they would misstate what the region establishes. |
| **CR-020 · Avoid** | Avoid framework changes, new selection platforms, per-row persistent metadata, and speculative capacity machinery because the existing React/pnpm architecture and exact ID filters are sufficient. |

“Explore” for numerical thresholds means bounded implementation work within M1/M2, not an outside-demand gate. The owner’s request is sufficient authorization to design and build this capability.

## 11. Primary references

References were inspected during this run. Older foundational papers remain relevant; current product pages/source were checked rather than assumed from memory. Summaries below are intentionally narrow.

- **[S1] Friendly, Monette & Fox (2013), “Elliptical Insights: Understanding Statistical Methods through Elliptical Geometry.”** [Author paper, arXiv PDF](https://arxiv.org/pdf/1302.4881), especially §§2–3 and the distinction between data and parameter ellipses. Defines a sample-covariance distance region and geometric interpretations.
- **[S2] R statistics documentation, “Mahalanobis Distance.”** [Primary documentation](https://stat.ethz.ch/R-manual/R-devel/library/stats/html/mahalanobis.html). Defines squared distance and its center/covariance inputs.
- **[S3] R statistics documentation, “Correlation, Variance and Covariance.”** [Primary documentation](https://stat.ethz.ch/R-manual/R-devel/library/stats/html/cor.html). Establishes \(n-1\) sample covariance and missing-data distinctions.
- **[S4] SAS CORR, “Confidence and Prediction Ellipses.”** [Primary documentation](https://support.sas.com/documentation/cdl/en/procstat/67528/HTML/default/procstat_corr_details19.htm). Distinguishes mean and future-observation targets with normal-theory calibration.
- **[S5] JMP 19.2, “Ellipse,” publication January 13, 2026.** [Graph Builder documentation](https://www.jmp.com/support/help/en/19.2/jmp/ellipse.shtml). Mean, correlation, coverage, and transformed-coordinate computation controls.
- **[S6] JMP 19.2, “Density Ellipse Report,” publication January 13, 2026.** [Bivariate documentation](https://www.jmp.com/support/help/en/19.2/jmp/density-ellipse-report.shtml). Explicit bivariate-normal model and summary outputs.
- **[S7] NIST Dataplot, “Bivariate Normal Tolerance Region Plot.”** [Primary documentation](https://www.itl.nist.gov/div898/software/dataplot/refman1/auxillar/bvntolpl.htm). Separates target content and confidence. Some displayed formulas have apparent notation/transcription problems; this report uses the conceptual distinction, not those formulas as an implementation oracle.
- **[S8] ggplot2, “Compute normal data ellipses.”** [Current documentation](https://ggplot2.tidyverse.org/reference/stat_ellipse.html). Distinct `t`, `norm`, and `euclid` behaviors.
- **[S9] ggplot2 v4.0.3, `R/stat-ellipse.R`.** [Primary source](https://github.com/tidyverse/ggplot2/blob/v4.0.3/R/stat-ellipse.R). Different covariance branches and F-based radius show why a default library ellipse is not automatically this report’s oracle.
- **[S10] scikit-learn, `MinCovDet`.** [Current stable documentation](https://scikit-learn.org/stable/modules/generated/sklearn.covariance.MinCovDet.html). Robust support/correction semantics and limitations for multimodal data.
- **[S11] scikit-learn, `EllipticEnvelope`.** [Current stable documentation](https://scikit-learn.org/stable/modules/generated/sklearn.covariance.EllipticEnvelope.html). Separates robust estimation from a contamination-based outlier decision threshold.
- **[S12] NIST Engineering Statistics Handbook, “Chi-Square Distribution.”** [Primary documentation](https://www.itl.nist.gov/div898/handbook/eda/section3/eda3666.htm). Density and sum-of-squared-standard-normal definition used for the explicitly conditional \(k=2\) calculation.
- **[S13] LAPACK `DLAEV2`.** [Primary routine documentation/source](https://netlib.org/lapack/explore-html/db/d54/group__laev2_gacd10150d9e7ed9fc85ba274c3dcc9849.html). 2×2 symmetric eigendecomposition and cancellation limits.
- **[S14] D3 scale documentation and source.** [Log](https://d3js.org/d3-scale/log), [symlog](https://d3js.org/d3-scale/symlog), and [symlog implementation](https://github.com/d3/d3-scale/blob/main/src/symlog.js). Domain restrictions and transform equations used in the controlled F8 projection fixture.

Repository claims can be located under [the exact supplied commit](https://github.com/byronwall/explorEDA/tree/9d64a021e35d312887b1bc848e307f42b6c3091f) using the cited paths and symbols. The 45 packet files, rather than a claimed live checkout, are the authoritative snapshot.

## 12. Final access and execution record

### Files read

**All 45 complete packet files:**

- Repository/direction: `AGENTS.md`; `README.md`; `CODING_STANDARDS.md`; `docs/agent-guide.md`; `docs/ui-defaults.md`; `docs/research/DIRECTION.md`; `docs/intent/research-ideas-100/ideas/R004-covariance-ellipse.md`; `docs/intent/scientific-multivariate-analysis/intent-brief.md`.
- Scatter, under `packages/explorEDA/src/components/charts/ScatterPlot/`: `definition.ts`; `pairedSummary.ts`; `fitPlan.ts`; `scatterPlan.ts`; `useScatterData.ts`; `useScatterFits.ts`; `ScatterPlot.tsx`; `ScatterSvg.tsx`; `ScatterPlotSettingsPanel.tsx`; `PairedSummaryBody.tsx`; `FitTraceBody.tsx`; `summaryMarginals.test.ts`; `scatterPlan.test.ts`; `ScatterSvg.test.tsx`.
- Filtering/identity, under `packages/explorEDA/src/`: `hooks/CrossfilterWrapper.ts`; `types/FilterTypes.ts`; `types/ChartTypes.ts`; `providers/lib/carryRowSelections.ts`; `components/project/sourceRowIdentity.ts`; `lib/rowIdFilters.ts`.
- Trace, under `packages/explorEDA/src/components/charts/trace/`: `ChartTraceScope.tsx`; `traceTypes.ts`; `TraceBodies.tsx`.
- Persistence/DSL, under `packages/explorEDA/src/`: `types/SavedDataStructure.ts`; `utils/saveDataUtils.ts`; `lib/dsl/settingKeys.ts`; `lib/dsl/export.ts`; `lib/valueParsing.ts`; `providers/DataLayerProvider.tsx`; `test/providers/savedSelectionRestore.test.tsx`.
- Demo: `apps/demo/src/docs/pages/scatter.mdx`; `apps/demo/src/docs/live/examples.ts`; `apps/demo/src/demos/dashboardSettings.ts`; `apps/demo/src/demos/coverage.ts`; `apps/demo/playwright.config.ts`.
- Package definitions: `packages/explorEDA/package.json`; `apps/demo/package.json`.

**Nine supplementary complete reads at the exact same commit**, under `packages/explorEDA/src/`:

`hooks/applyFilter.ts`; `lib/categories.ts`; `lib/chartPopulation.ts`; `providers/lib/dataLayerState.ts`; `components/charts/useGetLiveData.tsx`; `components/charts/FacetRelated/FacetContainer.tsx`; `components/charts/FacetRelated/FacetGridLayout.tsx`; `components/charts/FacetRelated/FacetWrapLayout.tsx`; `components/charts/ChartRenderer.tsx`.

**Partial supplementary inspections:** `apps/demo/src/savedViewsHistory.ts` and `apps/demo/src/SavedViewsWorkspace.tsx`, limited to session source binding, capture, text import, checkpoint classification, and history restore sections.

The worker still needs ordinary local inspection of imported helpers and consumers not supplied here, including exact trace-body dispatch, brush arbitration, docs setting descriptions, import actions, image-export harness, and folder/notebook consumer wiring. Those are identified integration tasks, not missing decisive input.

### Checked versus proposed

- **Checked:** complete source access; stated baseline; existing populations/filter representation; full-source facet path; exact empty ID behavior; source-identity limitations; primary external distinctions; independent fixture moments, distances, memberships, affine identities, and boundary parameterizations.
- **Proposed:** all application modules and settings; numerical production tolerances; rendering and hit-testing; save/import cleanup; docs/example changes; browser, export, host-echo, history, and folder/notebook acceptance.
- **Not performed:** application implementation, repository edits, commits, pushes, merges, provisioning, application tests, live browser verification, or a usability study.

### Downloads and remaining decisions

- [report.md](report.md)
- [implementation-plan.md](implementation-plan.md)
- [covariance-region-design.zip](covariance-region-design.zip) — the two Markdown deliverables only.

The core product decision is settled. Remaining worker decisions are bounded: calibrate the numerical tolerances against the independent fixtures; choose the smallest existing import hook for unbound-selection stripping; confirm facet/header keyboard access; and select a projection approximation budget from actual geometry/export checks. None requires outside demand, a framework change, or completion of the neighboring proposal PRs.


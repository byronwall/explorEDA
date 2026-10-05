# Generate and repair Outline

Target `eda 3 flat`. Keep this review checker and its native-contract ref pinned. It emits partial settings, not a full runnable saved workspace. A catalog describes host source fields; do not invent their names or types.

## Canonical example

```text
eda 3 flat
source orders=salesRows
revenue:num=Revenue
cost:num=Cost
channel:cat=Channel

calc profit=revenue-cost
calc rate=revenue==0 ? null : profit/revenue
+ format=percent precision=1

scatter @p x=revenue y=profit where.profit=0..
row @c channel where.channel=Web,Store
metric @total sum=profit
table @rows revenue,profit,rate,channel
```

## Generation contract

Use aliases consistently in shorthand. Source mappings and exact native configuration never imply joins or remote access. `:num` checks an expected type; only `coerce=num` requests conversion. Calculated fields are row-wise. `sum(revenue)` inside a calc is not a total over records; use `metric sum=revenue` for that task.

Use explicit IDs on agent-maintained charts. Preserve an existing ID on edits, reorderings, and title changes. X/Y are named roles; do not switch to positional scatter syntax. Settings and `where` filters are normal pairs that may be reordered. The formatter's 50-character target is soft, not a parser constraint. A calculation body stays one physical line; metadata goes on `+` lines.

Resolve calculation dependencies structurally. Double-quoted formula text is a literal; `["Raw field"]` is an exact native field reference. Never substitute aliases inside literal strings. Do not invent functions. Unknown references, cycles, and result/source-name collisions are errors.

`where.FIELD=MIN..MAX` is inclusive. Lists are OR within one field; different fields are AND. Chart-owned filters also participate in linked filtering. Do not interpret each chart as a private comparison cohort. The checker enforces the inspected owner's filter capabilities and can reject an ignored or misleading filter even when its native object shape is legal.

Use either shorthand filters or an exact native filters array per chart, including overlays. Do not mix representations. Within a declaration, conflicting assignments fail. `edit ID where.FIELD=VALUE` replaces one field's filter, `edit ID where.FIELD=*` removes that field's filter, and `edit ID where=none` clears only that chart's filters. Empty arrays select no rows; null selects missing values; neither means remove.

## Feedback loop

1. Read or obtain the host field catalog. Generate a complete small document with stable chart IDs.
2. Run `check --catalog ... --json`; retain `documentSHA256` with the source snapshot.
3. Repair only the relevant source spans. A suggested spelling is not permission to change analytical intent. Use `expectedText` plus the document digest; reject stale or overlapping edits.
4. Recheck the entire document. Inspect emitted calculations and filter owners, not only the error count.
5. Format after semantic repair, then recheck. Formatting changes the source digest.
6. Require full native compilation, native settings validation, data-aware formula checks, and a render check before making a production-ready claim.

The pure check API does not compute the document digest. The CLI adds it. The pure applyEdits API verifies text/ranges; the CLI also checks the SHA-256 precondition. `ok:true` is not `productionReady:true`. Deferred binding checks and other unresolved warnings must not be relabeled as passes.

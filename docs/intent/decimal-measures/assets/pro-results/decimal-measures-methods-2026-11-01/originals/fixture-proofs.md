# Exact decimal fixture proofs and verification

These are mathematical expectations for the proposed explorEDA capability at baseline `d3920a285f3755a8324998775deb131747e959f5`. They do not describe an implemented decimal feature. The source packet is the repository evidence; the calculations below are independent numerical derivations.

## What is supplied and what was checked

- `decimal-fixtures.json` contains **215 primitive, aggregate, and wire-validation cases**, plus coherent ledger, selected-population, entity-grain, regrouping, projection, and source-reader-loss cases.
- `verify-fixtures.py` is an original inspection companion using Python's standard-library `fractions.Fraction`, arbitrary-size integers, and `divmod`. It imports no decimal package and uses no network access.
- The research author executed this companion against the supplied JSON. All 215 primitive/aggregate/wire cases and its ledger, population, entity, projection, source-loss, and regrouping checks passed.
- Binary floating point is used only for the explicitly approximate coordinate-collision and lost-source-digit demonstrations. It is never used to derive an exact amount, rounding decision, filter membership, or reconciliation difference.
- No explorEDA test suite, browser interaction, worker round-trip, library bundle, or product persistence flow was executed. Those tests are proposed in the implementation plan. Local integration agents are not expected to execute downloaded programs.

The compact `repeatSum` case means a million copies of its one exact source string. It avoids embedding a million redundant rows. The population and entity cases provide explicit source memberships and counts.

## Fixture index

| IDs | Purpose |
| --- | --- |
| D-P001–D-P052 | Source grammar, preserved scale, leading zeros, exponent expansion, blanks, invalid text, Number refusal, and explicit bounds |
| D-I001–D-I008 | Explicit adoption of current safe integer Numbers, with different provenance from original decimal text |
| D-A001–D-A021 | Exact addition, subtraction, multiplication, percent scaling, bounds, mixed operand refusal, missing and invalid propagation |
| D-R001–D-R046 | All six rounding policies, both signs, zero, unnecessary rounding, required policies, and double rounding |
| D-D001–D-D028 | Terminating exact division, non-terminating rejection, correctly rounded division, and division errors |
| D-C001–D-C010 | Numeric equality, representation equality, canonical keys, exact ordering, and stable sort ties |
| D-G001–D-G025 | Counts, memberships, exclusions, empty populations, exact sum/mean/min/max, widened sums, and repeated tenths |
| D-L001–D-L007 | Invoice line versus total rounding, signed refunds, discount and tax ordering, selected-population reconciliation |
| D-E001 | Numerically agreeing duplicates, conflicts, missing measures/IDs, inconsistent availability, and typed entity identity |
| D-GR001–D-GR003 | Correct sum/count regrouping and incorrect averages of group averages |
| D-W001–D-W025 | Strict JSON/wire shape, canonical coefficient, bounded scale, and refusal of malformed typed objects |
| D-X001 | Approximate chart coordinates collide while exact membership remains distinct |
| D-X002–D-X003 | Original source digits have already been lost; exact interpretation must refuse to invent them |

Some ledger IDs name a section rather than an entry in the primitive `cases` array. D-L002 has sale/refund scenarios. D-L005 has full, group A, group A with explicit valid-only filtering, and exact-threshold views. The JSON records these names and memberships explicitly.

## 1. The arithmetic model

A decimal value is a signed integer coefficient `c` and a nonnegative scale `s`:

\[
 x = c / 10^s.
\]

The public scalar is plain JSON:

```json
{"kind":"decimal","coefficient":"12300","scale":4}
```

This represents `1.2300`. Its numeric value equals `1.23`, but its retained scale is four. The coefficient string is canonical; the original raw lexeme remains separate evidence. Leading plus signs, leading zeros, whitespace, and signed-zero spellings need not be reconstructed from this scalar because the original source record is preserved.

The fixtures use 128 coefficient digits, scale 0–38, at most 256 raw input characters, and absolute exponent at most 128. Arithmetic does not silently trim meaningful output scale to fit a bound. These limits are product policies, not properties of all decimal arithmetic systems.

An empty or invalid analytical population has no amount. A valid population containing only zeros has a real zero amount. That distinction is visible in D-G003–D-G007.

## 2. Why tenths, large integers, and cancellation are exact

For D-A001:

\[
 0.1 + 0.2 = 1/10 + 2/10 = 3/10 = 0.3.
\]

For D-G001 and D-G024:

\[
 10(1/10)=1.0,\qquad 1{,}000{,}000(1/10)=100000.0.
\]

The final zero is retained because the contributing values have scale one. It is an arithmetic representation choice, not display formatting.

For D-A007:

\[
 9007199254740993 + 0.01
 = (900719925474099300+1)/100
 = 9007199254740993.01.
\]

For D-G002, align the three values at scale two. The opposite large coefficients cancel exactly, leaving coefficient one, hence `0.01`. No finite-precision significant-digit context is applied to an intermediate prefix.

D-G016–D-G021 go further. Let `M` be the 128-digit all-nines integer. Every permutation of `[M, 1, -M]` sums to `1`. An exact grouped reducer must hold widened internal state; otherwise an early `M + 1` would fail before its later cancellation. A binary row operation that explicitly materializes `M + 1` still fails the public 128-digit result bound. Those are different operation boundaries, not inconsistent arithmetic.

The 256-digit internal sum budget is comfortably above the required alignment and count headroom for a realizable JavaScript array under these input bounds. For `N` values, each with at most `P` coefficient digits and scale at most `S`, an aligned total needs no more than `P + S + ceil(log10(max(1,N)))` digits. This is a bound on magnitude, not a claim of measured execution speed.

A deliberately strict edge appears in D-A014 and D-G023: adding scale-one zero to a 128-digit scale-zero integer retains scale one and therefore requires a 129-digit coefficient. Without an output policy the operation returns a limit diagnostic; it must not silently drop the requested scale.

D-G025 applies an explicit aggregate output policy to the same inputs: target scale zero with `unnecessary`. This **single aggregate operation** quantizes its widened state before checking the public output bound. The scale-one coefficient ends in zero, so quantization removes that zero without changing the value, producing the allowed 128-digit integer. Its `inexact` flag is false. This does not make a separate `round(sum(...), 0, unnecessary)` expression equivalent: that expression first materializes the bounded public sum, which fails in D-G023.

## 3. Correct rounding uses an integer remainder

For a rational value `n/d`, positive denominator `d`, and target scale `s`, compute:

\[
 N=|n|10^s,\qquad q=\lfloor N/d\rfloor,\qquad r=N-qd.
\]

Then apply a declared policy to the magnitude and restore the original sign:

- **halfEven:** increment if `2r > d`, or if `2r = d` and `q` is odd.
- **halfAwayFromZero:** increment if `2r >= d`.
- **towardZero:** never increment.
- **floor:** increment magnitude for a negative input with a nonzero remainder.
- **ceiling:** increment magnitude for a positive input with a nonzero remainder.
- **unnecessary:** reject when `r` is nonzero.

The output coefficient is that signed integer, and the output scale is exactly `s`. Zero has no negative sign in the public scalar. The `inexact` flag reports whether the rational value changed. Removing zero digits may change scale while leaving `inexact: false`.

### Two familiar difficult-looking values

`1.005 = 201/200`. At scale two, `20100 / 200` has quotient 100 and remainder 100. This is an exact halfway case. Half-even leaves even coefficient 100, giving `1.00`; half-away gives `1.01`. Negating the input gives `-1.00` and `-1.01` respectively.

`2.675 = 107/40`. At scale two, `10700 / 40` has quotient 267 and remainder 20. The halfway quotient is odd, so half-even increments to coefficient 268, giving `2.68`. The negative case becomes `-2.68`.

The result is established by integer division. It does not depend on how a binary `Number` spells or formats these inputs.

### Double rounding is a different calculation

D-R044–D-R046 preserve a useful counterexample:

- Direct half-even rounding of `1.2451` to two places gives **1.25**.
- Rounding first to three places gives **1.245**.
- Rounding that intermediate result to two places gives **1.24**.

The first operation discarded evidence that the original value lay above the cents midpoint. A renderer must not perform an unrecorded intermediate arithmetic rounding step. Explicit staged rounding is allowed, but its saved recipe must show both decisions.

## 4. Exact versus correctly rounded division

After reducing a rational fraction, its decimal expansion terminates exactly if its denominator contains only powers of two and five. This follows because a finite decimal denominator divides a power of ten, and `10 = 2 × 5`.

- `1/8 = 1/2³ = 125/1000`, so exact division returns `0.125` at minimal scale three.
- `1/3` is non-terminating and the exact `/` operation returns `DECIMAL_NON_TERMINATING`.
- Explicitly dividing `1/3` to six places with half-even returns `0.333333` with `inexact: true`.
- Dividing `1/8` to two places is a tie: half-even returns `0.12`; half-away returns `0.13`. The negative counterparts are `-0.12` and `-0.13`.
- `unnecessary` rejects `1/8` at scale two but accepts it at scale three.
- Zero divisors always produce a diagnostic; neither `NaN` nor infinity enters the exact scalar domain.

A stored decimal can exactly represent the **rounded result** while being an inexact representation of the original quotient. The fixtures preserve that distinction.

## 5. Rounding individual lines changes the ledger total

D-L001 has three line bases of `0.05`, each with rate `0.10`:

\[
 (5/100)(10/100)=1/200=0.0050.
\]

Each tax is halfway between zero and one cent. Half-even line rounding produces `0.00` for each line, total tax `0.00`, and invoice total `0.15`.

The exact combined tax is:

\[
 3/200=0.0150.
\]

At cents this is halfway between one and two cents; two is even. Rounding at the total therefore gives tax `0.02` and invoice total `0.17`.

Both results follow their declared rules. The fixture does not allocate the total's two cents back to individual lines. Allocation is a separate later capability with additional identity and tie rules.

## 6. Discounts, tax bases, and refunds

D-L002 uses price `19.99`, quantity `3`, discount rate `0.10`, and tax rate `0.07`. The declared steps are:

1. Exact gross: `19.99 × 3 = 59.97`.
2. Exact discount: `59.97 × 0.10 = 5.9970`; round the discount to `6.00`.
3. Taxable amount: `59.97 - 6.00 = 53.97`.
4. Exact tax: `53.97 × 0.07 = 3.7779`; round tax to `3.78`.
5. Total: `53.97 + 3.78 = 57.75`.

With quantity `-3`, the same sign-symmetric half-even policy gives `-57.75`. The discount also reverses sign, so subtracting it produces `-59.97 - (-6.00) = -53.97`. This is a mathematical reversal example, not a rule for every real refund policy.

D-L003 and D-L006 compare distinct declared tax bases. With gross `100.00`, fixed discount `10.00`, and rate `0.10`, tax on the discounted base gives `99.00`; tax on the original base followed by subtracting the fixed discount gives `100.00`. Without intermediate rounding, multiplying two percentage factors commutes. The ordering examples do not claim otherwise.

D-L004 separates rounding the discount from rounding the discounted net: a `0.05` amount with a `0.10` discount gives `0.05` if the `0.005` discount first rounds to zero, but `0.04` if the exact discounted amount `0.045` is rounded instead. Both steps must be explicit in a recipe.

## 7. Groups, filters, exclusions, and subtotals

D-L005 has eight original occurrences. Six have valid exact values, one is blank, and one is invalid. The valid values in thousandths are:

\[
 10005+20005-5005+0+1005+2675=28685.
\]

Thus the exact valid subtotal is `28.685`. Its half-even total rounding is `28.68`, which happens also to equal the sum of the rounded lines. That coincidence does not prove source completeness: the blank and invalid records remain unresolved, so the full-population reconciliation cannot pass.

The group subtotals are:

| Group | Exact subtotal | Rounded subtotal |
| --- | ---: | ---: |
| A | 30.010 | 30.01 |
| B | -4.000 | -4.00 |
| C | 2.675 | 2.68 |

The rounded group subtotals sum to `28.69`, a cent above the rounded grand total. A subtotal is a separate rounding scope. A pivot must either recompute the grand total over the original contributing population or explicitly label a sum of posted subtotals; it cannot silently interchange those calculations.

Filtering to group A leaves four matched occurrences: two valid, one missing, and one invalid. Its valid subtotal is `30.010`; total rounding gives `30.01`, while summing rounded lines gives `30.00`. The exact zero total difference from a `30.01` reference still does not pass until the exclusions are explicitly resolved or an upstream filter declares the smaller valid-only population.

The exact predicate `amount >= 1.005` selects only `L01`, `L02`, `L05`, and `L08`. Their exact subtotal is `33.690`; total rounding gives `33.69`; line rounding totals `33.68`. This is reconciliation of that saved selected population, not a claim about the entire source ledger.

The grand average uses six valid values, not eight source records:

\[
 28.685/6=5737/1200,
\]

which gives `4.780833` at scale six under half-even.

## 8. Entity grain is about identity and agreement

D-E001 provides 12 occurrences and eight nonmissing typed entity IDs. Numeric ID `1` and string ID `"1"` remain distinct.

- `I1` has values `1.0` and `1.00`. They agree numerically, so it contributes once at the maximum observed scale, `1.00`. Representative `e01` is the lexical-minimum stable occurrence ID, and both original occurrences remain in lineage.
- `I2` has `2.00` and `2.01`. It is a conflict; neither first-row selection nor display rounding may resolve it.
- One entity has only a missing measure, one has an invalid measure, and one has a valid/missing availability disagreement. None may quietly contribute a selected valid occurrence.
- A row with no entity ID is separately visible as excluded identity evidence.

The four eligible entity values would total `1 + 0 + 2 + 3 = 6.00`, with average `1.50`. Because a conflict remains in the selected population, the authoritative grouped result is **unavailable, value null**. The JSON calls these eligible-only values `diagnosticPartialSum` and `diagnosticPartialAverage`; they cannot feed a passed reconciliation or masquerade as a complete amount.

## 9. Regroup sums and counts, not displayed averages

D-GR003 partitions `[1,3,9]` into `[1,3]` and `[9]`.

- Sufficient states are `(sum=4, count=2)` and `(sum=9, count=1)`.
- Merging them gives `(13,3)`, hence `4.33` at scale two.
- Averaging the group averages `(2 + 9)/2` gives `5.50`, because it assigns equal weight to groups of unequal size.

D-GR002 shows why weighting already-rounded group averages is also wrong. `[0.00,0.01]` has exact mean `0.005`, which rounds to `0.00` at cents; `[0.01]` has mean `0.01`. Weighting those rounded means gives `0.003333` at scale six, while the actual pooled mean `0.02/3` gives `0.006667`. Preserve exact sum/count state until the final requested rounding.

## 10. A total match does not establish a line match

D-L007 compares two complete columns over source occurrences `c1` and `c2`:

| Occurrence | Computed / posted | Exact residual |
| --- | --- | ---: |
| c1 | 1.01 / 1.00 | 0.01 |
| c2 | 1.99 / 2.00 | -0.01 |

Each column totals `3.00`, and the exact total delta is `0.00`. The declared **total check** may report **Totals match**, because both sides are complete and use the same population. The **line check** reports **Lines differ**, because two row residuals are nonzero. The cancellation does not prove that each posted line is correct. These are separate result scopes; neither result implies allocation of the residuals.

The full valid-only view in D-L005 likewise distinguishes source coverage from the active population. A saved status filter yields six active valid rows, exact subtotal `28.685`, and rounded total `28.68`. It retains `L06` (missing) and `L07` (invalid) as upstream excluded evidence; it does not relabel the original eight-row population complete.

## 11. Wire validation does not reinterpret data

D-W001–D-W025 require exactly the object keys `kind`, `coefficient`, and `scale`, with the stated canonical coefficient and integer scale. Source parsing may accept leading zeros or negative-zero spelling; wire validation does not. A saved scalar with coefficient `"01"`, `"-0"`, `"1.0"`, `"1e3"`, or `"1\n"` is malformed. Numeric coefficients, fractional/string/Boolean scales, extra keys, absent keys, overbound values, arrays, and unrelated objects are also rejected.

These boundary cases return `DECIMAL_INVALID_WIRE` rather than silently repairing a file. A product validator can attach a more detailed cause, but it must reject before state mutation. The inspection verifier confirms the shape rules; it does not exercise an actual explorEDA restore callback or project reader.

## 12. Projection and lost source digits

D-X001 uses `9007199254740992.00` and `9007199254740993.00`. Their binary64 plot coordinates coincide. Their exact coefficients differ by 100 at scale two, so an exact lower bound of `9007199254740993.00` selects only the second occurrence. Approximate coordinates can position a mark; they cannot define exact source membership or replace exact trace values.

D-X002 starts with source text `9007199254740993` that a numeric reader has already converted to Number `9007199254740992`. D-X003 similarly loses digits from `0.100000000000000005` into Number `0.1`. The exact parser returns `DECIMAL_TEXT_REQUIRED` in both cases. The response is to reload preserved source text through the correct reader path. Neither shortest decimal spelling nor a decimal constructor can recreate unknown source digits.

## Integration status

The fixture file, independent oracle, and mathematical expectations were produced and checked in this research run. The proposed product implementation, source-reader option, row diagnostics, grouped reducer, notebook bindings, persistence codecs, and chart adapters remain implementation work. Their acceptance tests must verify these same values **and** complete populations, lineage, saved policies, reload behavior, and explicit refusals at unsupported boundaries.

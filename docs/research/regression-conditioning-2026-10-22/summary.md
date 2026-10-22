# R001: preserve the predictor and its equation basis

Retain polynomial Householder QR. Investigate centered linear prediction and a stable equation in the existing trace.
Do not hide a valid curve because its expanded equation fails.
No application repair ships in this research PR.

R001 was the highest unfinished catalogue idea, priority4.
R026, R043, and R077 already have completed research. Their repairs remain proposals.
The source baseline is `63dfa75851ef57bb3782e6d7c1ef104784cd4064`.
Refreshed main still matches that source after collection.

## What changed our understanding

Three locally written probes ran against real source functions. They pass.
The [proof record](evidence/local-proof.test.ts) retains the assertions and ordinary controls.
It is research evidence, not an installed package test.

| Case                                                           | Local result                                                                                 | Meaning                                                                                |
| -------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Exactly representable timestamps near 2^30 seconds             | Returned residual SE0; direct residual SE0.02357638V. Held-point prediction error0.0235335V. | Centered sums do not protect expanded linear evaluation.                               |
| Same linear slope evaluated around its known center            | Maximum error below3e-16V over the stated probes.                                            | A small evaluation change deserves review. Production metrics remain unmodified.       |
| Noisy quadratic translated by 10^9mm                           | Prediction error below5e-16V; expanded Horner error7.096299V.                                | Keep the accurate predictor; preserve its basis for reuse.                             |
| Actual formatted quadratic text                                | Reconstruction error about3.30e13V.                                                          | More coefficient digits or an approximation mark alone cannot fix this representation. |
| Ordinary, unit-converted, repeated-X and sample-limit controls | Expected outcomes retained.                                                                  | Avoid blanket offset, spread, or coefficient-size rejection rules.                     |

These are demanding synthetic cases. They do not establish customer failure frequency or instrument accuracy.
The synthetic 1mV tolerance is a declared task assumption, not a product default.
Local probes use independent known polynomial identities, not a replay of downloaded scripts.
Their binary64 reference arithmetic differs slightly from Pro's exact rational oracle at roundoff scale.

Pro reports a 26-case matrix, including NIST Pontius and independent exact arithmetic.
All22 available stable-basis candidates passed its finite probes. Those counts remain attributed to Pro.
We verified embedded hashes and source copies. We did not rerun the downloaded harness or all26 cases.
See [evidence and limits](evidence.md), [decisions](decisions.md), and [original reports](https://chatgpt.com/c/6ada0976-a8d4-83ea-9df8-c953d9d9b1c3).

## Proposed review work

1. Repair linear prediction and residual measures together. Preserve slope, correlation, unavailable cases, and constant-Y conventions.
2. Keep the existing polynomial basis with origin, scale, coefficient order, and units for numerical reuse.
3. Keep plot labels compact. Use a sound representation when the expanded expression is unsuitable.

Use the existing trace first. The checked entry files do not directly re-export the regression fit types.
This lowers the case for a new public API, but is not a complete transitive API audit.
No precision slider, new regressor, warning threshold, or solver replacement is earned.

Each later visible milestone must include `/docs/scatter` and a focused runnable example.
Preserve `scatter-regression` and its grouped-versus-pooled lesson.
A proposed `scatter-regression-units` companion can use the five-row noisy quadratic and a known held query.
The query at localX0.5mm has intended response1.36049225V.
Do not publish post-repair trace instructions before that trace exists and passes its checks.

## Review boundary

All required originals and independent standalone companions are collected and verified.
No material follow-up was needed;0/2 sent.
Full package and repository validation results are in the [run record](run.md).
Browser, clipboard, exports, history/restore, full filtering/refitting, cross-engine and continuous-domain proof remain unrun.
No product screenshot or changeset applies to this research-only change.

R051 is next, followed by R086 and R031. Reuse existing filter-ownership findings before another survey.

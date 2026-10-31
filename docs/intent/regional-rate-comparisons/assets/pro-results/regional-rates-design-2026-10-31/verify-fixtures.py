#!/usr/bin/env python3
"""Independent, dependency-free arithmetic and membership oracle for the proposal.

This is a design fixture checker, not explorEDA implementation code. It evaluates
normalized input records and compares its result with manually authored expected
values. It intentionally does not load or call any repository module.
"""
from __future__ import annotations

from fractions import Fraction
from pathlib import Path
from datetime import datetime, timezone
import json
import math
import sys

MAX_SAFE_INTEGER = 2**53 - 1


def typed_key(value):
    if isinstance(value, bool):
        return ("boolean", value)
    if isinstance(value, (int, float)):
        if not math.isfinite(value):
            raise ValueError(f"Nonfinite region key: {value!r}")
        return ("number", value)
    if isinstance(value, str):
        return ("string", value)
    raise ValueError(f"Unsupported region key: {value!r}")


def number(value):
    # Fixture inputs are normalized values. Production parsing must use valueParsing.
    if value is None:
        return None, "missing"
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        return None, "invalid"
    if not math.isfinite(value):
        return None, "invalid"
    result = Fraction(str(value))
    if result < 0:
        return None, "negative"
    return result, None


def exact(value):
    if value is None:
        return None
    return str(value)


def scalar(value):
    if value is None:
        return None
    if value.denominator == 1:
        return value.numerator
    return float(value)


def refs(source, rows):
    return [{"sourceId": source, "rowId": row["id"]} for row in rows]


def distinct_refs(groups, field):
    seen = set()
    result = []
    for group in groups:
        for ref in group[field]:
            key = (ref["sourceId"], ref["rowId"])
            if key in seen:
                continue
            seen.add(key)
            result.append(ref)
    return result


def same_region(row, region):
    try:
        return typed_key(row.get("region")) == typed_key(region)
    except ValueError:
        return False


def instant(value):
    # The oracle accepts normalized UTC instants only. It uses no repository
    # parser and makes no claim about all production raw-data parsing forms.
    if not isinstance(value, str) or not value.endswith("Z"):
        return None
    try:
        parsed = datetime.fromisoformat(value[:-1] + "+00:00")
    except ValueError:
        return None
    return parsed.astimezone(timezone.utc)


def window_membership(row, scope, kind):
    if kind == "prepared":
        return "inside" if row.get("period") == scope["period"] else "outside"
    occurred = instant(row.get("at"))
    if occurred is None:
        return "unknown"
    start, end = instant(scope["period"]["start"]), instant(scope["period"]["end"])
    if start is None or end is None or end <= start:
        raise ValueError("Fixture definition has an invalid requested interval")
    return "inside" if start <= occurred < end else "outside"


def evaluate_group(data, region, unknown_attribution=False):
    scope = data["scope"]
    kind = data["kind"]
    if kind == "prepared":
        numerator_source = denominator_source = "prepared"
        numerator_rows = denominator_rows = data["rows"]
    elif kind == "repeated":
        numerator_source = denominator_source = "events"
        numerator_rows = denominator_rows = data["events"]
    else:
        numerator_source, denominator_source = "events", "exposure"
        numerator_rows, denominator_rows = data["events"], data["exposure"]

    availability = data.get("availability", {})
    numerator_loaded = availability.get(numerator_source, "loaded") == "loaded"
    denominator_loaded = availability.get(denominator_source, "loaded") == "loaded"
    coverage_item = next(
        (c for c in data["coverage"] if same_region(c, region)), None
    )
    declared_coverage = coverage_item["status"] if coverage_item else "unknown"
    coverage = declared_coverage if numerator_loaded else "unavailable"
    coverage_evidence = [coverage_item["id"]] if coverage_item else []
    reasons = []
    notices = []
    if unknown_attribution:
        reasons.append("unknown-attribution")

    if not numerator_loaded:
        reasons.append("numerator-source-unavailable")
    elif coverage != "complete":
        reasons.append(f"collection-{coverage}")
    if not denominator_loaded:
        reasons.append("denominator-source-unavailable")

    candidates = [r for r in numerator_rows if same_region(r, region)] if numerator_loaded else []
    scoped = []
    scope_excluded = []
    numerator_rejected = []
    for row in candidates:
        membership = window_membership(row, scope, kind)
        if membership == "unknown":
            reasons.append("invalid-event-time")
            numerator_rejected.append(row)
            continue
        if membership == "outside":
            scope_excluded.append(row)
            continue
        if row["boundaryVersion"] != scope["boundaryVersion"]:
            reasons.append("numerator-boundary-mismatch")
            scope_excluded.append(row)
            continue
        if row["populationId"] != scope["populationId"]:
            reasons.append("numerator-population-mismatch")
            scope_excluded.append(row)
            continue
        scoped.append(row)

    numerator_filter = data.get("numeratorFilter", {})
    selected = []
    filter_excluded = []
    for row in scoped:
        if all(row.get(k) == v for k, v in numerator_filter.items()):
            selected.append(row)
        else:
            filter_excluded.append(row)

    valid_num_rows = []
    observed = Fraction(0) if numerator_loaded else None
    if kind == "prepared" and numerator_loaded and len(selected) != 1:
        reasons.append("missing-numerator" if not selected else "duplicate-prepared-grain")
    for row in selected:
        value, issue = number(row["numerator"] if kind == "prepared" else 1)
        if issue:
            reasons.append(f"{issue}-numerator")
            numerator_rejected.append(row)
            continue
        if value.denominator != 1:
            reasons.append("numerator-noninteger")
            numerator_rejected.append(row)
            continue
        if value > MAX_SAFE_INTEGER:
            reasons.append("numerator-unsafe-integer")
            numerator_rejected.append(row)
            continue
        valid_num_rows.append(row)
        observed += value

    num_blockers = {
        "numerator-source-unavailable", "collection-unknown", "collection-partial",
        "collection-unobserved", "numerator-boundary-mismatch",
        "numerator-population-mismatch", "missing-numerator", "invalid-numerator",
        "negative-numerator", "duplicate-prepared-grain",
        "numerator-noninteger", "numerator-unsafe-integer",
        "unknown-attribution", "invalid-event-time",
    }
    numerator = None if any(r in num_blockers for r in reasons) else observed

    denominator_candidates = [r for r in denominator_rows if same_region(r, region)] if denominator_loaded else []
    denominator_matches = []
    denominator_scope_excluded = []
    mismatch_reasons = []
    for row in denominator_candidates:
        mismatches = []
        for field, label in (("period", "period"), ("boundaryVersion", "boundary"), ("populationId", "population"), ("unit", "unit")):
            if row[field] != scope[field]:
                mismatches.append(f"denominator-{label}-mismatch")
        if mismatches:
            mismatch_reasons.extend(mismatches)
            denominator_scope_excluded.append(row)
        else:
            denominator_matches.append(row)

    denominator = None
    denominator_contributors = []
    denominator_represented = []
    denominator_units = []
    if denominator_loaded:
        if not denominator_matches:
            reasons.extend(mismatch_reasons or ["missing-denominator"])
        elif kind == "repeated" and data.get("denominatorPolicy", "unique") != "extract-repeated-identical":
            reasons.append("repeated-exposure-needs-extraction")
        else:
            parsed = [(row, *number(row["denominator"])) for row in denominator_matches]
            bad = [(row, issue) for row, _, issue in parsed if issue]
            if bad:
                reasons.extend(f"{issue}-denominator" for _, issue in bad)
            else:
                values = {v for _, v, _ in parsed}
                if len(values) > 1:
                    reasons.append("conflicting-denominator")
                elif len(parsed) > 1 and data.get("denominatorPolicy", "unique") not in ("collapse-identical", "extract-repeated-identical"):
                    reasons.append("duplicate-denominator")
                else:
                    representative = min((row for row, _, _ in parsed), key=lambda r: r["id"])
                    denominator = parsed[0][1]
                    denominator_contributors = [representative]
                    denominator_represented = sorted((row for row, _, _ in parsed), key=lambda r: r["id"])
                    denominator_units = [{"region": region, "value": scalar(denominator), "representative": refs(denominator_source, [representative])[0], "representedRows": refs(denominator_source, denominator_represented)}]
                    if len(parsed) > 1:
                        notices.append("collapsed-identical-denominator")
                    if denominator == 0:
                        reasons.append("zero-denominator")

    if data.get("measureKind") == "proportion" and numerator is not None and denominator is not None and numerator > denominator:
        reasons.append("proportion-exceeds-denominator")
    # A prepared proportion declaration asserts subset membership; event IDs alone
    # cannot establish it. This checker does not implement participant deduplication.
    if data.get("measureKind") == "proportion" and not data.get("subsetDeclared", False):
        reasons.append("subset-unverified")

    reasons = sorted(set(reasons))
    rate = None
    if not reasons and numerator is not None and denominator is not None and denominator > 0:
        rate = numerator * Fraction(str(data["scale"])) / denominator

    return {
        "region": region,
        "observedNumerator": scalar(observed),
        "numerator": scalar(numerator),
        "denominator": scalar(denominator),
        "rateExact": exact(rate),
        "status": "available" if rate is not None else "unavailable",
        "coverage": coverage,
        "coverageEvidence": coverage_evidence,
        "reasons": reasons,
        "notices": notices,
        "numeratorCandidates": refs(numerator_source, candidates),
        "numeratorContributors": refs(numerator_source, valid_num_rows),
        "numeratorFilterExcluded": refs(numerator_source, filter_excluded),
        "numeratorScopeExcluded": refs(numerator_source, scope_excluded),
        "numeratorRejectedRows": refs(numerator_source, numerator_rejected),
        "denominatorCandidates": refs(denominator_source, denominator_candidates),
        "denominatorScopeExcluded": refs(denominator_source, denominator_scope_excluded),
        "denominatorContributors": refs(denominator_source, denominator_contributors),
        "denominatorRepresentedRows": refs(denominator_source, denominator_represented),
        "denominatorContributionUnits": denominator_units,
    }


def evaluate_pool(data, groups, selection):
    by_key = {typed_key(g["region"]): g for g in groups}
    selected, duplicates, unresolved = [], [], []
    seen = set()
    for region in selection:
        key = typed_key(region)
        if key in seen:
            duplicates.append(region)
            continue
        seen.add(key)
        if key not in by_key:
            unresolved.append(region)
            continue
        selected.append(by_key[key])
    reasons = []
    if not selection:
        reasons.append("empty-selection")
    if duplicates:
        reasons.append("duplicate-selected-group")
    if unresolved:
        reasons.append("selection-unresolved")
    if any(g["status"] != "available" for g in selected):
        reasons.append("unavailable-selected-group")
    def total(field):
        if any(g[field] is None for g in selected):
            return None
        return sum((Fraction(str(g[field])) for g in selected), Fraction(0))
    numerator, denominator = total("numerator"), total("denominator")
    if unresolved:
        numerator, denominator = None, None
    if numerator is not None and numerator > MAX_SAFE_INTEGER:
        numerator = None
        reasons.append("numerator-unsafe-integer")
    valid = not reasons
    rate = numerator * Fraction(str(data["scale"])) / denominator if valid and denominator else None
    mean = sum(Fraction(g["rateExact"]) for g in selected) / len(selected) if valid and selected else None
    return {
        "regions": selection,
        "status": "available" if valid else "unavailable",
        "observedNumerator": scalar(total("observedNumerator")),
        "numerator": scalar(numerator),
        "denominator": scalar(denominator),
        "rateExact": exact(rate),
        "meanOfGroupRatesExact": exact(mean),
        "reasons": sorted(set(reasons)),
        "numeratorContributors": distinct_refs(selected, "numeratorContributors"),
        "denominatorContributors": distinct_refs(selected, "denominatorContributors"),
        "includedRegions": [g["region"] for g in selected],
        "silentlyOmittedRegions": [],
        "unresolvedRegions": unresolved,
        "duplicateRegionKeys": duplicates,
    }


def evaluate(data):
    kind = data["kind"]
    source = "prepared" if kind == "prepared" else "events"
    rows = data["rows"] if kind == "prepared" else data["events"]
    loaded = data.get("availability", {}).get(source, "loaded") == "loaded"
    regions = list(data["regions"])
    seen = {typed_key(region) for region in regions}
    orphan_evidence = []
    unknown_attribution = False
    for row in rows if loaded else []:
        membership = window_membership(row, data["scope"], kind)
        try:
            key = typed_key(row.get("region"))
        except ValueError:
            may_affect = membership != "outside"
            unknown_attribution = unknown_attribution or may_affect
            orphan_evidence.append({
                "sourceId": source, "rowId": row["id"],
                "reason": "invalid-region-key", "mayAffectRequestedWindow": may_affect,
            })
            continue
        if membership != "outside" and key not in seen:
            seen.add(key)
            regions.append(row["region"])
    groups = [evaluate_group(data, region, unknown_attribution) for region in regions]
    result = {"groups": groups, "orphanNumeratorCandidates": orphan_evidence}
    if data.get("pools"):
        result["pools"] = [evaluate_pool(data, groups, selection) for selection in data["pools"]]
    if "selectedRegion" in data:
        selected = next(g for g in groups if typed_key(g["region"]) == typed_key(data["selectedRegion"]))
        result["selection"] = {
            "regions": [data["selectedRegion"]],
            "numeratorRows": selected["numeratorContributors"],
            "denominatorRows": selected["denominatorContributors"],
            "selectionExists": True,
        }
    return result


def compare(expected, actual, path="expected"):
    if type(expected) is not type(actual):
        # Integer-valued JSON numbers and exact integer arithmetic are compatible.
        if isinstance(expected, (int, float)) and not isinstance(expected, bool) and expected == actual:
            return 1
        raise AssertionError(f"{path}: type/value mismatch {expected!r} != {actual!r}")
    if isinstance(expected, dict):
        if expected.keys() != actual.keys():
            raise AssertionError(f"{path}: keys differ: {expected.keys()} != {actual.keys()}")
        return sum(compare(v, actual[k], f"{path}.{k}") for k, v in expected.items())
    if isinstance(expected, list):
        if len(expected) != len(actual):
            raise AssertionError(f"{path}: lengths differ {len(expected)} != {len(actual)}")
        return sum(compare(v, actual[i], f"{path}[{i}]") for i, v in enumerate(expected)) + 1
    if expected != actual:
        raise AssertionError(f"{path}: {expected!r} != {actual!r}")
    return 1


def main():
    fixture_path = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(__file__).with_name("regional-rate-fixtures.json")
    packet = json.loads(fixture_path.read_text())
    assertions = 0
    for case in packet["cases"]:
        actual = evaluate(case["input"])
        try:
            assertions += compare(case["expected"], actual, case["id"])
        except AssertionError as error:
            print(f"[FAIL] {case['id']}: {case['title']}", file=sys.stderr)
            print(str(error), file=sys.stderr)
            return 1
        print(f"[PASS] {case['id']}: {case['title']}")
    print(f"Verified {len(packet['cases'])} cases; {assertions} exact scalar, membership, and shape assertions.")
    print("Scope: standalone design oracle only; no explorEDA application or browser tests were run.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

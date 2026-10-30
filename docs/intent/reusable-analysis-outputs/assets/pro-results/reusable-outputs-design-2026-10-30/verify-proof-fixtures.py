#!/usr/bin/env python3
"""Check the supplied grouped-result mathematical contract with exact arithmetic.

Run: python3 verify-proof-fixtures.py [path/to/proof-fixtures.json]

This is a small independent fixture oracle, not an explorEDA implementation,
mock, package test, parser test, performance test, or browser test. It imports no
project code. Production numeric handling must use lib/valueParsing.ts.
"""

from __future__ import annotations

import json
import math
import re
import sys
from collections import Counter
from copy import deepcopy
from fractions import Fraction
from pathlib import Path
from typing import Any


DECIMAL = re.compile(r"^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$")
checks = 0


def numeric(value: Any) -> Fraction | None:
    """Finite numeric policy for supplied fixtures; no implicit bool conversion."""
    if value is None or isinstance(value, bool):
        return None
    if isinstance(value, int):
        return Fraction(value)
    if isinstance(value, float):
        return Fraction(str(value)) if math.isfinite(value) else None
    if not isinstance(value, str):
        return None
    text = value.strip()
    if not DECIMAL.fullmatch(text):
        return None
    return Fraction(text)


def exact(value: Fraction | None) -> str | None:
    return None if value is None else str(value)


def typed_key(value: Any) -> str:
    if value is None:
        return "null:"
    if isinstance(value, bool):
        return f"boolean:{str(value).lower()}"
    if isinstance(value, (int, float)):
        return f"number:{value}"
    return f"string:{value}"


def summarize(rows: list[dict[str, Any]], include_ids: bool = True) -> dict[str, Any]:
    eligible = [(row, numeric(row.get("value"))) for row in rows]
    eligible = [(row, value) for row, value in eligible if value is not None]
    numbers = [value for _, value in eligible]
    total = sum(numbers, Fraction(0)) if numbers else None
    result = {
        "rowCount": len(rows),
        "presentCount": sum(row.get("value") is not None for row in rows),
        "numericCount": len(numbers),
        "sum": exact(total),
        "mean": exact(total / len(numbers)) if total is not None else None,
        "min": exact(min(numbers)) if numbers else None,
        "max": exact(max(numbers)) if numbers else None,
    }
    if include_ids:
        result["memberIds"] = [row["measurementId"] for row in rows]
        result["eligibleIds"] = [row["measurementId"] for row, _ in eligible]
    return result


def grouped(rows: list[dict[str, Any]]) -> dict[str, dict[str, Any]]:
    groups: dict[str, list[dict[str, Any]]] = {}
    for row in rows:
        groups.setdefault(typed_key(row["experimentId"]), []).append(row)
    return {key: summarize(members) for key, members in groups.items()}


def equal_mean(groups: dict[str, dict[str, Any]]) -> str | None:
    means = [Fraction(group["mean"]) for group in groups.values() if group["mean"] is not None]
    return exact(sum(means, Fraction(0)) / len(means)) if means else None


def pooled_mean(groups: dict[str, dict[str, Any]]) -> str | None:
    total = sum((Fraction(group["sum"]) for group in groups.values() if group["sum"] is not None), Fraction(0))
    count = sum(group["numericCount"] for group in groups.values())
    return exact(total / count) if count else None


def check(name: str, actual: Any, expected: Any) -> None:
    global checks
    if actual != expected:
        print(f"FAIL {name}\n  expected: {expected!r}\n  actual:   {actual!r}", file=sys.stderr)
        raise SystemExit(1)
    checks += 1
    print(f"PASS {name}: {actual!r}")


def main() -> None:
    path = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(__file__).with_name("proof-fixtures.json")
    data = json.loads(path.read_text(encoding="utf-8"))
    print(f"Baseline: {data['baseline']}")
    print("Checking fixture arithmetic and declared contract only; no explorEDA code is loaded.\n")

    fixture = data["primary"]
    rows = fixture["rows"]
    expected = fixture["expected"]
    groups = grouped(rows)
    check("PF-01.source-occurrences", len(rows), expected["sourceOccurrenceCount"])
    for key, wanted in expected["groups"].items():
        check(f"PF-01.group.{key}", groups[key], wanted)
    check("PF-01.observed-group-keys", list(groups), expected["observedGroupKeys"])
    check("PF-01.no-unobserved-D", "string:D" in groups, expected["unobservedExperimentDHasRow"])
    check("PF-01.result-row-count", len(groups), expected["resultRowCount"])
    check("PF-01.finite-mean-count", sum(group["mean"] is not None for group in groups.values()), expected["finiteMeanCount"])
    check("PF-01.equal-experiment-mean", equal_mean(groups), expected["equalExperimentMean"])
    total = sum((Fraction(group["sum"]) for group in groups.values() if group["sum"] is not None), Fraction(0))
    numeric_count = sum(group["numericCount"] for group in groups.values())
    present_count = sum(group["presentCount"] for group in groups.values())
    check("PF-01.sum-of-group-sums", exact(total), expected["sumOfGroupSums"])
    check("PF-01.sum-of-numeric-counts", numeric_count, expected["sumOfNumericCounts"])
    check("PF-01.pooled-measurement-mean", pooled_mean(groups), expected["pooledMeasurementMean"])
    check("PF-01.present-count-is-not-numeric-count", present_count, expected["sumOfPresentCounts"])
    check("PF-01.incorrect-present-count-ratio", exact(total / present_count), expected["incorrectRatioUsingPresentCounts"])

    fixture = data["resultFilter"]
    expected = fixture["expected"]
    minimum = Fraction(fixture["minimumMean"])
    selected = {key: group for key, group in groups.items() if group["mean"] is not None and Fraction(group["mean"]) >= minimum}
    check("PF-02.selected-groups", list(selected), expected["selectedGroupKeys"])
    check("PF-02.selected-result-rows", len(selected), expected["selectedResultRowCount"])
    check("PF-02.selected-members", sum(group["rowCount"] for group in selected.values()), expected["memberOccurrenceCount"])
    check("PF-02.selected-numeric-contributors", sum(group["numericCount"] for group in selected.values()), expected["numericContributorCount"])
    check("PF-02.selected-mean", equal_mean(selected), expected["mean"])
    check("PF-02.producer-values-in-oracle-unchanged", {key: group["mean"] for key, group in groups.items()}, expected["producerGroupMeans"])

    fixture = data["sourceRefresh"]
    expected = fixture["expected"]
    refreshed = deepcopy(rows)
    changed = fixture["change"]
    for row in refreshed:
        if row["measurementId"] == changed["measurementId"]:
            row["value"] = changed["value"]
    refreshed_groups = grouped(refreshed)
    check("PF-03.refreshed-group-means", {key: group["mean"] for key, group in refreshed_groups.items()}, expected["groupMeans"])
    check("PF-03.refreshed-equal-mean", equal_mean(refreshed_groups), expected["equalExperimentMean"])
    check("PF-03.refreshed-pooled-mean", pooled_mean(refreshed_groups), expected["pooledMeasurementMean"])

    fixture = data["producerInputFilter"]
    expected = fixture["expected"]
    maximum = Fraction(fixture["maximumValue"])
    retained = [row for row in rows if (value := numeric(row.get("value"))) is not None and value <= maximum]
    retained_groups = grouped(retained)
    check("PF-04.retained-measurements", [row["measurementId"] for row in retained], expected["retainedMeasurementIds"])
    check("PF-04.input-filtered-group-means", {key: group["mean"] for key, group in retained_groups.items()}, expected["groupMeans"])
    check("PF-04.input-filtered-equal-mean", equal_mean(retained_groups), expected["equalExperimentMean"])
    check("PF-04.input-filtered-pooled-mean", pooled_mean(retained_groups), expected["pooledMeasurementMean"])

    fixture = data["duplicateSourceIds"]
    expected = fixture["expected"]
    duplicated = deepcopy(rows)
    for row in duplicated:
        if row["measurementId"] == fixture["change"]["fromMeasurementId"]:
            row["measurementId"] = fixture["change"]["toMeasurementId"]
    duplicated_groups = grouped(duplicated)
    counts = Counter(row["measurementId"] for row in duplicated)
    check("PF-05.duplicate-ids", {key: count for key, count in counts.items() if count > 1}, expected["duplicateIdCounts"])
    check("PF-05.physical-occurrences-retained", len(duplicated), expected["sourceOccurrenceCount"])
    check("PF-05.A-member-count", duplicated_groups["string:A"]["rowCount"], expected["groupARowCount"])
    check("PF-05.A-numeric-count", duplicated_groups["string:A"]["numericCount"], expected["groupANumericCount"])
    check("PF-05.A-mean", duplicated_groups["string:A"]["mean"], expected["groupAMean"])
    check("PF-05.equal-mean", equal_mean(duplicated_groups), expected["equalExperimentMean"])
    check("PF-05.pooled-mean", pooled_mean(duplicated_groups), expected["pooledMeasurementMean"])

    fixture = data["typedKeysAndEqualReadings"]
    expected = fixture["expected"]
    typed = grouped(fixture["rows"])
    check("PF-06.typed-group-keys", list(typed), expected["groupKeys"])
    check("PF-06.numeric-key-occurrences", typed["number:1"]["rowCount"], expected["numericKeyOccurrenceCount"])
    check("PF-06.text-key-occurrences", typed["string:1"]["rowCount"], expected["textKeyOccurrenceCount"])
    check("PF-06.equal-readings-sum-separately", typed["number:1"]["sum"], expected["numericKeySum"])
    check("PF-06.equal-readings-mean", typed["number:1"]["mean"], expected["numericKeyMean"])
    check("PF-06.all-occurrences", sum(group["rowCount"] for group in typed.values()), expected["allOccurrenceCount"])

    fixture = data["observedZero"]
    zero = summarize(fixture["rows"])
    check("PF-07.observed-zero-is-available", {key: zero[key] for key in fixture["expected"]}, fixture["expected"])

    fixture = data["emptyPopulation"]
    expected = fixture["expected"]
    empty = fixture["rows"]
    check("PF-08.empty-keyed-group-count", len(grouped(empty)), expected["keyedGroupRowCount"])
    global_summary = [summarize(empty, include_ids=False)]
    check("PF-08.empty-global-summary-count", len(global_summary), expected["globalSummaryRowCount"])
    check("PF-08.empty-global-summary-statistics", global_summary[0], expected["globalSummary"])
    minimum = Fraction(fixture["allFilteredMinimum"])
    all_filtered = [row for row in rows if (value := numeric(row.get("value"))) is not None and value > minimum]
    check("PF-08.all-input-filtered-count", len(all_filtered), expected["allFilteredRowCount"])
    check("PF-08.all-filtered-keyed-group-count", len(grouped(all_filtered)), expected["keyedGroupRowCount"])
    check("PF-08.all-filtered-global-statistics", summarize(all_filtered, include_ids=False), expected["globalSummary"])

    fixture = data["overlapCounterexample"]
    expected = fixture["expected"]
    by_id = {row["measurementId"]: row for row in fixture["observations"]}
    overlapping = {row["rowId"]: summarize([by_id[item] for item in row["memberIds"]]) for row in fixture["resultRows"]}
    leaf_visits = [item for row in fixture["resultRows"] for item in row["memberIds"]]
    unique_ids = set(leaf_visits)
    check("PF-09.immediate-result-rows", len(overlapping), expected["immediateResultRowCount"])
    check("PF-09.group-means", {key: group["mean"] for key, group in overlapping.items()}, expected["groupMeans"])
    check("PF-09.leaf-membership-visits", len(leaf_visits), expected["leafMembershipVisits"])
    check("PF-09.unique-leaf-occurrences", len(unique_ids), expected["uniqueLeafOccurrenceCount"])
    check("PF-09.equal-result-mean", equal_mean(overlapping), expected["equalResultMean"])
    check("PF-09.sum-of-group-sums", exact(sum((Fraction(group["sum"]) for group in overlapping.values()), Fraction(0))), expected["sumOfGroupSums"])
    check("PF-09.sum-of-numeric-counts", sum(group["numericCount"] for group in overlapping.values()), expected["sumOfNumericCounts"])
    check("PF-09.occurrence-weighted-mean", pooled_mean(overlapping), expected["occurrenceWeightedMean"])
    check("PF-09.unique-leaf-mean", summarize([by_id[item] for item in sorted(unique_ids)])["mean"], expected["uniqueLeafMean"])
    check("PF-09.not-a-disjoint-partition", len(leaf_visits) == len(unique_ids), expected["disjoint"])

    fixture = data["orderCategoryMembership"]
    expected = fixture["expected"]
    orders = {order["orderId"]: order for order in fixture["orders"]}
    members: dict[str, list[str]] = {}
    for item in fixture["lineItems"]:
        category_members = members.setdefault(item["category"], [])
        if item["orderId"] not in category_members:
            category_members.append(item["orderId"])
    category_counts = {category: len(ids) for category, ids in members.items()}
    category_amounts = {category: exact(sum((Fraction(orders[item]["amount"]) for item in ids), Fraction(0))) for category, ids in members.items()}
    unique_orders = {item for ids in members.values() for item in ids}
    check("PF-10.category-order-membership", members, expected["memberOrdersByCategory"])
    check("PF-10.category-order-counts", category_counts, expected["orderCountByCategory"])
    check("PF-10.category-order-amounts", category_amounts, expected["orderAmountByCategory"])
    check("PF-10.summed-membership-count", sum(category_counts.values()), expected["summedOrderCategoryMembershipCount"])
    check("PF-10.summed-membership-amount", exact(sum((Fraction(value) for value in category_amounts.values()), Fraction(0))), expected["summedAmountByMembership"])
    check("PF-10.unique-order-occurrences", len(unique_orders), expected["uniquePhysicalOrderOccurrences"])
    check("PF-10.unique-order-amount", exact(sum((Fraction(orders[item]["amount"]) for item in unique_orders), Fraction(0))), expected["uniqueOrderAmount"])
    check("PF-10.item-occurrences", len(fixture["lineItems"]), expected["itemOccurrences"])

    print(f"\n{checks} mathematical/fixture contract checks passed.")
    print(f"{len(data['proposedApplicationAcceptance'])} application acceptance cases are recorded as proposed and were NOT executed.")
    print("No explorEDA evaluator, package tests, worker race, saved-file round trip, React render, notebook interaction, or browser checks were run.")


if __name__ == "__main__":
    main()

"""Check selected Pro fixture anchors without importing any supplied program."""

import json
from fractions import Fraction
from pathlib import Path

root = Path(__file__).resolve().parents[3]
packet = root / "docs/intent/regional-rate-comparisons/assets/pro-results/regional-rates-design-2026-10-31/regional-rate-fixtures.json"
cases = {case["id"]: case for case in json.loads(packet.read_text())["cases"]}
checks = 0


def check(condition):
    global checks
    assert condition
    checks += 1


def group(case, index=0):
    return cases[f"RR-F{case:02}"]["expected"]["groups"][index]


check(len(cases) == 46)
for case in cases.values():
    data = case["input"]
    rows = {
        "events": data.get("events", []),
        "exposure": data.get("exposure", []),
        "prepared": data.get("rows", []),
    }
    for result in case["expected"]["groups"]:
        check((result["rateExact"] is not None) == (result["status"] == "available"))
        if result["rateExact"] is not None:
            n, d = result["numerator"], result["denominator"]
            check(d > 0 and n >= 0)
            check(Fraction(result["rateExact"]) == Fraction(str(n)) * Fraction(str(data["scale"])) / Fraction(str(d)))
        for role in ("numeratorContributors", "denominatorContributors"):
            refs = result[role]
            check(len({(r["sourceId"], r["rowId"]) for r in refs}) == len(refs))
            for ref in refs:
                check(any(row["id"] == ref["rowId"] for row in rows[ref["sourceId"]]))

# Derive the central event totals and fixed-denominator filter from raw inputs.
for case_number, counts in ((1, (12, 8, 0)), (17, (3, 2, 0))):
    case = cases[f"RR-F{case_number:02}"]
    data = case["input"]
    predicate = data.get("numeratorFilter", {})
    for index, region in enumerate("ABC"):
        selected = [row for row in data["events"] if row["region"] == region and all(row.get(k) == v for k, v in predicate.items())]
        expected = group(case_number, index)
        check(len(selected) == counts[index] == expected["numerator"])
        check([row["id"] for row in selected] == [ref["rowId"] for ref in expected["numeratorContributors"]])
        exposure = next(row for row in data["exposure"] if row["region"] == region)
        check(expected["denominator"] == exposure["denominator"])
        check(expected["denominatorContributors"] == group(1, index)["denominatorContributors"])

for case_number, pool_rates in ((1, ("100/7", "100/9")), (17, ("25/7", "25/9"))):
    case = cases[f"RR-F{case_number:02}"]
    for pool, rate in zip(case["expected"]["pools"], pool_rates):
        members = [g for g in case["expected"]["groups"] if g["region"] in pool["regions"]]
        n, d = sum(g["numerator"] for g in members), sum(g["denominator"] for g in members)
        check(Fraction(n * 1000, d) == Fraction(rate) == Fraction(pool["rateExact"]))
        check(Fraction(pool["meanOfGroupRatesExact"]) != Fraction(rate))
        for role in ("numeratorContributors", "denominatorContributors"):
            check({(r["sourceId"], r["rowId"]) for r in pool[role]} == {(r["sourceId"], r["rowId"]) for g in members for r in g[role]})
    check(case["expected"]["pools"][2]["rateExact"] is None)

check(group(1, 2)["rateExact"] == "0" and group(1, 2)["numeratorContributors"] == [])
check(group(1, 3)["rateExact"] is None and group(1, 3)["denominator"] == 500)
for number in (3, 5, 6, 9, 10, 11, 12, 13, 14, 15, 19, 20, 21, 22, 24, 25, 26, 28, 33, 34, 35, 36, 37):
    check(group(number)["rateExact"] is None)
check(group(4)["rateExact"] == "15" and len(group(4)["denominatorRepresentedRows"]) == 3)
check(group(7)["rateExact"] == "10" and len(group(7)["denominatorContributors"]) == 1)
check(type(group(16)["region"]) is int and type(group(16, 1)["region"]) is str)
check(group(16)["rateExact"] == "10" and group(16, 1)["rateExact"] == "40")
check(group(32)["rateExact"] == "2000/41")
check(group(38)["numerator"] == 2**53 - 1)
check(group(39)["numerator"] is None and group(39, 1)["numerator"] is None)
check(group(40)["rateExact"] == "10" and group(40, 2)["denominator"] is None)
check(group(41)["numerator"] is None and group(41, 1)["rateExact"] == "5")
check(group(42)["rateExact"] == "20" and len(group(42)["denominatorScopeExcluded"]) == 2)
for number in (43, 44, 45):
    check(cases[f"RR-F{number:02}"]["expected"]["pools"][0]["rateExact"] is None)
check(group(46)["rateExact"] == "10")
print(f"PASS: {checks} independent fixture anchor assertions across 46 cases.")
print("Checks cover arithmetic, reference existence, selected memberships, and named edge cases.")
print("No supplied or repository program was imported or executed; no application acceptance is claimed.")

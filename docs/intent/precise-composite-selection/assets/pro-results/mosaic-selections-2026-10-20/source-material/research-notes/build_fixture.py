"""Research fixture arithmetic only; does not import or test explorEDA."""
import json
from pathlib import Path
from datetime import datetime, timezone

rows = [
    ["r01", 0, 0, "East", 10, "2025-01-01T00:00:00Z", 1],
    ["r02", 1, 1, "East", 20, "2025-01-01T23:59:59.999Z", "1"],
    ["r03", 2, 2, "West", 30, "2025-01-02T00:00:00Z", 1],
    ["r04", 3, 1, "East", 0, "2025-01-02T12:00:00Z", "1"],
    ["r05", 4, 0, "West", 40, "2025-01-03T00:00:00Z", 2],
    ["r06", 2, 3, "East", None, "2025-01-02T23:59:59.999Z", None],
    ["r07", "2", 1, "East", "", "2025-02-30", ""],
    ["r08", None, 1, "East", 50, "2025-01-01T04:00:00Z", 3],
    ["r09", 1, "bad", "West", 60, "", False],
    ["r10", 2, 0, "West", "bad", "2025-01-01T19:00:00-05:00", 0],
    ["r11", 2, 1, "East", 5, "2025-01-02T00:00:00Z", True],
    ["r12", 5, 5, "North", 15, "2025-03-01T00:00:00Z", "North"],
]
fields = ["id", "x", "y", "region", "amount", "date", "tag"]
records = [dict(zip(fields, row)) for row in rows]

def num(v):
    if v is None or isinstance(v, bool) or v == "" or v == "bad":
        return None
    return float(v)

def ids(predicate):
    return [r["id"] for r in records if predicate(r)]

def a(r):
    x = num(r["x"])
    return x is not None and 1 <= x < 3

def b(r):
    x, y = num(r["x"]), num(r["y"])
    return x is not None and y is not None and x >= 0 and y >= 0 and x + y <= 3

def c(r):
    x = num(r["x"])
    return x is not None and 2 <= x < 4

def strict(v, expected):
    return type(v) is type(expected) and v == expected

def jan2(r):
    try:
        t = datetime.fromisoformat(r["date"].replace("Z", "+00:00"))
    except ValueError:
        return False
    return datetime(2025, 1, 2, tzinfo=timezone.utc) <= t < datetime(2025, 1, 3, tzinfo=timezone.utc)

expected = {
    "none": ids(lambda r: True),
    "A": ids(a),
    "B": ids(b),
    "A_and_B": ids(lambda r: a(r) and b(r)),
    "A_or_B": ids(lambda r: a(r) or b(r)),
    "C": ids(c),
    "A_and_C": ids(lambda r: a(r) and c(r)),
    "workspace_East": ids(lambda r: r["region"] == "East"),
    "East_and_A": ids(lambda r: r["region"] == "East" and a(r)),
    "East_and_B": ids(lambda r: r["region"] == "East" and b(r)),
    "East_and_A_and_B": ids(lambda r: r["region"] == "East" and a(r) and b(r)),
    "West_and_A_and_B": ids(lambda r: r["region"] == "West" and a(r) and b(r)),
    "date_Jan2_UTC": ids(jan2),
    "tag_number_1": ids(lambda r: strict(r["tag"], 1)),
    "tag_string_1": ids(lambda r: strict(r["tag"], "1")),
    "x_number_2": ids(lambda r: strict(r["x"], 2)),
    "x_string_2": ids(lambda r: strict(r["x"], "2")),
    "tuple_union": ids(lambda r: (r["region"] == "East" and strict(r["x"], 1)) or (r["region"] == "West" and strict(r["x"], 2))),
    "independent_value_lists": ids(lambda r: r["region"] in ["East", "West"] and (strict(r["x"], 1) or strict(r["x"], 2))),
    "zero_rows": ids(lambda r: num(r["x"]) is not None and num(r["x"]) >= 99),
    "real_zero": ["r04"],
    "empty_facet": [],
}
assert expected["A"] == ["r02", "r03", "r06", "r07", "r09", "r10", "r11"]
assert expected["B"] == ["r01", "r02", "r07", "r10", "r11"]
assert expected["A_and_B"] == ["r02", "r07", "r10", "r11"]
assert expected["date_Jan2_UTC"] == ["r03", "r04", "r06", "r10", "r11"]

values = [num(r["amount"]) for r in records if a(r) and b(r)]
valid = [v for v in values if v is not None]
assert sum(valid) == 25 and len(valid) == 2 and sum(valid) / len(valid) == 12.5

payload = {
    "kind": "proposed_research_fixture_not_application_result",
    "dataset_id": "mosaic-proof",
    "data_revision": 1,
    "rows": records,
    "predicates": {
        "A": "finiteNumber(x) >= 1 AND finiteNumber(x) < 3",
        "B": "inclusive linear-source triangle [(0,0),(3,0),(0,3)]; invalid coordinates fail",
        "C": "finiteNumber(x) >= 2 AND finiteNumber(x) < 4",
    },
    "expected_ids": expected,
    "intersection_measure": {"row_count": 4, "sum": 25, "valid_measure_count": 2, "average": 12.5, "included_ids": ["r02", "r11"], "excluded_ids": ["r07", "r10"]},
    "status": "Expected sets checked with independent arithmetic; every explorEDA integration, UI, runtime, and benchmark check remains unrun.",
}
out = Path(__file__).resolve().with_name("proof-fixture.json")
out.write_text(json.dumps(payload, indent=2) + "\n")
print(json.dumps({"fixture": str(out), "checked_cases": len(expected), "application_tests_run": 0, "expected_ids": expected}, indent=2))

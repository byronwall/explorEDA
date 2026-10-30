#!/usr/bin/env python3
"""Independent research proof harness, not explorEDA implementation code.

Run: python3 verify-timeline-concurrency.py
The default verifies the checked-in fixture and exact expected JSON. It performs
no writes and needs only Python's standard library. --write-expected regenerates
the expected JSON after checking two algorithms and manually authored anchors.

This parser intentionally supports this fixture's UTC/offset ISO timestamps and
numeric integer milliseconds only. Production TypeScript must call the baseline
valueParsing.ts helpers; this script does not claim full parser compatibility.
"""

from __future__ import annotations

import argparse
import copy
import json
import random
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


EPOCH = datetime(1970, 1, 1, tzinfo=timezone.utc)
SEED = 20261030
RANDOM_CASES = 500


def missing(value: Any) -> bool:
    return value is None or isinstance(value, str) and not value.strip()


def timestamp(value: Any) -> int | None:
    if isinstance(value, bool):
        return None
    if isinstance(value, int):
        return value
    if not isinstance(value, str):
        return None
    try:
        parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError:
        return None
    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=timezone.utc)
    delta = parsed.astimezone(timezone.utc) - EPOCH
    assert delta.microseconds % 1000 == 0, "Fixture timestamps must be integer ms"
    return (delta.days * 86400 + delta.seconds) * 1000 + delta.microseconds // 1000


def iso(value: int) -> str:
    from datetime import timedelta
    return (EPOCH + timedelta(milliseconds=value)).isoformat(timespec="milliseconds").replace("+00:00", "Z")


def typed_key(value: Any) -> str:
    if value is None:
        kind = "missing"
        return json.dumps([kind], separators=(",", ":"))
    if isinstance(value, bool):
        kind = "boolean"
    elif isinstance(value, (int, float)):
        kind = "number"
    else:
        kind = "string"
    return json.dumps([kind, value], separators=(",", ":"))


def read(row: dict) -> tuple[dict | None, str | None]:
    data = row["data"]
    if missing(data.get("lane")):
        return None, "missing-lane"
    start = timestamp(data.get("start"))
    if start is None:
        return None, "unreadable-start"
    raw_end = data.get("end")
    end = None if missing(raw_end) else timestamp(raw_end)
    if not missing(raw_end) and end is None:
        return None, "unreadable-end"
    if end is not None and end < start:
        return None, "reversed-end"
    return {
        "fixtureId": row["fixtureId"], "sourceId": row["sourceId"],
        "laneKey": typed_key(data["lane"]), "startMs": start,
        "endMs": end, "open": end is None,
    }, None


def source_rows(fixture: dict, revision: str) -> list[dict]:
    rows = copy.deepcopy(fixture["rows"])
    if revision == "fixture-v1":
        return rows
    assert revision == "fixture-v2"
    change = fixture["sourceRefresh"]
    rows = [row for row in rows if row["fixtureId"] not in change["removeFixtureIds"]]
    for patch in change["changes"]:
        next(row for row in rows if row["fixtureId"] == patch["fixtureId"])["data"].update(patch["data"])
    rows.extend(copy.deepcopy(change["append"]))
    if change["reverseSourceOrder"]:
        rows.reverse()
    if change["reassignSourceIdsByArrayIndex"]:
        for index, row in enumerate(rows):
            row["sourceId"] = index
    return rows


def select_population(rows: list[dict], scenario: dict) -> tuple[list[dict], list[str], list[str]]:
    population = []
    filtered = []
    faceted = []
    for row in rows:
        passes = all(typed_key(row["data"].get(p["field"])) == typed_key(p["equals"]) for p in scenario["population"])
        if not passes:
            filtered.append(row["fixtureId"])
            continue
        facet = scenario.get("facet")
        if facet is not None:
            passes_facet = row["fixtureId"] in facet["fixtureIds"] if "fixtureIds" in facet else typed_key(row["data"].get(facet["field"])) == typed_key(facet["equals"])
            if not passes_facet:
                faceted.append(row["fixtureId"])
                continue
        population.append(row)
    return population, sorted(filtered), sorted(faceted)


def normalize(rows: list[dict], window: tuple[int, int]) -> tuple[list[dict], dict]:
    left, right = window
    if left >= right:
        raise ValueError("Analytical window requires start < end")
    positive = []
    exclusions = defaultdict(list)
    zero = []
    outside = []
    for row in rows:
        item, reason = read(row)
        if reason:
            exclusions[reason].append(row["fixtureId"])
            continue
        assert item is not None
        if item["endMs"] == item["startMs"]:
            zero.append({"fixtureId": item["fixtureId"], "sourceId": item["sourceId"], "atMs": item["startMs"], "insideWindow": left <= item["startMs"] < right})
            continue
        start = max(left, item["startMs"])
        end = min(right, item["endMs"] if item["endMs"] is not None else right)
        if start >= end:
            outside.append(item["fixtureId"])
            continue
        positive.append({**item, "rawStartMs": item["startMs"], "rawEndMs": item["endMs"], "startMs": start, "endMs": end})
    details = {
        "semanticExclusions": {reason: sorted(ids) for reason, ids in sorted(exclusions.items())},
        "zeroDurationEvents": sorted(zero, key=lambda z: z["fixtureId"]),
        "outsideAnalyticalWindow": sorted(outside),
        "positiveIntervalIds": sorted(item["fixtureId"] for item in positive),
        "openContributors": sorted(item["fixtureId"] for item in positive if item["open"]),
        "clippedContributors": sorted(item["fixtureId"] for item in positive if item["rawStartMs"] != item["startMs"] or not item["open"] and item["rawEndMs"] != item["endMs"]),
    }
    return positive, details


def cell(start: int, end: int, contributors: list[dict], lanes: list[str]) -> dict:
    contributors = sorted(contributors, key=lambda row: row["fixtureId"])
    lane_rows = {lane: [r for r in contributors if r["laneKey"] == lane] for lane in lanes}
    return {
        "start": iso(start), "end": iso(end), "startMs": start, "endMs": end,
        "durationMs": end - start,
        "rowCount": len(contributors),
        "occupiedLaneCount": sum(bool(rows) for rows in lane_rows.values()),
        "contributors": [r["fixtureId"] for r in contributors],
        "sourceIds": [r["sourceId"] for r in contributors],
        "byLane": {lane: {"rowCount": len(rows), "contributors": [r["fixtureId"] for r in rows], "sourceIds": [r["sourceId"] for r in rows]} for lane, rows in lane_rows.items()},
    }


def endpoint_sweep(intervals: list[dict], window: tuple[int, int], lanes: list[str]) -> list[dict]:
    starts = defaultdict(list)
    ends = defaultdict(list)
    for row in intervals:
        starts[row["startMs"]].append(row)
        ends[row["endMs"]].append(row)
    points = sorted({*window, *starts.keys(), *ends.keys()})
    active = {}
    result = []
    for index, point in enumerate(points[:-1]):
        # One simultaneous update per time: no transient end/start peaks.
        for row in ends[point]:
            active.pop(row["fixtureId"])
        for row in starts[point]:
            active[row["fixtureId"]] = row
        result.append(cell(point, points[index + 1], list(active.values()), lanes))
    return result


def direct_cell_oracle(intervals: list[dict], window: tuple[int, int], lanes: list[str]) -> list[dict]:
    # Independent slow oracle: scan every interval against every endpoint cell.
    points = sorted({*window, *(r["startMs"] for r in intervals), *(r["endMs"] for r in intervals)})
    return [cell(start, end, [r for r in intervals if r["startMs"] <= start and r["endMs"] >= end], lanes) for start, end in zip(points, points[1:])]


def series_summary(cells: list[dict], values: list[int], threshold: int, integral_name: str, excess_name: str) -> dict:
    elapsed = sum(c["durationMs"] for c in cells)
    integral = sum(c["durationMs"] * count for c, count in zip(cells, values))
    busy = sum(c["durationMs"] for c, count in zip(cells, values) if count > 0)
    peak = max(values, default=0)
    return {
        "unionBusyDurationMs": busy,
        integral_name: integral,
        "durationAboveThresholdMs": sum(c["durationMs"] for c, count in zip(cells, values) if count > threshold),
        excess_name: sum(c["durationMs"] * max(count - threshold, 0) for c, count in zip(cells, values)),
        "peak": peak,
        "durationAtPeakMs": sum(c["durationMs"] for c, count in zip(cells, values) if count == peak),
        "busyFraction": {"numeratorMs": busy, "denominatorMs": elapsed},
        "meanCount": {"integralMs": integral, "durationMs": elapsed},
        "meanCountWhileBusy": {"integralMs": integral, "durationMs": busy} if busy else None,
    }


def summarize(cells: list[dict], intervals: list[dict], window: tuple[int, int], lanes: list[str], threshold: int) -> dict:
    row = series_summary(cells, [c["rowCount"] for c in cells], threshold, "totalIntervalDurationMs", "excessRowDurationMs")
    occupied = series_summary(cells, [c["occupiedLaneCount"] for c in cells], threshold, "totalLaneBusyDurationMs", "excessLaneDurationMs")
    lane_summaries = {lane: series_summary(cells, [c["byLane"][lane]["rowCount"] for c in cells], threshold, "totalIntervalDurationMs", "excessRowDurationMs") for lane in lanes}
    conflict_ids = set()
    for c in cells:
        for lane in lanes:
            if c["byLane"][lane]["rowCount"] > threshold:
                conflict_ids.update(c["byLane"][lane]["contributors"])
    combined = {
        "anyLaneAboveThresholdDurationMs": sum(c["durationMs"] for c in cells if any(c["byLane"][lane]["rowCount"] > threshold for lane in lanes)),
        "sumLaneAboveThresholdDurationMs": sum(s["durationAboveThresholdMs"] for s in lane_summaries.values()),
        "sumLaneExcessRowDurationMs": sum(s["excessRowDurationMs"] for s in lane_summaries.values()),
        "intervalIdsInvolvedInAnyLaneConflict": sorted(conflict_ids),
    }
    assert sum(c["durationMs"] for c in cells) == window[1] - window[0]
    assert row["totalIntervalDurationMs"] == sum(r["endMs"] - r["startMs"] for r in intervals)
    assert row["totalIntervalDurationMs"] == sum(s["totalIntervalDurationMs"] for s in lane_summaries.values())
    assert occupied["totalLaneBusyDurationMs"] == sum(s["unionBusyDurationMs"] for s in lane_summaries.values())
    assert row["unionBusyDurationMs"] == occupied["unionBusyDurationMs"]
    if threshold == 1:
        assert row["excessRowDurationMs"] == row["totalIntervalDurationMs"] - row["unionBusyDurationMs"]
    for c in cells:
        assert c["durationMs"] > 0
        assert c["rowCount"] == len(c["contributors"]) == sum(c["byLane"][lane]["rowCount"] for lane in lanes)
        assert 0 <= c["occupiedLaneCount"] <= c["rowCount"]
    return {"allRows": row, "occupiedLanes": occupied, "perLane": lane_summaries, "laneConflicts": combined}


def evaluate(fixture: dict, scenario: dict, override_window: dict | None = None) -> dict:
    rows = source_rows(fixture, scenario["sourceRevision"])
    settings = {"window": override_window or fixture["window"], "threshold": fixture["threshold"], "population": scenario["population"], "facet": scenario["facet"]}
    if scenario.get("roundTripSettingsThroughJson"):
        settings = json.loads(json.dumps(settings))
    window = (timestamp(settings["window"]["start"]), timestamp(settings["window"]["end"]))
    assert None not in window
    lanes = sorted({item["laneKey"] for row in rows if (item := read(row)[0]) is not None})
    population, filtered, faceted = select_population(rows, settings)
    intervals, disclosures = normalize(population, window)
    cells = endpoint_sweep(intervals, window, lanes)
    assert cells == direct_cell_oracle(intervals, window, lanes)
    return {
        "sourceRevision": scenario["sourceRevision"],
        "window": {"start": iso(window[0]), "end": iso(window[1]), "startMs": window[0], "endMs": window[1], "durationMs": window[1] - window[0]},
        "threshold": settings["threshold"],
        "referenceLaneKeys": lanes,
        "sourceIdMap": {row["fixtureId"]: row["sourceId"] for row in rows},
        "sourceRowCount": len(rows), "populationRowCount": len(population),
        "populationExcludedIds": filtered, "facetExcludedIds": faceted,
        **disclosures,
        "segments": cells,
        "summary": summarize(cells, intervals, window, lanes, settings["threshold"]),
    }


def selection_results(fixture: dict, scenario: dict, evaluated: dict) -> dict:
    rows, _, _ = select_population(source_rows(fixture, scenario["sourceRevision"]), scenario)
    window = (evaluated["window"]["startMs"], evaluated["window"]["endMs"])
    intervals, _ = normalize(rows, window)
    active = fixture["selectionProbes"]["savedActiveAt"]
    point = timestamp(active["at"])
    lane_key = typed_key(active["laneValue"])
    active_ids = sorted(r["fixtureId"] for r in intervals if r["laneKey"] == lane_key and r["startMs"] <= point < r["endMs"])
    overlap = fixture["selectionProbes"]["positiveOverlapWindow"]
    left, right = timestamp(overlap["start"]), timestamp(overlap["end"])
    overlap_ids = sorted(r["fixtureId"] for r in intervals if r["laneKey"] == typed_key(overlap["laneValue"]) and r["startMs"] < right and r["endMs"] > left)
    involved = fixture["selectionProbes"]["involvedWindow"]
    involved_left, involved_right = timestamp(involved["start"]), timestamp(involved["end"])
    involved_ids = sorted(r["fixtureId"] for r in intervals if r["startMs"] < involved_right and r["endMs"] > involved_left)
    peak_in_window = max(c["rowCount"] for c in evaluated["segments"] if c["startMs"] < involved_right and c["endMs"] > involved_left)
    enclosing = next(c for c in evaluated["segments"] if c["startMs"] <= point < c["endMs"])
    brush = fixture["selectionProbes"]["legacyInclusiveBrush"]
    brush_left, brush_right = timestamp(brush["start"]), timestamp(brush["end"])
    raw_brush = []
    drawable_brush = []
    for row in rows:
        start = timestamp(row["data"].get("start"))
        end = timestamp(row["data"].get("end"))
        opens = missing(row["data"].get("end")) and not missing(row["data"].get("start"))
        if start is not None and start <= brush_right and (end is not None and end >= brush_left or opens):
            raw_brush.append(row["fixtureId"])
        read_row, _ = read(row)
        if read_row is not None and read_row["startMs"] <= brush_right and (read_row["endMs"] is None or read_row["endMs"] >= brush_left):
            drawable_brush.append(row["fixtureId"])
    return {
        "activeAtIds": active_ids,
        "activeAtSourceIds": [evaluated["sourceIdMap"][row] for row in active_ids],
        "activeAtEnclosingGlobalAtom": {key: enclosing[key] for key in ("start", "end", "startMs", "endMs", "durationMs")},
        "positiveOverlapWindowIds": overlap_ids,
        "allIntervalsInvolvedInWindowIds": involved_ids,
        "peakSimultaneousRowsInInvolvedWindow": peak_in_window,
        "legacyBrushRawLinkedMatchIds": sorted(raw_brush),
        "legacyBrushDrawableMatchIds": sorted(drawable_brush),
        "ownSelectionAnalyticalSummary": "unchanged from this scenario summary; selection filters linked targets only",
    }


def hand_anchors(results: dict) -> None:
    base = results["scenarios"]["base"]
    expected_ids = [
        ["A1"], ["A1", "B1"], ["A2", "B1"], ["A2", "A3", "A4", "B1"],
        ["A2", "A3", "A4", "B2"], ["A2", "A5", "B2"], ["A5", "A6"],
        ["A6", "B3"], ["B3"], [], ["A7"], ["A7", "B4"],
    ]
    assert [c["contributors"] for c in base["segments"]] == expected_ids
    assert all(c["durationMs"] == 60_000 for c in base["segments"])
    row = base["summary"]["allRows"]
    assert [row[key] for key in ("totalIntervalDurationMs", "unionBusyDurationMs", "durationAboveThresholdMs", "excessRowDurationMs", "peak", "durationAtPeakMs")] == [1_440_000, 660_000, 480_000, 780_000, 4, 120_000]
    lane = base["summary"]["perLane"]['["string","A"]']
    assert [lane[key] for key in ("totalIntervalDurationMs", "unionBusyDurationMs", "durationAboveThresholdMs", "excessRowDurationMs", "peak")] == [960_000, 600_000, 240_000, 360_000, 3]
    assert base["summary"]["occupiedLanes"]["totalLaneBusyDurationMs"] == 1_080_000
    assert base["summary"]["occupiedLanes"]["durationAboveThresholdMs"] == 420_000
    assert base["summary"]["laneConflicts"]["anyLaneAboveThresholdDurationMs"] == 240_000
    assert base["summary"] == results["scenarios"]["restored_base"]["summary"]
    assert base["segments"] == results["scenarios"]["restored_base"]["segments"]
    refreshed = results["scenarios"]["source_refresh"]
    assert refreshed["summary"]["allRows"]["totalIntervalDurationMs"] == 1_380_000
    assert refreshed["summary"]["allRows"]["unionBusyDurationMs"] == 600_000
    assert refreshed["summary"]["allRows"]["peak"] == 5
    assert refreshed["summary"]["allRows"]["durationAtPeakMs"] == 30_000
    assert results["selectionProbes"]["base"]["activeAtIds"] == ["A2", "A3", "A4"]
    assert results["selectionProbes"]["source_refresh"]["activeAtIds"] == ["A2", "A3", "A4"]
    assert results["selectionProbes"]["source_refresh"]["positiveOverlapWindowIds"] == ["A2", "A3", "A4", "A8"]
    assert results["selectionProbes"]["base"]["allIntervalsInvolvedInWindowIds"] == ["A2", "A3", "A4", "A5", "A6", "B1", "B2"]
    assert results["selectionProbes"]["base"]["peakSimultaneousRowsInInvolvedWindow"] == 4
    assert results["selectionProbes"]["base"]["activeAtSourceIds"] != results["selectionProbes"]["source_refresh"]["activeAtSourceIds"]
    assert results["selectionProbes"]["base"]["activeAtEnclosingGlobalAtom"]["durationMs"] == 60_000
    assert results["selectionProbes"]["source_refresh"]["activeAtEnclosingGlobalAtom"]["durationMs"] == 30_000


def random_proofs() -> None:
    rng = random.Random(SEED)
    lanes = [typed_key("A"), typed_key("B"), typed_key(1), typed_key("1")]
    assert len(set(lanes)) == 4
    for case in range(RANDOM_CASES):
        end = rng.randint(1, 40)
        intervals = []
        for index in range(rng.randint(0, 30)):
            start, stop = sorted((rng.randint(-10, end + 10), rng.randint(-10, end + 10)))
            start, stop = max(start, 0), min(stop, end)
            if start >= stop:
                continue
            intervals.append({"fixtureId": f"r{index}", "sourceId": index, "laneKey": rng.choice(lanes), "startMs": start, "endMs": stop})
        cells = endpoint_sweep(intervals, (0, end), lanes)
        assert cells == direct_cell_oracle(intervals, (0, end), lanes), case
        # A third oracle enumerates every integer-ms cell of a tiny horizon.
        counts = [sum(r["startMs"] <= t < r["endMs"] for r in intervals) for t in range(end)]
        assert sum(c["durationMs"] * c["rowCount"] for c in cells) == sum(counts), case
        for threshold in (0, 1, 2, 3):
            summary = summarize(cells, intervals, (0, end), lanes, threshold)
            assert summary["allRows"]["durationAboveThresholdMs"] == sum(c > threshold for c in counts), case
            assert summary["allRows"]["excessRowDurationMs"] == sum(max(c - threshold, 0) for c in counts), case
            assert summary["allRows"]["peak"] == max(counts), case
        rng.shuffle(intervals)
        assert cells == endpoint_sweep(intervals, (0, end), lanes), case
    for invalid in ((0, 0), (2, 1)):
        try:
            normalize([], invalid)
        except ValueError:
            continue
        raise AssertionError("Invalid analytical window was accepted")


def produce(fixture: dict) -> dict:
    results = {"expectedVersion": 1,
        "contract": "Proposed semantics. Exact integers. Contributor arrays are intentionally exhaustive in this tiny acceptance fixture, not a production storage recommendation.",
        "peakZeroNote": "If every count is zero, peak is zero and durationAtPeakMs equals the full finite window; meanCountWhileBusy is null because its denominator is zero.",
        "scenarios": {}, "selectionProbes": {}}
    assert fixture["rows"][2]["data"] == fixture["rows"][3]["data"]
    for scenario in fixture["scenarios"]:
        value = evaluate(fixture, scenario)
        results["scenarios"][scenario["id"]] = value
        if scenario["id"] in ("base", "source_refresh"):
            results["selectionProbes"][scenario["id"]] = selection_results(fixture, scenario, value)
    base_scenario = fixture["scenarios"][0]
    results["analysisSubwindow"] = evaluate(fixture, base_scenario, fixture["selectionProbes"]["analysisSubwindow"])
    results["viewportOnly"] = {"requestedViewport": fixture["selectionProbes"]["viewportOnly"], "expectedAnalyticalScenario": "base", "summary": results["scenarios"]["base"]["summary"]}
    results["durationProbes"] = []
    for probe in fixture["durationProbes"]:
        elapsed = timestamp(probe["end"]) - timestamp(probe["start"])
        assert elapsed == probe["expectedMs"]
        assert timestamp(probe["localStartWithOffset"]) == timestamp(probe["start"])
        assert timestamp(probe["localEndWithOffset"]) == timestamp(probe["end"])
        results["durationProbes"].append({"id": probe["id"], "elapsedMs": elapsed})
    hand_anchors(results)
    return results


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--directory", type=Path, default=Path(__file__).resolve().parent)
    parser.add_argument("--write-expected", action="store_true")
    args = parser.parse_args()
    fixture = json.loads((args.directory / "timeline-concurrency-fixture.json").read_text())
    print("[proof] Evaluating exact fixture through grouped sweep and direct-cell oracle")
    actual = produce(fixture)
    print(f"[proof] Checking {RANDOM_CASES} deterministic randomized cases, seed={SEED}")
    random_proofs()
    target = args.directory / "timeline-concurrency-expected.json"
    if args.write_expected:
        target.write_text(json.dumps(actual, indent=2, ensure_ascii=False) + "\n")
        print(f"[proof] Wrote {target.name}")
    else:
        expected = json.loads(target.read_text())
        assert actual == expected, "Expected JSON differs from recomputed exact results"
        print("[proof] Exact expected JSON matches every recomputed segment and summary")
    print("[proof] PASS: 8 scenarios; analytical subwindow; viewport invariance; active-at/overlap/brush probes; source refresh; DST duration; 500 randomized cases")
    print("[proof] This verifies the research oracle only. No explorEDA runtime, browser, Vitest, or pnpm tests were executed by this script.")


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""Verify the hand-enumerated duplicate-repair design fixtures.

This script checks evidence partitions, exact original values, typed keys,
relationship arithmetic, aggregate arithmetic, refresh guards, and a standalone
lossless scalar-codec contract. It does NOT implement the proposed repair engine,
choose winners, run explorEDA, or claim that production persistence/UI tests pass.

Run: python3 verify_fixtures.py [fixtures.json]
"""
from __future__ import annotations

from collections import Counter, defaultdict
from copy import deepcopy
import json
import math
from pathlib import Path
import sys


SPECIAL = {"undefined", "NaN", "Infinity", "-Infinity", "-0"}
UNDEFINED = object()
WIRE_MARKER = "__exploreda_value__"


def require(condition, message):
    if not condition:
        raise AssertionError(message)


def special(value):
    if isinstance(value, dict) and set(value) == {"$scalar"}:
        require(value["$scalar"] in SPECIAL, f"Unknown scalar fixture tag: {value}")
        return value["$scalar"]
    return None


def exact(value):
    """Presence- and type-sensitive raw evidence signature; no value coercion."""
    tag = special(value)
    if tag is not None:
        return ("special", tag)
    if value is None:
        return ("null",)
    if isinstance(value, bool):
        return ("boolean", value)
    if isinstance(value, (int, float)):
        if isinstance(value, float) and value == 0 and math.copysign(1, value) < 0:
            return ("special", "-0")
        return ("number", value)
    if isinstance(value, str):
        return ("string", value)
    if isinstance(value, list):
        return ("array", tuple(exact(item) for item in value))
    if isinstance(value, dict):
        return ("object", tuple((key, exact(value[key])) for key in sorted(value)))
    raise AssertionError(f"Unsupported fixture value: {type(value)}")


def key_atom(value):
    tag = special(value)
    if tag == "-0":
        return ("number", 0)
    if tag is not None or value is None:
        return None
    if isinstance(value, bool):
        return ("boolean", value)
    if isinstance(value, (int, float)):
        return ("number", value) if math.isfinite(value) else None
    if isinstance(value, str):
        return ("string", value) if value.strip() else None
    return None


def tuple_key(values):
    atoms = [key_atom(value) for value in values]
    return tuple(atoms) if atoms and all(atom is not None for atom in atoms) else None


def fields_key(values, fields):
    return tuple_key([values.get(field, {"$scalar": "undefined"}) for field in fields])


def data_values(snapshot, values):
    metadata = snapshot.get("fieldMetadata", {})
    return {
        field: value
        for field, value in values.items()
        if metadata.get(field, {}).get("generated") != "source-row-number"
    }


def values_by_ref(snapshot):
    return {row["ref"]: row["values"] for row in snapshot["rows"]}


def check_repair(case, snapshots):
    for run in case["runs"]:
        label = f"{case['id']}/{run['id']}"
        snapshot = snapshots[run.get("inputSnapshot", case["inputSnapshot"])]
        originals = values_by_ref(snapshot)
        key_fields = run.get("keyFields", case["keyFields"])
        result = run["expected"]
        outputs = result["previewOutputs"]
        excluded = [item["ref"] for item in result["excluded"]]
        pending = [ref for group in result["unresolved"] for ref in group["refs"]]
        represented = []
        seen_keys = set()
        require(len(set(excluded)) == len(excluded), f"{label}: duplicate exclusion")
        require(len(set(pending)) == len(pending), f"{label}: duplicate unresolved ref")
        for item in outputs:
            winners = item["winnerRefs"]
            require(winners and len(set(winners)) == len(winners), f"{label}: empty/duplicate winner class")
            require(winners == item["representedRefs"], f"{label}: represented differs from winning class")
            represented.extend(winners)
            for ref in winners:
                require(ref in originals, f"{label}: unknown winner {ref}")
                require(exact(item["values"]) == exact(data_values(snapshot, originals[ref])),
                        f"{label}: output does not equal whole original data values for {ref}")
            key = tuple_key(item["key"])
            require(key is not None, f"{label}: invalid emitted key")
            require(key == fields_key(item["values"], key_fields), f"{label}: key differs from output")
            require(key not in seen_keys, f"{label}: duplicate emitted entity")
            seen_keys.add(key)
            for ref in item["excludedRefs"]:
                require(ref in excluded and ref in originals, f"{label}: output exclusion not in ledger")
                require(fields_key(originals[ref], key_fields) == key, f"{label}: exclusion belongs to another entity")
        require(len(represented) == len(set(represented)), f"{label}: represented more than once")
        partitions = [set(represented), set(excluded), set(pending)]
        require(not (partitions[0] & partitions[1] or partitions[0] & partitions[2] or partitions[1] & partitions[2]),
                f"{label}: evidence partitions overlap")
        require(set.union(*partitions) == set(originals), f"{label}: original occurrence evidence omitted or invented")
        if result["status"] == "ready":
            require(not pending, f"{label}: ready with unresolved rows")
            require(result["usableOutputCount"] == len(outputs), f"{label}: usable count mismatch")
        else:
            require(result["usableOutputCount"] is None, f"{label}: blocked target exposes usable rows")
        for item in result["excluded"]:
            require(bool(item["reason"]), f"{label}: unreasoned exclusion")


def target_values(case, relationship, snapshots):
    if "toSnapshot" in relationship:
        return [row["values"] for row in snapshots[relationship["toSnapshot"]]["rows"]]
    run = next(run for run in case["runs"] if run["id"] == relationship["toRun"])
    require(run["expected"]["status"] == "ready", "Relationship points to unusable prepared run")
    return [item["values"] for item in run["expected"]["previewOutputs"]]


def match_vectors(from_values, from_fields, to_values, to_fields):
    index = defaultdict(list)
    for values in to_values:
        key = fields_key(values, to_fields)
        if key is not None:
            index[key].append(values)
    return [index.get(fields_key(values, from_fields), []) for values in from_values]


def check_relationships(case, snapshots):
    for rel in case.get("relationships", []):
        label = f"{case['id']}/{rel['id']}"
        inputs = [row["values"] for row in snapshots[rel["fromSnapshot"]]["rows"]]
        targets = target_values(case, rel, snapshots)
        matches = match_vectors(inputs, rel["fromFields"], targets, rel["toFields"])
        sizes = [len(items) for items in matches]
        actual = {
            "matched": sum(size > 0 for size in sizes),
            "unmatched": sum(size == 0 for size in sizes),
            "ambiguous": sum(size > 1 for size in sizes),
            "expandedExtra": sum(max(0, size - 1) for size in sizes),
            "innerRows": sum(sizes),
            "leftRows": sum(max(1, size) for size in sizes),
        }
        require(actual == rel["expected"], f"{label}: relationship counts {actual} != {rel['expected']}")
        if "lookupOutputCount" in rel:
            require(rel["lookupOutputCount"] == len(inputs), f"{label}: lookup changed input grain")
        if "lookupValues" in rel and "lookupValueField" in rel:
            actual_values = [rows[0].get(rel["lookupValueField"], {"$scalar":"undefined"}) if len(rows) == 1 else {"$scalar":"undefined"} for rows in matches]
            require(exact(actual_values) == exact(rel["lookupValues"]), f"{label}: lookup values differ")
        if "expectedAmount" in rel:
            require(sum(row["amount"] for rows in matches for row in rows) == rel["expectedAmount"], f"{label}: expansion amount differs")


def check_integrated(case, snapshots):
    run = next(run for run in case["runs"] if run["id"] == "manual-first-release")
    targets = [item["values"] for item in run["expected"]["previewOutputs"]]
    orders = [row["values"] for row in snapshots["orders_s0"]["rows"]]
    matched = match_vectors(orders, ["customer"], targets, ["id"])
    unique = {fields_key(rows[0], ["id"]): rows[0]["credit"] for rows in matched if len(rows) == 1}
    expected = case["aggregateExpectations"]
    require(sum(row["amount"] for row in orders) == expected["orderAmount"], "DR-F01: order amount")
    require(sum(rows[0]["credit"] for rows in matched if len(rows) == 1) == expected["naiveLookupCredit"], "DR-F01: naive credit")
    require(sum(unique.values()) == expected["oncePerPreparedCustomerCredit"], "DR-F01: entity credit")
    require(sum(row["credit"] for row in targets) == expected["allPreparedCustomerCredit"], "DR-F01: all-target credit")
    require(set(ref for item in run["expected"]["previewOutputs"] for ref in item["representedRefs"]) == set(expected["representedOriginalRefs"]), "DR-F01: represented total")
    require({item["ref"] for item in run["expected"]["excluded"]} == set(expected["excludedOriginalRefs"]), "DR-F01: excluded total")
    require(sum(expected["numericEntityInputValues"]) == 70, "DR-F01: expected numeric entity inputs")
    require(case["notebookExpected"]["creditTotal"] == 120 and case["notebookExpected"]["orderAmount"] == 90, "DR-F01: notebook totals")


def check_text_ordering_contract(case):
    """Check the specified JS string-order relation, not a production selector."""
    vector = case["textOrderingVector"]

    def utf16_units(text):
        encoded = text.encode("utf-16-be", errors="surrogatepass")
        return tuple(int.from_bytes(encoded[index:index+2], "big") for index in range(0, len(encoded), 2))

    def compare(left, right):
        return (left > right) - (left < right)

    require(vector["comparator"] == "verbatim-lexicographic-utf16-code-units", "DR-F08: text comparator contract")
    require(all(isinstance(value, str) and value.strip() for value in vector["eligibleInputs"]), "DR-F08: text eligibility")
    require(all(not isinstance(value, str) or not value.strip() for value in vector["ineligibleInputs"]), "DR-F08: nontext or blank must be ineligible")
    ascending = sorted(vector["eligibleInputs"], key=utf16_units)
    require(ascending == vector["expectedAscending"], "DR-F08: UTF-16 ascending order")
    require(list(reversed(ascending)) == vector["expectedDescending"], "DR-F08: UTF-16 descending order")
    for pair in vector["pairExpectations"]:
        require(compare(utf16_units(pair["left"]), utf16_units(pair["right"])) == pair["comparison"], "DR-F08: verbatim text pair comparison")
    witness = vector["unicodeWitness"]
    require(list(utf16_units(witness["supplementary"])) == witness["supplementaryUtf16CodeUnits"] and list(utf16_units(witness["bmp"])) == witness["bmpUtf16CodeUnits"], "DR-F08: UTF-16 code-unit witness")
    require(compare(utf16_units(witness["supplementary"]), utf16_units(witness["bmp"])) == witness["expectedUtf16Comparison"], "DR-F08: supplementary/BMP UTF-16 order")
    require(compare(ord(witness["supplementary"]), ord(witness["bmp"])) == witness["expectedUnicodeCodePointComparison"], "DR-F08: witness must distinguish Python code-point order")
    require(vector["localeCollation"] is False and vector["coercion"] is False and vector["productionOrderingEngineExecuted"] is False, "DR-F08: comparator proof must not overclaim engine execution")


def multiset_signature(snapshot, key_fields=None, selected_key=None):
    rows = snapshot["rows"]
    if key_fields is not None:
        wanted = tuple_key(selected_key)
        rows = [row for row in rows if fields_key(row["values"], key_fields) == wanted]
    schema = exact({"fields": sorted(snapshot["fields"]), "metadata": snapshot.get("fieldMetadata", {})})
    return schema, Counter(exact(data_values(snapshot, row["values"])) for row in rows)


def check_refresh(case, snapshots, cases):
    before = snapshots[case["baselineSnapshot"]]
    guard = case["manualGuard"]
    original = multiset_signature(before, case["keyFields"], guard["key"])
    reference = cases[case["baselineRun"]["caseId"]]
    baseline_run = next(run for run in reference["runs"] if run["id"] == case["baselineRun"]["runId"])
    for transition in case["transitions"]:
        after = snapshots[transition["nextSnapshot"]]
        valid = original == multiset_signature(after, case["keyFields"], guard["key"])
        require(valid == (transition["expectedGuard"] == "valid"), f"DR-F09/{transition['id']}: manual guard")
        unchanged = multiset_signature(before) == multiset_signature(after)
        if unchanged:
            require(transition["currentStatusBeforeAcceptance"] == "ready", "DR-F09: reorder should remain ready")
            require(transition["currentUsableOutputCount"] == 4, "DR-F09: reorder output count")
        else:
            require(transition["currentUsableOutputCount"] is None, "DR-F09: unaccepted changed snapshot became current")
            require(transition["historicalSnapshot"] == case["baselineSnapshot"], "DR-F09: historical evidence lost")
        if not valid:
            require(transition["afterAcceptanceExpectedOutputCount"] is None, "DR-F09: stale manual choice accepted silently")
            continue
        outputs = deepcopy(baseline_run["expected"]["previewOutputs"])
        if "changedOutput" in transition:
            changed = transition["changedOutput"]
            outputs = [changed if tuple_key(item["key"]) == tuple_key(changed["key"]) else item for item in outputs]
        if "newOutput" in transition:
            outputs.append(transition["newOutput"])
        originals = values_by_ref(after)
        for item in outputs:
            for ref in item["winnerRefs"]:
                require(exact(item["values"]) == exact(data_values(after, originals[ref])), f"DR-F09/{transition['id']}: changed output values")
        require(len(outputs) == transition["afterAcceptanceExpectedOutputCount"], f"DR-F09/{transition['id']}: output count")
        require(sum(item["values"]["credit"] for item in outputs) == transition["afterAcceptanceCredit"], f"DR-F09/{transition['id']}: credit total")
        if "afterAcceptanceNaiveLookupCredit" in transition:
            orders = [row["values"] for row in snapshots["orders_s0"]["rows"]]
            matches = match_vectors(orders, ["customer"], [item["values"] for item in outputs], ["id"])
            require(sum(rows[0]["credit"] for rows in matches if len(rows) == 1) == transition["afterAcceptanceNaiveLookupCredit"], "DR-F09: changed naive credit")
            unique = {fields_key(rows[0], ["id"]):rows[0]["credit"] for rows in matches if len(rows) == 1}
            require(sum(unique.values()) == transition["afterAcceptanceEntityCredit"], "DR-F09: changed entity credit")
    nav = case["navigationExpected"]
    require(before["rows"][nav["oldRef"]["ordinal"]]["ref"] == nav["oldRef"]["ref"], "DR-F09: original navigation")
    require(snapshots["customers_reordered"]["rows"][nav["oldRef"]["ordinal"]]["ref"] == nav["sameOrdinalInReorderedSnapshot"], "DR-F09: positional trap fixture")
    require(values_by_ref(before)["c6"]["credit"] == 35, "DR-F09: historical original overwritten")


def check_aggregation(case, snapshots):
    for run in case["runs"]:
        groups = defaultdict(list)
        for row in snapshots[run["inputSnapshot"]]["rows"]:
            groups[fields_key(row["values"], [run["entityField"]])].append(row["values"][run["measureField"]])
        conflicts = [values for values in groups.values() if len({exact(value) for value in values}) > 1]
        result = run["expected"]
        require(len(groups) == result["entityCount"], f"DR-F12/{run['id']}: entity count")
        require(result["conflictingEntityMeasureDiagnostics"] == (3 if conflicts else 0), "DR-F12: diagnostic count")
        if conflicts:
            for measure in ["measuredCount", "sum", "average"]:
                require(special(result[measure]) == "undefined", f"DR-F12: conflicting {measure} became available")
        else:
            values = [items[0] for items in groups.values()]
            require(result["measuredCount"] == len(values), "DR-F12: measured count")
            require(result["sum"] == sum(values), "DR-F12: sum")
            require(result["average"] == sum(values) / len(values), "DR-F12: average")


def fixture_to_runtime(value):
    tag = special(value)
    if tag == "undefined":
        return UNDEFINED
    if tag is not None:
        return {"NaN":float("nan"), "Infinity":float("inf"), "-Infinity":float("-inf"), "-0":-0.0}[tag]
    if isinstance(value, list):
        return [fixture_to_runtime(item) for item in value]
    if isinstance(value, dict):
        return {key:fixture_to_runtime(item) for key,item in value.items()}
    return value


def wire_encode(value):
    """Small standalone codec proof, including the proposed signed-zero extension."""
    if value is UNDEFINED:
        return {WIRE_MARKER:"undefined"}
    if isinstance(value, float):
        if math.isnan(value):
            return {WIRE_MARKER:"NaN"}
        if math.isinf(value):
            return {WIRE_MARKER:"Infinity" if value > 0 else "-Infinity"}
        if value == 0 and math.copysign(1, value) < 0:
            return {WIRE_MARKER:"-0"}
    if isinstance(value, list):
        return [wire_encode(item) for item in value]
    if isinstance(value, dict):
        encoded = {key:wire_encode(item) for key,item in value.items()}
        return {WIRE_MARKER:"escaped-object", "value":encoded} if WIRE_MARKER in value else encoded
    return value


def wire_decode(value):
    if isinstance(value, list):
        return [wire_decode(item) for item in value]
    if isinstance(value, dict):
        if set(value) == {WIRE_MARKER, "value"} and value[WIRE_MARKER] == "escaped-object":
            return {key:wire_decode(item) for key,item in value["value"].items()}
        if set(value) == {WIRE_MARKER} and value[WIRE_MARKER] in SPECIAL:
            return fixture_to_runtime({"$scalar":value[WIRE_MARKER]})
        return {key:wire_decode(item) for key,item in value.items()}
    return value


def runtime_to_fixture(value):
    if value is UNDEFINED:
        return {"$scalar":"undefined"}
    if isinstance(value, float):
        if math.isnan(value):
            return {"$scalar":"NaN"}
        if math.isinf(value):
            return {"$scalar":"Infinity" if value > 0 else "-Infinity"}
        if value == 0 and math.copysign(1, value) < 0:
            return {"$scalar":"-0"}
    if isinstance(value, list):
        return [runtime_to_fixture(item) for item in value]
    if isinstance(value, dict):
        return {key:runtime_to_fixture(item) for key,item in value.items()}
    return value


def check_persistence(case):
    for vector in case["scalarEvidenceVectors"]:
        runtime = fixture_to_runtime(vector["input"])
        wire = json.loads(json.dumps(wire_encode(runtime), allow_nan=False))
        restored = runtime_to_fixture(wire_decode(wire))
        require(exact(restored) == exact(vector["expected"]), f"DR-F13/{vector['label']}: scalar evidence round trip")
    closure = case["selectedViewClosure"]
    require(set(closure["expectedDefinitions"]) == {"orders","customers_repaired","customers"}, "DR-F13: closure definitions")
    require(set(closure["expectedRawTables"]) == {"orders","customers"}, "DR-F13: closure originals")
    require(case["productionRoundTripsExecuted"] is False, "DR-F13: overclaims production tests")


def check_undeclared_field_vector(case):
    vector = next(item for item in case["fixtures"] if item["id"] == "undeclared-own-data-field-differs")
    originals = vector["inputRows"]
    declared = set(vector["declaredFields"])
    all_fields = set().union(*(set(row["values"]) for row in originals))
    require(all_fields - declared == set(vector["expectedUndeclaredFields"]), "DR-F10: undiscovered field vector")
    projections = [{key:value for key,value in row["values"].items() if key in declared} for row in originals]
    require(exact(projections[0]) == exact(projections[1]), "DR-F10: declared-only projection must appear equal")
    require(exact(originals[0]["values"]) != exact(originals[1]["values"]), "DR-F10: full original values must differ")
    before = vector["beforeDiscoveryExpected"]
    after = vector["afterDiscoveryExpected"]
    refs = {row["ref"] for row in originals}
    require(before["status"] == "unavailable" and before["usableOutputCount"] is None and before["exactCollapseAllowed"] is False, "DR-F10: undeclared field cannot be collapsed")
    require(set(before["preservedOriginalRefs"]) == refs, "DR-F10: undiscovered data evidence lost")
    require(set(after["fields"]) == all_fields, "DR-F10: discovery omitted original field")
    conflicts = {field for field in all_fields if len({exact(row["values"].get(field, {"$scalar":"undefined"})) for row in originals}) > 1}
    require(conflicts == set(after["conflictFields"]), "DR-F10: discovered conflict evidence")
    require(after["status"] == "blocked" and after["usableOutputCount"] is None, "DR-F10: discovered difference remains unresolved")
    require(not after["winnerRefs"] and not after["representedRefs"] and not after["excludedRefs"] and set(after["unresolvedRefs"]) == refs, "DR-F10: discovery silently chose or dropped an original")
    require(vector["productionAcceptanceExecuted"] is False, "DR-F10: overclaims production schema test")


def check_chained_origin_vector(case):
    vector = case["chainedRetargetVector"]
    raw = {source:[row["values"] for row in rows] for source,rows in vector["inputRows"].items()}
    refs = {row["ref"]:row["values"] for row in vector["inputRows"]["customers"]}
    prepared = vector["preparedExpectedOutputs"]
    represented = []
    for item in prepared:
        require(item["winnerRefs"] == item["representedRefs"] and not item["excludedRefs"], "DR-F16: chained fixture membership")
        represented.extend(item["representedRefs"])
        for ref in item["representedRefs"]:
            require(exact(item["values"]) == exact(refs[ref]), "DR-F16: chained prepared output is not original")
    require(set(represented) == set(refs) and len(represented) == len(refs), "DR-F16: chained original evidence incomplete")
    before = vector["beforeField"]
    after = vector["afterFirstRetargetField"]
    relation = vector["initialRelationships"][1]
    clone = vector["explicitRewire"]["cloneRelationship"]
    require(before["id"] == after["id"] == "customer.regionId", "DR-F16: alias should stay identical")
    require(before["origin"] == relation["from"], "DR-F16: initial relation does not match original field")
    require(after["origin"] != relation["from"] and after["origin"] != relation["to"], "DR-F16: raw relation should reject prepared origin")
    require(after["origin"] == clone["from"] and clone["id"] != relation["id"], "DR-F16: explicit cloned relation must match new origin")
    blocked = vector["retargetFirstOnlyExpected"]
    require(blocked["status"] == "blocked-proposal" and blocked["affectedStepIds"] == ["region-lookup"], "DR-F16: affected chained step")
    require(blocked["expectedProjectWrites"] == blocked["expectedHostCallbacks"] == 0 and blocked["committedRawQueryRemainsUsable"], "DR-F16: atomic proposal should not partially commit")

    def count_vector(matches):
        sizes = [len(rows) for rows in matches]
        return {"matched":sum(size > 0 for size in sizes),"unmatched":sum(size == 0 for size in sizes),
                "ambiguous":sum(size > 1 for size in sizes),"expandedExtra":sum(max(0,size-1) for size in sizes),
                "innerRows":sum(sizes),"leftRows":sum(max(1,size) for size in sizes)}

    for target, expected in [(raw["customers"], vector["rawExpected"]), ([item["values"] for item in prepared], vector["explicitRewire"]["expected"])]:
        first = match_vectors(raw["orders"], ["customerId"], target, ["id"])
        projected = [{"regionId":rows[0]["regionId"] if len(rows)==1 else {"$scalar":"undefined"}} for rows in first]
        second = match_vectors(projected, ["regionId"], raw["regions"], ["id"])
        names = [rows[0]["name"] if len(rows)==1 else {"$scalar":"undefined"} for rows in second]
        require(count_vector(first) == expected["firstRelationshipCounts"], "DR-F16: chained first relationship arithmetic")
        require(count_vector(second) == expected["secondRelationshipCounts"], "DR-F16: chained second relationship arithmetic")
        require(exact(names) == exact(expected["regionNames"]), "DR-F16: chained region output values")
        require(expected["lookupOutputCount"] == len(raw["orders"]) == 2 and expected["orderAmount"] == sum(row["amount"] for row in raw["orders"]) == 18, "DR-F16: chained lookup grain and amount")
    alone = vector["createPreparedSourceAloneExpected"]
    require(alone["allowed"] and not alone["retargetedRelationshipIds"] and exact(alone["rawQueryRegionNames"]) == exact(vector["rawExpected"]["regionNames"]), "DR-F16: standalone source creation changes raw chain")
    require(vector["productionAcceptanceExecuted"] is False, "DR-F16: overclaims production origin test")


def check_async_commit_vectors(case, snapshots):
    steps = {step["action"]:step for step in case["steps"]}
    success = steps["async-host-commit-publishes-before-acknowledgement"]
    require(success["callback"] == "onProjectChange" and success["callbackReturnType"] == "Promise<void>" and special(success["callbackResolvedValue"]) == "undefined", "DR-F16: async host callback contract")
    require(success["observedRevisionAtFinalBaseRecheck"] == success["baseProjectRevision"] != success["desiredProjectRevision"], "DR-F16: final base check and desired revision")
    require(success["expectedPostAcknowledgementComparison"] == {"projectRevision":success["desiredProjectRevision"],"transactionId":success["transactionId"]}, "DR-F16: acknowledgement must compare desired transaction")
    require(success["publishedProjectRevisionBeforeResolve"] == success["desiredProjectRevision"] and success["publishedTransactionIdBeforeResolve"] == success["transactionId"], "DR-F16: publication must precede callback resolution")
    require(success["postAcknowledgementMustNotRequireOldBaseRevision"] == success["baseProjectRevision"], "DR-F16: old base must not reject successful commit")
    require(success["expectedOnProjectChangeCalls"] == success["expectedEvidenceSnapshotWrites"] == success["expectedProjectPointerWrites"] == success["expectedUndoCheckpoints"] == 1 and success["expectedCommitResult"] == "committed", "DR-F16: one successful repair transaction")

    stale = steps["base-changes-before-final-project-pointer-write"]
    require(stale["observedRevisionAtFinalBaseRecheck"] != stale["baseProjectRevision"], "DR-F16: stale base fixture must differ")
    require(stale["expectedCallbackOutcome"] == "reject" and stale["expectedProjectPointerWrites"] == stale["expectedPublishedProjectChanges"] == stale["expectedUndoCheckpoints"] == 0 and stale["expectedOnProjectChangeCalls"] == 1, "DR-F16: stale base cannot publish a pointer")

    queued = steps["drain-older-pointer-save-before-serialized-repair-commit"]
    require(queued["expectedPointerWriteOrder"] == [queued["alreadyQueuedPointerRevision"], queued["desiredProjectRevision"]], "DR-F16: stale queued pointer must drain before repair pointer")
    require(queued["expectedProjectPointerWrites"] == len(queued["expectedPointerWriteOrder"]) == 2 and queued["expectedLateStalePointerWrites"] == 0, "DR-F16: pointer queue write accounting")
    require(queued["expectedProjectDefinitionEditConcurrency"] == 1 and queued["expectedFinalPointerRevision"] == queued["desiredProjectRevision"] and queued["expectedOnProjectChangeCalls"] == queued["expectedUndoCheckpoints"] == 1, "DR-F16: serialized commit cannot be overwritten by older pointer")

    drift = steps["source-content-changes-during-final-pointer-write"]
    before = snapshots[drift["sourceSnapshotAtFinalBaseRecheck"]]
    after = snapshots[drift["sourceSnapshotAfterPointerWrite"]]
    require(multiset_signature(before) != multiset_signature(after), "DR-F16: late source drift must be a content change")
    require(drift["expectedPostAcknowledgementComparison"] == {"projectRevision":drift["desiredProjectRevision"],"transactionId":drift["transactionId"]}, "DR-F16: late source drift still acknowledges desired project")
    require(drift["publishedProjectRevisionBeforeResolve"] == drift["desiredProjectRevision"] and drift["publishedTransactionIdBeforeResolve"] == drift["transactionId"], "DR-F16: late source drift publication")
    require(drift["expectedSavedEvidenceSnapshot"] == drift["acceptedEvidenceSnapshot"] == drift["sourceSnapshotAtFinalBaseRecheck"], "DR-F16: saved historical evidence must retain original snapshot")
    require(drift["expectedCurrentResultStatus"] == "unavailable" and drift["expectedCurrentOutputCount"] is None, "DR-F16: late source drift must not expose stale output as current")
    require(drift["expectedHistoricalOriginalOccurrences"] == len(before["rows"]) == 8 and drift["expectedHistoricalOutputCount"] == 4, "DR-F16: late source drift historical counts")
    require(drift["expectedOnProjectChangeCalls"] == drift["expectedProjectPointerWrites"] == drift["expectedUndoCheckpoints"] == 1 and drift["expectedCallbackOutcome"] == "resolve" and drift["expectedCommitResult"] == "committed-historical", "DR-F16: saved historical transaction accounting")
    for vector in [success, stale, queued, drift]:
        require(vector["productionAcceptanceExecuted"] is False, "DR-F16: overclaims production concurrency test")


def main():
    path = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(__file__).with_name("fixtures.json")
    data = json.loads(path.read_text())
    require(data["format"] == "exploreda-duplicate-repair-fixtures" and data["version"] == 1, "Unknown fixture format")
    snapshots = data["snapshots"]
    for name, snapshot in snapshots.items():
        refs = [row["ref"] for row in snapshot["rows"]]
        require(len(set(refs)) == len(refs), f"{name}: duplicate test ref")
        require(len(set(snapshot["fields"])) == len(snapshot["fields"]), f"{name}: duplicate schema field")
        for row in snapshot["rows"]:
            require(set(row["values"]) <= set(snapshot["fields"]), f"{name}: undeclared original field")
            exact(row["values"])
    cases = {case["id"]:case for case in data["cases"]}
    require(len(cases) == len(data["cases"]) == 16, "Expected 16 unique cases")
    for case in data["cases"]:
        kind = case["kind"]
        if kind == "repair":
            check_repair(case, snapshots)
            check_relationships(case, snapshots)
        if case["id"] == "DR-F01":
            check_integrated(case, snapshots)
        if case["id"] == "DR-F08":
            check_text_ordering_contract(case)
        if kind == "refresh":
            check_refresh(case, snapshots, cases)
        if kind == "aggregation":
            check_aggregation(case, snapshots)
        if kind == "persistence":
            check_persistence(case)
        for vector in case.get("keyEqualities", []):
            require((key_atom(vector["left"]) == key_atom(vector["right"])) == vector["equal"], f"{case['id']}: typed equality")
        for vector in case.get("exactEqualityVectors", []):
            require((exact(vector["left"]) == exact(vector["right"])) == vector["equal"], f"{case['id']}: raw exact equality")
        if kind == "dependency-failures":
            require(case["commonExpected"]["status"] == "unavailable" and case["commonExpected"]["dependentLookupOutputCount"] is None, "DR-F10: dependency unavailable boundary")
            require(len(case["fixtures"]) == 9, "DR-F10: dependency vector count")
            check_undeclared_field_vector(case)
        if kind == "interaction":
            require(case["productionInteractionTestsExecuted"] is False, "DR-F16: overclaims UI tests")
            check_chained_origin_vector(case)
            check_async_commit_vectors(case, snapshots)
        suffix = " (acceptance contract only; requires production integration test)" if kind in {"dependency-failures", "interaction"} else ""
        print(f"PASS {case['id']}: {case['title']}{suffix}")
    print(f"PASS: {len(cases)} fixture cases, {len(snapshots)} preserved input snapshots.")
    print("Checked hand-entered evidence membership, values, counts, arithmetic, refresh guards, and standalone scalar codec.")
    print("Not executed: explorEDA evaluator changes, project/text/folder production round trips, workers, browser, or UI acceptance tests.")


if __name__ == "__main__":
    try:
        main()
    except (AssertionError, KeyError, ValueError, StopIteration) as error:
        print(f"FAIL: {error}", file=sys.stderr)
        sys.exit(1)

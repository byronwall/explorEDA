#!/usr/bin/env python3
"""Inspect or verify decimal-fixtures.json with integer/Fraction arithmetic.

This is an original research companion, not explorEDA implementation code.
It uses no decimal package, no external dependencies, and no network access.
Amounts and rounding are derived with fractions.Fraction and integer divmod.
Binary float is used only in the explicitly approximate projection/loss checks.
Local integration agents need not execute this downloaded companion.
"""
from __future__ import annotations

import argparse
from fractions import Fraction
import json
from pathlib import Path
import re
import sys

GRAMMAR = re.compile(r'([+-]?)(?:([0-9]+)(?:\.([0-9]+))?|\.([0-9]+))(?:[eE]([+-]?[0-9]+))?\Z')
MODES = {'halfEven', 'halfAwayFromZero', 'towardZero', 'floor', 'ceiling', 'unnecessary'}
MAX_DIGITS, MAX_SCALE, MAX_INPUT, MAX_EXPONENT = 128, 38, 256, 128

class ContractError(Exception):
    pass

def fail(code):
    raise ContractError(code)

def scale_check(scale):
    if isinstance(scale, bool) or not isinstance(scale, int) or not 0 <= scale <= MAX_SCALE:
        fail('DECIMAL_SCALE_LIMIT')

def checked(value: Fraction, scale: int):
    scale_check(scale)
    scaled = value * 10**scale
    assert scaled.denominator == 1, 'oracle internal error: non-integral coefficient'
    if len(str(abs(scaled.numerator))) > MAX_DIGITS:
        fail('DECIMAL_COEFFICIENT_LIMIT')
    return value, scale

def parse(value):
    if value is None or value == {'special': 'undefined'}:
        return None
    if isinstance(value, (int, float)) and not isinstance(value, bool):
        fail('DECIMAL_TEXT_REQUIRED')
    if isinstance(value, dict) and 'nativeNumber' in value:
        fail('DECIMAL_TEXT_REQUIRED')
    if not isinstance(value, str):
        fail('DECIMAL_INVALID_TEXT')
    if len(value) > MAX_INPUT:
        fail('DECIMAL_INPUT_LIMIT')
    text = value.strip(' \t\r\n')
    if not text:
        return None
    match = GRAMMAR.fullmatch(text)
    if not match:
        fail('DECIMAL_INVALID_TEXT')
    sign, whole, fraction_a, fraction_b, exponent = match.groups()
    fraction = fraction_a if fraction_a is not None else (fraction_b or '')
    whole = whole or '0'
    exp = int(exponent or '0')
    if abs(exp) > MAX_EXPONENT:
        fail('DECIMAL_INPUT_LIMIT')
    coefficient = int(whole + fraction)
    if sign == '-':
        coefficient = -coefficient
    scale = len(fraction) - exp
    if scale < 0:
        coefficient *= 10**(-scale)
        scale = 0
    return checked(Fraction(coefficient, 10**scale), scale)

def require(value):
    result = parse(value)
    if result is None:
        raise AssertionError('oracle helper expected a valid operand')
    return result

def wire(pair):
    value, scale = pair
    coefficient = value * 10**scale
    assert coefficient.denominator == 1
    return {'kind': 'decimal', 'coefficient': str(coefficient.numerator), 'scale': scale}

def text_of(pair):
    value, scale = pair
    coefficient = (value * 10**scale).numerator
    digits = str(abs(coefficient)).zfill(scale + 1)
    body = digits[:-scale] + '.' + digits[-scale:] if scale else digits
    return ('-' if coefficient < 0 else '') + body

def value_output(pair, inexact=None):
    answer = {'status': 'ok', 'value': wire(pair), 'text': text_of(pair)}
    if inexact is not None:
        answer['inexact'] = inexact
    return answer

def minimal_pair(value):
    numerator, denominator = value.numerator, value.denominator
    a = b = 0
    while denominator % 2 == 0:
        denominator //= 2
        a += 1
    while denominator % 5 == 0:
        denominator //= 5
        b += 1
    if denominator != 1:
        fail('DECIMAL_NON_TERMINATING')
    return checked(value, max(a, b))

def rounded_pair(value, scale, mode):
    if scale is None or mode is None or mode not in MODES:
        fail('DECIMAL_POLICY_REQUIRED')
    scale_check(scale)
    sign = -1 if value < 0 else 1
    numerator = abs(value.numerator) * 10**scale
    denominator = value.denominator
    whole, remainder = divmod(numerator, denominator)
    if mode == 'unnecessary' and remainder:
        fail('DECIMAL_INEXACT')
    increment = False
    if mode == 'halfEven':
        increment = 2*remainder > denominator or (2*remainder == denominator and whole % 2 == 1)
    elif mode == 'halfAwayFromZero':
        increment = 2*remainder >= denominator
    elif mode == 'floor':
        increment = sign < 0 and remainder != 0
    elif mode == 'ceiling':
        increment = sign > 0 and remainder != 0
    result = Fraction(sign * (whole + int(increment)), 10**scale)
    return checked(result, scale), remainder != 0

def numeric_key(pair):
    value, _ = pair
    simple = minimal_pair(value)
    item = wire(simple)
    return f"decimal:{item['coefficient']}:{item['scale']}"

def aggregate(case):
    rows = case['rows']
    valid, missing, invalid = [], [], []
    diagnostics = []
    for row in rows:
        try:
            value = parse(row['value'])
        except ContractError as error:
            invalid.append(row['id'])
            diagnostics.append({'rowId': row['id'], 'code': str(error)})
            continue
        if value is None:
            missing.append(row['id'])
            continue
        valid.append((row['id'], value))
    counts = {'rows': len(rows), 'valid': len(valid), 'missing': len(missing), 'invalid': len(invalid)}
    members = {'valid': [r[0] for r in valid], 'missing': missing, 'invalid': invalid}
    status = 'empty' if not rows else 'noValidValues' if not valid else 'partial' if missing or invalid else 'complete'
    result = {'status': status, 'value': None, 'text': None, 'counts': counts, 'members': members, 'diagnostics': diagnostics}
    if not valid:
        return result
    op = case['op']
    values = [pair for _, pair in valid]
    if op in {'sum', 'average'}:
        # Fraction additions do not round or enforce an output bound on each prefix.
        total = sum((pair[0] for pair in values), Fraction(0))
        if op == 'sum':
            output=case.get('output')
            if output is not None:
                # A measure output policy quantizes the wide state before the public bound.
                answer,inexact=rounded_pair(total,output.get('scale'),output.get('rounding'))
                result['inexact']=inexact
            else:
                answer = checked(total, max(pair[1] for pair in values))
        else:
            answer, inexact = rounded_pair(total / len(values), case.get('scale'), case.get('mode'))
            result['inexact'] = inexact
    else:
        extremum = (min if op == 'min' else max)(pair[0] for pair in values)
        answer = checked(extremum, max(pair[1] for pair in values if pair[0] == extremum))
    result['value'], result['text'] = wire(answer), text_of(answer)
    return result

def execute_case(case):
    try:
        op = case['op']
        if op == 'validateWire':
            value=case['input']
            if not isinstance(value,dict) or set(value)!={'kind','coefficient','scale'}:
                fail('DECIMAL_INVALID_WIRE')
            coefficient,scale=value['coefficient'],value['scale']
            if value['kind']!='decimal' or not isinstance(coefficient,str) or not re.fullmatch(r'(?:0|-?[1-9][0-9]*)',coefficient):
                fail('DECIMAL_INVALID_WIRE')
            if len(coefficient.lstrip('-'))>MAX_DIGITS or isinstance(scale,bool) or not isinstance(scale,int) or not 0<=scale<=MAX_SCALE:
                fail('DECIMAL_INVALID_WIRE')
            return value_output((Fraction(int(coefficient),10**scale),scale))
        if op == 'parse':
            parsed = parse(case['input'])
            return {'status': 'missing'} if parsed is None else value_output(parsed)
        if op == 'exactInteger':
            value = case['input']
            if isinstance(value, bool) or not isinstance(value, (int, float)) or value != int(value) or abs(value) > 9007199254740991:
                fail('DECIMAL_UNSAFE_INTEGER')
            result = value_output(checked(Fraction(int(value)), 0))
            result['origin'] = 'currentNumberInteger'
            return result
        if op in {'sum', 'average', 'min', 'max'}:
            return aggregate(case)
        if op == 'repeatSum':
            value, scale = require(case['input'])
            result = value_output(checked(value * case['repeat'], scale))
            result['validCount'] = case['repeat']
            return result
        if op == 'sort':
            ordered = sorted(case['rows'], key=lambda r: (require(r['value'])[0], r['id']))
            return {'status': 'ok', 'orderedIds': [row['id'] for row in ordered]}
        operands = case.get('inputs', [])
        if any(isinstance(x, (int, float)) and not isinstance(x, bool) for x in operands):
            fail('DECIMAL_MIXED_OPERAND')
        values = [parse(x) for x in operands]
        if any(value is None for value in values):
            return {'status': 'missing'}
        if op in {'add', 'subtract', 'multiply', 'divideExact', 'divide'}:
            (a, sa), (b, sb) = values
            if op == 'add':
                return value_output(checked(a+b, max(sa, sb)))
            if op == 'subtract':
                return value_output(checked(a-b, max(sa, sb)))
            if op == 'multiply':
                return value_output(checked(a*b, sa+sb))
            if b == 0:
                fail('DECIMAL_DIVIDE_BY_ZERO')
            if op == 'divideExact':
                return value_output(minimal_pair(a/b))
            pair, inexact = rounded_pair(a/b, case.get('scale'), case.get('mode'))
            return value_output(pair, inexact)
        if op == 'round':
            pair, inexact = rounded_pair(values[0][0], case.get('scale'), case.get('mode'))
            return value_output(pair, inexact)
        if op == 'compare':
            a, b = values[0][0], values[1][0]
            return {'status': 'ok', 'result': int(a > b) - int(a < b)}
        if op == 'numericEqual':
            return {'status': 'ok', 'result': values[0][0] == values[1][0]}
        if op == 'scaleEqual':
            return {'status': 'ok', 'result': values[0] == values[1]}
        if op == 'key':
            return {'status': 'ok', 'result': numeric_key(values[0])}
        raise AssertionError(f'unknown operation: {op}')
    except ContractError as error:
        return {'status': 'error', 'code': str(error)}

def fmt_fraction(value, scale):
    return text_of(checked(value, scale))

def q(value, scale=2, mode='halfEven'):
    return rounded_pair(value, scale, mode)[0]

def verify_ledgers(data):
    case = data['lineVersusTotal']
    rate = Fraction(case['rate'])
    bases = [Fraction(row['base']) for row in case['rows']]
    raw_taxes = [base * rate for base in bases]
    line_taxes = [q(value) for value in raw_taxes]
    total_tax = q(sum(raw_taxes))
    actual = {'rawTaxPerLine': [fmt_fraction(v, 4) for v in raw_taxes], 'lineTaxPerLine': [text_of(v) for v in line_taxes], 'lineTaxTotal': fmt_fraction(sum(v[0] for v in line_taxes), 2), 'totalTax': text_of(total_tax), 'lineInvoiceTotal': fmt_fraction(sum(bases) + sum(v[0] for v in line_taxes), 2), 'totalInvoiceTotal': fmt_fraction(sum(bases) + total_tax[0], 2), 'differenceTotalMinusLines': fmt_fraction(total_tax[0] - sum(v[0] for v in line_taxes), 2)}
    assert actual == case['expected'], ('lineVersusTotal', actual, case['expected'])
    case = data['discountAndTax']
    for scenario in case['scenarios']:
        gross = Fraction(scenario['price']) * Fraction(scenario['quantity'])
        discount_raw = gross * Fraction(scenario['discountRate'])
        discount = q(discount_raw)[0]
        net = gross - discount
        tax_raw = net * Fraction(scenario['taxRate'])
        tax = q(tax_raw)[0]
        actual = {'gross': fmt_fraction(gross, 2), 'discountUnrounded': fmt_fraction(discount_raw, 4), 'discount': fmt_fraction(discount, 2), 'taxable': fmt_fraction(net, 2), 'taxUnrounded': fmt_fraction(tax_raw, 4), 'tax': fmt_fraction(tax, 2), 'total': fmt_fraction(net + tax, 2)}
        assert actual == scenario['expected'], (scenario['id'], actual, scenario['expected'])
    case = data['taxOrder']
    gross, discount, rate = map(Fraction, (case['gross'], case['fixedDiscount'], case['rate']))
    actual = {'discountBeforeTax': fmt_fraction(gross-discount+q((gross-discount)*rate)[0],2), 'taxBeforeDiscount': fmt_fraction(gross+q(gross*rate)[0]-discount,2)}
    assert actual == case['expected'], ('taxOrder',actual,case['expected'])
    for extra in data.get('additionalTaxOrderCases', []):
        gross, discount, rate = map(Fraction, (extra['gross'], extra['fixedDiscount'], extra['rate']))
        actual = {'discountBeforeTax': fmt_fraction(gross-discount+q((gross-discount)*rate)[0],2), 'taxBeforeDiscount': fmt_fraction(gross+q(gross*rate)[0]-discount,2)}
        assert actual == extra['expected'], (extra['id'],actual,extra['expected'])
    case = data['discountRoundingPlacement']
    gross, rate = Fraction(case['gross']), Fraction(case['discountRate'])
    actual = {'roundDiscountThenSubtract':fmt_fraction(gross-q(gross*rate)[0],2), 'subtractExactDiscountThenRoundNet':text_of(q(gross-gross*rate))}
    assert actual == case['expected'], ('discountRoundingPlacement',actual,case['expected'])

def verify_paired_reconciliation(case):
    rows=case['rows']
    left=sum((Fraction(row['computed']) for row in rows),Fraction(0))
    right=sum((Fraction(row['posted']) for row in rows),Fraction(0))
    residuals={row['id']:Fraction(row['computed'])-Fraction(row['posted']) for row in rows}
    nonzero=[row['id'] for row in rows if residuals[row['id']]!=0]
    actual={'sourceIds':[row['id'] for row in rows],'rowResiduals':{key:fmt_fraction(value,2) for key,value in residuals.items()},'leftTotal':fmt_fraction(left,2),'rightTotal':fmt_fraction(right,2),'totalDelta':fmt_fraction(left-right,2),'complete':True,'samePopulation':True,'nonzeroResidualCount':len(nonzero),'nonzeroResidualIds':nonzero,'totalsStatus':'matched' if left==right else 'different','linesStatus':'matched' if not nonzero else 'different','totalsLabel':'Totals match' if left==right else 'Totals differ','linesLabel':'Lines match' if not nonzero else 'Lines differ','eligibleTotalsPass':left==right,'eligibleLinesPass':not nonzero}
    assert actual==case['expected'], ('pairedReconciliation',actual,case['expected'])

def verify_population(case):
    rows=case['rows']
    rounded_rows={}
    for row in rows:
        try:
            parsed=parse(row['amount'])
            rounded_rows[row['id']]=None if parsed is None else text_of(q(parsed[0]))
        except ContractError:
            rounded_rows[row['id']]=None
    assert rounded_rows==case['rowAmountsAfterRounding'], ('rowAmountsAfterRounding',rounded_rows)
    valid=[]
    for row in rows:
        try:
            value=parse(row['amount'])
        except ContractError:
            continue
        if value is not None:
            valid.append((row,value))
    raw_sum=sum((pair[0] for _,pair in valid),Fraction(0))
    group_sums={key:sum((pair[0] for row,pair in valid if row['group']==key),Fraction(0)) for key in ['A','B','C']}
    actual={'rawSum':fmt_fraction(raw_sum,3),'sumRoundedLines':fmt_fraction(sum(q(pair[0])[0] for _,pair in valid),2),'roundedGrandTotal':text_of(q(raw_sum)), 'sumRoundedGroupSubtotals':fmt_fraction(sum(q(v)[0] for v in group_sums.values()),2), 'averageScale6':text_of(q(raw_sum/len(valid),6)), 'groupRawSums':{k:fmt_fraction(v,3) for k,v in group_sums.items()},'groupRoundedSubtotals':{k:text_of(q(v)) for k,v in group_sums.items()}}
    assert actual==case['expected'], ('population',actual,case['expected'])
    for view in case['views']:
        group=view.get('group')
        threshold=Fraction(view['minimum']) if 'minimum' in view else None
        chosen=[]
        missing=[]
        invalid=[]
        filtered=[]
        for row in rows:
            if group and row['group']!=group:
                filtered.append(row['id']); continue
            try:
                value=parse(row['amount'])
            except ContractError:
                if threshold is not None or view.get('validOnly'):
                    filtered.append(row['id'])
                else:
                    invalid.append(row['id'])
                continue
            if value is None:
                if threshold is not None or view.get('validOnly'):
                    filtered.append(row['id'])
                else:
                    missing.append(row['id'])
                continue
            if threshold is not None and value[0]<threshold:
                filtered.append(row['id']); continue
            chosen.append((row['id'],value))
        total=sum((v[0] for _,v in chosen),Fraction(0))
        actual={'sourceCount':len(rows),'matchedCount':len(chosen)+len(missing)+len(invalid),'validCount':len(chosen),'missingCount':len(missing),'invalidCount':len(invalid),'validIds':[i for i,_ in chosen],'missingIds':missing,'invalidIds':invalid,'filteredOutIds':filtered,'rawSum':fmt_fraction(total,3),'sumRoundedLines':fmt_fraction(sum(q(v[0])[0] for _,v in chosen),2),'roundedTotal':text_of(q(total)), 'deltaTotalToReference':fmt_fraction(q(total)[0]-Fraction(view['reference']),2),'deltaLinesToReference':fmt_fraction(sum(q(v[0])[0] for _,v in chosen)-Fraction(view['reference']),2),'eligibleToPass':not missing and not invalid}
        assert actual==view['expected'], (view['id'],actual,view['expected'])

def typed_key(value):
    if isinstance(value,bool): return 'boolean:'+str(value).lower()
    if isinstance(value,(int,float)): return 'number:'+str(value)
    return 'string:'+value

def verify_entities(case):
    groups={};missing_ids=[]
    for row in case['rows']:
        if row['entityId'] is None:
            missing_ids.append(row['id']);continue
        groups.setdefault(typed_key(row['entityId']),[]).append(row)
    actual_groups=[]; selected=[]
    for key,rows in groups.items():
        valid=[]; missing=[]; invalid=[]
        for row in rows:
            try: value=parse(row['amount'])
            except ContractError: invalid.append(row['id']);continue
            if value is None: missing.append(row['id']);continue
            valid.append((row['id'],value))
        ids=[row['id'] for row in rows]
        status='eligible'
        if valid and len({v[0] for _,v in valid})>1: status='conflict'
        elif valid and (missing or invalid): status='inconsistentAvailability'
        elif not valid and invalid: status='invalid'
        elif not valid: status='missing'
        item={'entityKey':key,'status':status,'sourceIds':ids,'representativeId':None,'value':None,'text':None}
        if status=='eligible':
            pair=(valid[0][1][0],max(v[1] for _,v in valid))
            selected.append(pair)
            item.update(representativeId=min(i for i,_ in valid),value=wire(pair),text=text_of(pair))
        elif status=='conflict': item['code']='DECIMAL_ENTITY_CONFLICT'
        actual_groups.append(item)
    total=sum((v[0] for v in selected),Fraction(0))
    actual={'status':'unavailable','value':None,'sourceCount':len(case['rows']),'keyedEntityCount':len(groups),'eligibleEntityCount':len(selected),'eligibleOccurrenceCount':sum(len(g['sourceIds']) for g in actual_groups if g['status']=='eligible'),'missingEntityIds':missing_ids,'diagnosticPartialSum':fmt_fraction(total,max(v[1] for v in selected)),'diagnosticPartialAverage':text_of(q(total/len(selected),2)),'groups':actual_groups,'eligibleToPass':False}
    assert actual==case['expected'],('entity',actual,case['expected'])

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('fixtures',nargs='?',type=Path,default=Path(__file__).with_name('decimal-fixtures.json'))
    parser.add_argument('--verbose',action='store_true')
    args=parser.parse_args()
    data=json.loads(args.fixtures.read_text())
    print(f"[fixtures] Reading {args.fixtures.name}")
    assert data['caseCount']==len(data['cases'])
    assert len({case['id'] for case in data['cases']})==len(data['cases']), 'duplicate case IDs'
    assert data['contract']['limits']=={'coefficientDigits':128,'scale':38,'rawInputCharacters':256,'absoluteExponent':128,'internalAggregateCoefficientDigits':256}
    failures=[]
    for case in data['cases']:
        actual=execute_case(case)
        if actual!=case['expected']:
            failures.append(case['id'])
            print(f"[FAIL] {case['id']} expected={case['expected']!r} actual={actual!r}")
        elif args.verbose:
            print(f"[PASS] {case['id']}")
    assert not failures, f'{len(failures)} primitive/aggregate fixture(s) failed: {failures}'
    print(f"[fixtures] {len(data['cases'])} primitive/aggregate cases passed")
    verify_ledgers(data['ledgers'])
    verify_population(data['population'])
    verify_paired_reconciliation(data['pairedReconciliation'])
    verify_entities(data['entityReconciliation'])
    for item in data['projectionCases']:
        exact=[row['id'] for row in item['rows'] if Fraction(row['amount'])>=Fraction(item['exactLowerBound'])]
        coordinates=[float(row['amount']) for row in item['rows']]
        assert exact==item['expected']['exactMemberIds']
        assert (coordinates[0]==coordinates[1])==item['expected']['coordinatesCoincide']
    for item in data['sourceReaderLoss']:
        assert float(item['sourceText'])==item['observedNumber']
        assert execute_case({'op':'parse','input':item['observedNumber']})==item['expected']
    for item in data['regrouping']:
        total=sum((Fraction(v) for group in item['groups'] for v in group),Fraction(0))
        count=sum(len(group) for group in item['groups'])
        mean_of_means=sum((sum(map(Fraction,group))/len(group) for group in item['groups']),Fraction(0))/len(item['groups'])
        assert text_of(q(total/count,6))==item['expected']['pooledAverage']
        assert text_of(q(mean_of_means,6))==item['expected']['unweightedMeanOfGroupAverages']
        extra=item.get('additionalExpected',{})
        means=[sum(map(Fraction,group))/len(group) for group in item['groups']]
        if 'groupMeansRoundedTo2' in extra:
            rounded=[q(mean,2) for mean in means]
            assert [text_of(v) for v in rounded]==extra['groupMeansRoundedTo2']
            weighted=sum(v[0]*len(group) for v,group in zip(rounded,item['groups']))/count
            assert text_of(q(weighted,6))==extra['weightedAverageOfRoundedGroupMeansScale6']
        if 'pooledAverageScale2' in extra:
            assert text_of(q(total/count,2))==extra['pooledAverageScale2']
        if 'groupAverages' in extra:
            assert [text_of(minimal_pair(mean)) for mean in means]==extra['groupAverages']
    print('[fixtures] Ledger, paired reconciliation, population, entity, projection, source-loss, and regrouping cases passed')
    print('[fixtures] PASS. Exact arithmetic used integers/Fraction; no decimal library was used.')

if __name__=='__main__':
    main()

#!/usr/bin/env python3
"""Recount source-transcribed catalogue data. This does not run explorEDA."""
from pathlib import Path
import json

def main() -> None:
    base = Path(__file__).resolve().parent
    features = json.loads((base / 'coverage-features.json').read_text())
    examples = json.loads((base / 'coverage-examples.json').read_text())
    expected = json.loads((base / 'coverage-summary.json').read_text())
    ids = [f['feature_id'] for f in features]
    assert len(ids) == len(set(ids)), 'Duplicate feature IDs'
    assert len(examples) == len({e['example_id'] for e in examples}), 'Duplicate examples'
    for example in examples:
        assert set(example['features']) <= set(ids), 'Unknown feature assignment'
        assert set(example['features'].values()) <= {'shown','reviewed'}, 'Unknown status'
    used = {x for e in examples for x in e['features']}
    reviewed = {x for e in examples for x,v in e['features'].items() if v == 'reviewed'}
    actual = {
        'features': len(features), 'examples': len(examples),
        'declared_supported': sum(f['declared_implementation']=='supported' for f in features),
        'features_with_declared_examples': len(used),
        'features_with_historical_review': len(reviewed),
        'needs_attention_by_current_ui_predicate': sum(f['declared_implementation']!='supported' or f['feature_id'] not in used or f['feature_id'] not in reviewed or f['explicit_gap_strings']>0 for f in features),
        'explicit_gap_strings': sum(f['explicit_gap_strings'] for f in features),
        'declared_feature_example_pairs': sum(len(e['features']) for e in examples),
        'historically_reviewed_pairs': sum(v=='reviewed' for e in examples for v in e['features'].values()),
        'examples_with_review_record': sum(bool(e['review_date']) for e in examples),
    }
    for k,v in actual.items():
        assert expected[k] == v, f'{k}: expected {expected[k]}, recounted {v}'
    print(json.dumps(actual,indent=2))
    print('Catalogue recount matches. No application/browser test was run.')

if __name__ == '__main__':
    main()

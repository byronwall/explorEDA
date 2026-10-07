# Audit fixtures

These are new synthetic fixtures, not repository test results. Import the JSON where exact types matter; CSV cannot reliably preserve number 1 versus string "1". Nonfinite host values require a JavaScript host fixture, not ordinary JSON.

The six-row analytical fixture has four eligible numeric values: 10, 20, 0, -5. Their sum is 25 and average 6.25. Region A has 3 source rows, 2 numeric contributors, sum 30, average 15; region B has 3 source rows, 2 contributors, sum -5, average -2.5. The offset timestamp in r1 is February 1 in UTC. These are mathematical expected results, not observed application behavior.

Negative-value tests for stacks and Sankey must expect their explicit exclusion/rejection policy, not apply the generic signed sum unquestioningly. Use a positive-only variant when verifying valid percentage stacks. Match application positional IDs to the stable key column before comparing results.

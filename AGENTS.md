# Benchamel agent guide

Benchamel compares agent configurations against versioned benchmark cases.

## Structure

- `harness/`: shared environment preparation, execution, capture, judging, and reporting code.
- `cases/<case-id>/`: one scenario, its fixture, judge, configurations, runs, and aggregate results.
- `results.json` and `results.md`: benchmark aggregates, derived from case results.

Reference: https://github.com/feuersteiner/agentests/issues/115

# benchamel

Benchamel is a harness for testing harnesses.

Each eval has a base: a runnable simulated company system. Every runner gets its own fresh temporary copy of the base, applies its tooling through preflight commands, then runs the shared agent command and starter prompt. Runs execute one at a time or in parallel; each is judged against manually authored checks, measured for time and cost, and aggregated into a report.

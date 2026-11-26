# Dummy eval scoring

- Score 100 when `answer.txt` contains exactly `hello, world` followed by a newline.
- Score 0 otherwise.

Check from the final workspace with `printf 'hello, world\n' | cmp - answer.txt`.
The known-good solution is produced by `printf 'hello, world\n' > answer.txt`.
`judge.ts` applies this rule automatically to the final workspace.

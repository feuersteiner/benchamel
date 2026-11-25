import { join } from "node:path";

export async function judge(workspace: string): Promise<number> {
  const answer = Bun.file(join(workspace, "answer.txt"));
  return await answer.exists() && await answer.text() === "hello, world\n" ? 100 : 0;
}

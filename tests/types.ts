import { History } from "@hickory/root";

export interface TestCaseArgs {
  history: History;
}

export interface TestCase {
  msg: string;
  fn: (args: TestCaseArgs) => void;
}

export type Suite = Array<TestCase>;

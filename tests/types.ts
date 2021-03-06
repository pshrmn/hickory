import { HistoryConstructor, HistoryOptions } from "@hickory/root";

export interface TestCaseArgs {
  constructor: HistoryConstructor;
  options?: HistoryOptions;
}

export interface AsyncTestCaseArgs extends TestCaseArgs {
  resolve: () => void;
}

export interface TestCase {
  msg: string;
  fn: (args: TestCaseArgs | AsyncTestCaseArgs) => void;
  async?: boolean;
  assertions?: number;
}

export type Suite = Array<TestCase>;

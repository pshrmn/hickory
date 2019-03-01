import { History } from "@hickory/root";

export interface TestCaseArgs {
  history: History;
  pathname: () => string;
}

export interface AsyncTestCaseArgs extends TestCaseArgs {
  resolve: () => void;
}

export interface TestCase {
  msg: string;
  fn: (args: TestCaseArgs | AsyncTestCaseArgs) => void;
  async?: boolean;
}

export type Suite = Array<TestCase>;

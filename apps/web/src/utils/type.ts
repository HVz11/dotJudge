export interface TestcaseType {
  input: string;
  output: string;
  sample: boolean;
  explanation?: string;
}

export interface PropblemDetailType {
  slug: string;
  input: string;
  title: string;
  output: string;
  constraints: string;
  statement: string;
  desc: string;
}

export interface ProblemType extends PropblemDetailType {
  testcase?: TestcaseType[];
  updatedAt: string;
  createdAt: string;
  _id: string;
}

import {
  expect,
  matchTemplate,
  MatchStyle,
  haveResource,
  SynthUtils,
} from "@aws-cdk/assert";

import * as cdk from "@aws-cdk/core";
import * as New from "../lib/new-stack";

const app = new cdk.App();
const stack = new New.NewStack(app, "MyTestStack");

test("dynamodb todosTable exist", () => {
  expect(stack).to(
    haveResource("AWS::DynamoDB::Table", {
      TableName: "todosTable",
    })
  );
});
test("Api main lambda exist with following configration", () => {
  expect(stack).to(
    haveResource("AWS::Lambda::Function", {
      FunctionName: "todoFn",
      MemorySize: 1024,
      Handler: "main.handler",
    })
  );
});

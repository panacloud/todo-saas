import * as cdk from "aws-cdk-lib";
import {
  countResources,
  haveResource,
  expect,
  countResourcesLike,
} from "@aws-cdk/assert";
import * as TodoSaas from "../lib/todo_saas-stack";

test("Dynamodb Constructs Test", () => {
  const app = new cdk.App();
  const stack = new TodoSaas.TodoSaasStack(app, "MyTestStack");
  const actual = app.synth().getStackArtifact(stack.artifactId).template;

  expect(actual).to(
    countResourcesLike("AWS::DynamoDB::Table", 1, {
      KeySchema: [
        {
          AttributeName: "id",
          KeyType: "HASH",
        },
      ],
      AttributeDefinitions: [
        {
          AttributeName: "id",
          AttributeType: "S",
        },
      ],
      BillingMode: "PAY_PER_REQUEST",
      TableName: "todoApi",
    })
  );
});

import * as cdk from "aws-cdk-lib";
import {
  countResources,
  haveResource,
  expect,
  countResourcesLike,
} from "@aws-cdk/assert";
import * as TodoSaas from "../lib/todo_saas-stack";
import { DynamodbConstruct } from "../lib/DynamodbConstruct";

test("Lambda Attach With Dynamodb Constructs Test", () => {
  const app = new cdk.App();
  const stack = new TodoSaas.TodoSaasStack(app, "MyTestStack");
  const actual = app.synth().getStackArtifact(stack.artifactId).template;

  const dbConstruct = stack.node.children.filter((elem) => {
    return elem instanceof DynamodbConstruct;
  });

  const db_table = dbConstruct[0].node.children.filter((elem) => {
    return elem instanceof cdk.aws_dynamodb.Table;
  });

  expect(actual).to(
    haveResource("AWS::Lambda::Function", {
      FunctionName: "todoApiLambda",
      Handler: "main.handler",
      Runtime: "nodejs12.x",
      Environment: {
        Variables: {
          TableName: {
            Ref: stack.getLogicalId(
              db_table[0].node.defaultChild as cdk.CfnElement
            ),
          },
        },
      },
    })
  );

  expect(actual).to(
    haveResource("AWS::IAM::Role", {
      AssumeRolePolicyDocument: {
        Statement: [
          {
            Action: "sts:AssumeRole",
            Effect: "Allow",
            Principal: {
              Service: "lambda.amazonaws.com",
            },
          },
        ],
        Version: "2012-10-17",
      },
    })
  );

  expect(actual).to(
    countResourcesLike("AWS::IAM::Policy", 1, {
      PolicyDocument: {
        Statement: [
          {
            Action: "dynamodb:*",
            Effect: "Allow",
            Resource: [
              {
                "Fn::GetAtt": [
                  stack.getLogicalId(
                    db_table[0].node.defaultChild as cdk.CfnElement
                  ),
                  "Arn",
                ],
              },
              {
                Ref: "AWS::NoValue",
              },
            ],
          },
        ],
        Version: "2012-10-17",
      },
    })
  );
});

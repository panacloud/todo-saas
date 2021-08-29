import * as cdk from "aws-cdk-lib";
import {
  countResources,
  haveResource,
  expect,
  countResourcesLike,
} from "@aws-cdk/assert";
import * as TodoSaas from "../lib/todo_saas-stack";
import { AppsyncConstruct } from "../lib/AppsyncConstruct";
import { LambdaConstruct } from "../lib/LambdaConstruct";
test("Appsync Api Constructs Test", () => {
  const app = new cdk.App();
  const stack = new TodoSaas.TodoSaasStack(app, "MyTestStack");
  const actual = app.synth().getStackArtifact(stack.artifactId).template;

  const Appsync_consturct = stack.node.children.filter(
    (elem) => elem instanceof AppsyncConstruct
  );

  const appsync_api = Appsync_consturct[0].node.children.filter(
    (elem) => elem instanceof cdk.aws_appsync.CfnGraphQLApi
  );

  expect(actual).to(
    countResourcesLike("AWS::AppSync::GraphQLApi", 1, {
      AuthenticationType: "API_KEY",
      Name: "todoApi",
    })
  );

  expect(actual).to(
    countResourcesLike("AWS::AppSync::GraphQLSchema", 1, {
      ApiId: {
        "Fn::GetAtt": [
          stack.getLogicalId(appsync_api[0] as cdk.CfnElement),
          "ApiId",
        ],
      },
    })
  );

  expect(actual).to(
    haveResource("AWS::AppSync::ApiKey", {
      ApiId: {
        "Fn::GetAtt": [
          stack.getLogicalId(appsync_api[0] as cdk.CfnElement),
          "ApiId",
        ],
      },
    })
  );

  const role = Appsync_consturct[0].node.children.filter((elem) => {
    return elem instanceof cdk.aws_iam.Role;
  });

  expect(actual).to(
    haveResource("AWS::IAM::Role", {
      AssumeRolePolicyDocument: {
        Statement: [
          {
            Action: "sts:AssumeRole",
            Effect: "Allow",
            Principal: {
              Service: "appsync.amazonaws.com",
            },
          },
        ],
        Version: "2012-10-17",
      },
    })
  );

  expect(actual).to(
    haveResource("AWS::IAM::Policy", {
      PolicyDocument: {
        Statement: [
          {
            Action: "lambda:InvokeFunction",
            Effect: "Allow",
            Resource: "*",
          },
        ],
        Version: "2012-10-17",
      },
      Roles: [
        {
          Ref: stack.getLogicalId(role[0].node.defaultChild as cdk.CfnElement),
        },
      ],
    })
  );

  const Lambda_consturct = stack.node.children.filter(
    (elem) => elem instanceof LambdaConstruct
  );

  const lambda_func = Lambda_consturct[0].node.children.filter(
    (elem) => elem instanceof cdk.aws_lambda.Function
  );

  expect(actual).to(
    countResourcesLike("AWS::AppSync::DataSource", 1, {
      ApiId: {
        "Fn::GetAtt": [
          stack.getLogicalId(appsync_api[0] as cdk.CfnElement),
          "ApiId",
        ],
      },
      Name: "todoApi_dataSource",
      Type: "AWS_LAMBDA",
      LambdaConfig: {
        LambdaFunctionArn: {
          "Fn::GetAtt": [
            stack.getLogicalId(
              lambda_func[0].node.defaultChild as cdk.CfnElement
            ),
            "Arn",
          ],
        },
      },
      ServiceRoleArn: {
        "Fn::GetAtt": [
          stack.getLogicalId(role[0].node.defaultChild as cdk.CfnElement),
          "Arn",
        ],
      },
    })
  );

  expect(actual).to(
    countResourcesLike("AWS::AppSync::Resolver", 1, {
      ApiId: {
        "Fn::GetAtt": [
          stack.getLogicalId(appsync_api[0] as cdk.CfnElement),
          "ApiId",
        ],
      },
      FieldName: "listTodos",
      TypeName: "Query",
      DataSourceName: "todoApi_dataSource",
    })
  );

  expect(actual).to(
    countResourcesLike("AWS::AppSync::Resolver", 1, {
      ApiId: {
        "Fn::GetAtt": [
          stack.getLogicalId(appsync_api[0] as cdk.CfnElement),
          "ApiId",
        ],
      },
      FieldName: "createTodo",
      TypeName: "Mutation",
      DataSourceName: "todoApi_dataSource",
    })
  );

  expect(actual).to(
    countResourcesLike("AWS::AppSync::Resolver", 1, {
      ApiId: {
        "Fn::GetAtt": [
          stack.getLogicalId(appsync_api[0] as cdk.CfnElement),
          "ApiId",
        ],
      },
      FieldName: "deleteTodo",
      TypeName: "Mutation",
      DataSourceName: "todoApi_dataSource",
    })
  );

  expect(actual).to(
    countResourcesLike("AWS::AppSync::Resolver", 1, {
      ApiId: {
        "Fn::GetAtt": [
          stack.getLogicalId(appsync_api[0] as cdk.CfnElement),
          "ApiId",
        ],
      },
      FieldName: "updateTodo",
      TypeName: "Mutation",
      DataSourceName: "todoApi_dataSource",
    })
  );
});

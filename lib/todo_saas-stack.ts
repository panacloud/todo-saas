import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { AppsyncConstruct } from "./AppsyncConstruct";
import { DynamoDBConstruct } from "./DynamoDBConstruct";
import { AspectController } from "../editable_src/aspects/AspectController";
import { aws_lambda as lambda } from "aws-cdk-lib";

interface EnvProps {
  prod?: string;
}

export class TodoSaasStack extends Stack {
  constructor(scope: Construct, id: string, props?: EnvProps) {
    super(scope, id);

    const todoApi_table: DynamoDBConstruct = new DynamoDBConstruct(
      this,
      "todoApiDynamoDBConstruct",
      { prod: props?.prod }
    );
    const todoApi_lambdaLayer: lambda.LayerVersion = new lambda.LayerVersion(
      this,
      "todoApiLambdaLayer",
      {
        code: lambda.Code.fromAsset("editable_src/lambdaLayer"),
      }
    );
    const todoApi_mock_lambdaLayer: lambda.LayerVersion =
      new lambda.LayerVersion(this, "todoApiMockLambdaLayer", {
        code: lambda.Code.fromAsset("mock_lambda_layer"),
      });
    const todoApi_lambdaFn_getTodos: lambda.Function = new lambda.Function(
      this,
      "todoApiLambdagetTodos",
      {
        functionName: props?.prod
          ? props?.prod + "-todoApiLambdagetTodos"
          : "todoApiLambdagetTodos",
        runtime: lambda.Runtime.NODEJS_12_X,
        handler: "index.handler",
        code: lambda.Code.fromAsset("mock_lambda/getTodos"),
        layers: [todoApi_mock_lambdaLayer],

        environment: { TableName: todoApi_table.table.tableName },
      }
    );
    const todoApi_lambdaFn_addTodo: lambda.Function = new lambda.Function(
      this,
      "todoApiLambdaaddTodo",
      {
        functionName: props?.prod
          ? props?.prod + "-todoApiLambdaaddTodo"
          : "todoApiLambdaaddTodo",
        runtime: lambda.Runtime.NODEJS_12_X,
        handler: "index.handler",
        code: lambda.Code.fromAsset("mock_lambda/addTodo"),
        layers: [todoApi_mock_lambdaLayer],

        environment: { TableName: todoApi_table.table.tableName },
      }
    );
    const todoApi_lambdaFn_deleteTodo: lambda.Function = new lambda.Function(
      this,
      "todoApiLambdadeleteTodo",
      {
        functionName: props?.prod
          ? props?.prod + "-todoApiLambdadeleteTodo"
          : "todoApiLambdadeleteTodo",
        runtime: lambda.Runtime.NODEJS_12_X,
        handler: "index.handler",
        code: lambda.Code.fromAsset("mock_lambda/deleteTodo"),
        layers: [todoApi_mock_lambdaLayer],

        environment: { TableName: todoApi_table.table.tableName },
      }
    );
    todoApi_table.table.grantFullAccess(todoApi_lambdaFn_getTodos);
    todoApi_table.table.grantFullAccess(todoApi_lambdaFn_addTodo);
    todoApi_table.table.grantFullAccess(todoApi_lambdaFn_deleteTodo);

    const todoApi: AppsyncConstruct = new AppsyncConstruct(
      this,
      "todoApiAppsyncConstruct",
      {
        todoApi_lambdaFn_getTodosArn: todoApi_lambdaFn_getTodos.functionArn,
        todoApi_lambdaFn_addTodoArn: todoApi_lambdaFn_addTodo.functionArn,
        todoApi_lambdaFn_deleteTodoArn: todoApi_lambdaFn_deleteTodo.functionArn,
        prod: props?.prod,
      }
    );
    new AspectController(this, props?.prod);
  }
}

import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { AppsyncConstruct } from "./AppsyncConstruct";
import { DynamoDBConstruct } from "./DynamoDBConstruct";
import { AspectController } from "../editable_src/aspects/AspectController";
import { aws_lambda as lambda, Duration } from "aws-cdk-lib";

interface EnvProps {
  prod?: string;
}

export class TodoSaasStack extends Stack {
  constructor(scope: Construct, id: string, props?: EnvProps) {
    super(scope, id);

    const myApi_table: DynamoDBConstruct = new DynamoDBConstruct(
      this,
      "myApiDynamoDBConstruct",
      { prod: props?.prod }
    );
    const myApi_lambdaLayer: lambda.LayerVersion = new lambda.LayerVersion(
      this,
      "myApiLambdaLayer",
      {
        code: lambda.Code.fromAsset("editable_src/lambdaLayer"),
      }
    );
    const myApi_mock_lambdaLayer: lambda.LayerVersion = new lambda.LayerVersion(
      this,
      "myApiMockLambdaLayer",
      {
        code: lambda.Code.fromAsset("mock_lambda_layer"),
      }
    );
    const myApi_lambdaFn_getTodos: lambda.Function = new lambda.Function(
      this,
      "myApiLambdagetTodos",
      {
        functionName: props?.prod
          ? props?.prod + "-myApiLambdagetTodos"
          : "myApiLambdagetTodos",
        runtime: lambda.Runtime.NODEJS_12_X,
        handler: "index.handler",
        memorySize: 128,
        timeout: Duration.seconds(6),
        code: lambda.Code.fromAsset("mock_lambda/getTodos"),
        layers: [myApi_mock_lambdaLayer],

        environment: { TableName: myApi_table.table.tableName },
      }
    );
    const myApi_lambdaFn_addTodo: lambda.Function = new lambda.Function(
      this,
      "myApiLambdaaddTodo",
      {
        functionName: props?.prod
          ? props?.prod + "-myApiLambdaaddTodo"
          : "myApiLambdaaddTodo",
        runtime: lambda.Runtime.NODEJS_12_X,
        handler: "index.handler",
        memorySize: 128,
        timeout: Duration.seconds(6),
        code: lambda.Code.fromAsset("mock_lambda/addTodo"),
        layers: [myApi_mock_lambdaLayer],

        environment: { TableName: myApi_table.table.tableName },
      }
    );
    const myApi_lambdaFn_deleteTodo: lambda.Function = new lambda.Function(
      this,
      "myApiLambdadeleteTodo",
      {
        functionName: props?.prod
          ? props?.prod + "-myApiLambdadeleteTodo"
          : "myApiLambdadeleteTodo",
        runtime: lambda.Runtime.NODEJS_12_X,
        handler: "index.handler",
        memorySize: 128,
        timeout: Duration.seconds(6),
        code: lambda.Code.fromAsset("mock_lambda/deleteTodo"),
        layers: [myApi_mock_lambdaLayer],

        environment: { TableName: myApi_table.table.tableName },
      }
    );
    myApi_table.table.grantFullAccess(myApi_lambdaFn_getTodos);
    myApi_table.table.grantFullAccess(myApi_lambdaFn_addTodo);
    myApi_table.table.grantFullAccess(myApi_lambdaFn_deleteTodo);

    const myApi: AppsyncConstruct = new AppsyncConstruct(
      this,
      "myApiAppsyncConstruct",
      {
        myApi_lambdaFn_getTodosArn: myApi_lambdaFn_getTodos.functionArn,
        myApi_lambdaFn_addTodoArn: myApi_lambdaFn_addTodo.functionArn,
        myApi_lambdaFn_deleteTodoArn: myApi_lambdaFn_deleteTodo.functionArn,
        prod: props?.prod,
      }
    );
    new AspectController(this, props?.prod);
  }
}

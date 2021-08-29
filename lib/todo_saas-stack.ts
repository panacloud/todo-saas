import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { PanacloudManager } from "panacloud-manager";
import { AppsyncConstruct } from "./AppsyncConstruct";
import { LambdaConstruct } from "./LambdaConstruct";
import { DynamodbConstruct } from "./DynamodbConstruct";

export class TodoSaasStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const apiManager: PanacloudManager = new PanacloudManager(
      this,
      "todo_saasAPIManager"
    );
    const todoApi_table: DynamodbConstruct = new DynamodbConstruct(
      this,
      "todoApiDynamodbConstruct"
    );
    const todoApiLambda: LambdaConstruct = new LambdaConstruct(
      this,
      "todoApiLambdaConstruct",
      {
        tableName: todoApi_table.table.tableName,
      }
    );
    todoApi_table.table.grantFullAccess(todoApiLambda.todoApi_lambdaFn);

    const todoApi: AppsyncConstruct = new AppsyncConstruct(
      this,
      "todoApiAppsyncConstruct",
      {
        todoApi_lambdaFnArn: todoApiLambda.todoApi_lambdaFn.functionArn,
      }
    );
  }
}

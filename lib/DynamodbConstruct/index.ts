import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { aws_dynamodb as dynamodb } from "aws-cdk-lib";

export class DynamodbConstruct extends Construct {
  public readonly table: dynamodb.Table;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id);

    const todoApi_table: dynamodb.Table = new dynamodb.Table(
      this,
      "todoApiTable",
      {
        tableName: "todoApi",
        billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
        partitionKey: {
          name: "id",
          type: dynamodb.AttributeType.STRING,
        },
      }
    );
    this.table = todoApi_table;
  }
}

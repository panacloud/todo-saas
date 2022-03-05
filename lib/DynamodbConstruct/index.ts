import { aws_dynamodb as dynamodb } from "aws-cdk-lib";
import { Construct } from "constructs";
interface DynamoDBProps {
  prod?: string;
}

export class DynamoDBConstruct extends Construct {
  public table: dynamodb.Table;

  constructor(scope: Construct, id: string, props?: DynamoDBProps) {
    super(scope, id);

    const myApi_table: dynamodb.Table = new dynamodb.Table(this, "myApiTable", {
      tableName: props?.prod ? props?.prod + "_myApi" : "myApi",
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      partitionKey: {
        name: "id",
        type: dynamodb.AttributeType.STRING,
      },
    });
    this.table = myApi_table;
  }
}

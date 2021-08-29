import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { aws_ec2 as ec2 } from "aws-cdk-lib";
import { aws_lambda as lambda } from "aws-cdk-lib";
import { aws_iam as iam } from "aws-cdk-lib";

interface handlerProps {
  tableName: string;
}

export class LambdaConstruct extends Construct {
  public todoApi_lambdaFn: lambda.Function;

  constructor(scope: Construct, id: string, props?: handlerProps) {
    super(scope, id);

    const todoApi_lambdaLayer: lambda.LayerVersion = new lambda.LayerVersion(
      this,
      "todoApiLambdaLayer",
      {
        code: lambda.Code.fromAsset("lambdaLayer"),
      }
    );
    const todoApi_lambdaFn: lambda.Function = new lambda.Function(
      this,
      "todoApiLambda",
      {
        functionName: "todoApiLambda",
        runtime: lambda.Runtime.NODEJS_12_X,
        handler: "main.handler",
        code: lambda.Code.fromAsset("lambda-fns"),
        layers: [todoApi_lambdaLayer],

        environment: { TableName: props!.tableName },
      }
    );
    this.todoApi_lambdaFn = todoApi_lambdaFn;
  }
}

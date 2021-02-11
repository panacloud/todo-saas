import * as cdk from "@aws-cdk/core";
import * as appsync from "@aws-cdk/aws-appsync";
import * as ddb from "@aws-cdk/aws-dynamodb";
import * as lambda from "@aws-cdk/aws-lambda";


export class NewStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const api = new appsync.GraphqlApi(this, "Api", {
      name: "cdk-todos-appsync-api",
      schema: appsync.Schema.fromAsset("graphql/schema.graphql"),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: appsync.AuthorizationType.API_KEY,
        },
      },
      xrayEnabled: true,
    });
    new cdk.CfnOutput(this, "GraphQLAPIURL", {
      value: api.graphqlUrl,
    });
    new cdk.CfnOutput(this, "GraphQLAPIKey", {
      value: api.apiKey || "",
    });
    new cdk.CfnOutput(this, "Stack Region", {
      value: this.region,
    });

    const todosLambda = new lambda.Function(this, "AppSynctodosHandler", {
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: "main.handler",
      code: lambda.Code.fromAsset("lambda-fns"),
      memorySize: 1024,
    });
    const lambdaDs = api.addLambdaDataSource("lambdaDatasource", todosLambda);
    lambdaDs.createResolver({
      typeName: "Query",
      fieldName: "listTodos",
    });

    lambdaDs.createResolver({
      typeName: "Mutation",
      fieldName: "createTodo",
    });

    lambdaDs.createResolver({
      typeName: "Mutation",
      fieldName: "deleteTodo",
    });

    const todosTable = new ddb.Table(this, "CDKtodosTable", {
      billingMode: ddb.BillingMode.PAY_PER_REQUEST,
      partitionKey: {
        name: "id",
        type: ddb.AttributeType.STRING,
      },
    });
    todosTable.grantFullAccess(todosLambda);
    todosLambda.addEnvironment("TODOS_TABLE", todosTable.tableName);

  }
  
}

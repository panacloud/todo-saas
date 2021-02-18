import * as cdk from "@aws-cdk/core";
import * as appsync from "@aws-cdk/aws-appsync";
import * as ddb from "@aws-cdk/aws-dynamodb";
import * as lambda from "@aws-cdk/aws-lambda";
import * as cloudfront from "@aws-cdk/aws-cloudfront";
import * as origins from "@aws-cdk/aws-cloudfront-origins";
import * as s3 from "@aws-cdk/aws-s3";
import * as s3deploy from "@aws-cdk/aws-s3-deployment";

export class NewStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // // create a bucket to upload your app files
    // const websiteBucket = new s3.Bucket(this, "WebsiteBucket", {
    //   versioned: true,
    // });

    // // create a CDN to deploy your website
    // const distribution = new cloudfront.Distribution(this, "Distribution", {
    //   defaultBehavior: {
    //     origin: new origins.S3Origin(websiteBucket),
    //   },
    //   defaultRootObject: "index.html",
    // });

    // // Prints out the web endpoint to the terminal
    // new cdk.CfnOutput(this, "DistributionDomainName", {
    //   value: distribution.domainName,
    // });

    // // housekeeping for uploading the data in bucket
    // new s3deploy.BucketDeployment(this, "DeployWebsite", {
    //   sources: [s3deploy.Source.asset("../frontend/public")],
    //   destinationBucket: websiteBucket,
    //   distribution,
    //   distributionPaths: ["/*"],
    // });

    const api = new appsync.GraphqlApi(this, "MainTodosApi", {
      name: "MainTodosApi",
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

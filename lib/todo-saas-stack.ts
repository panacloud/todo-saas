import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from 'constructs';
import { aws_appsync as appsync } from "aws-cdk-lib";
import { PanacloudManager } from "panacloud-manager";
import { aws_lambda as lambda } from "aws-cdk-lib";
import { aws_iam as iam } from "aws-cdk-lib";
import { aws_dynamodb as dynamodb } from "aws-cdk-lib";
export class TodoSaasStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const apiManager: any = new PanacloudManager(this, "todoSaas-apiManager");
    const todoSaas_appsync: appsync.CfnGraphQLApi = new appsync.CfnGraphQLApi(
      this,
      "todoSaas",
      {
        authenticationType: "API_KEY",
        name: "todoSaas",
      }
    );
    const todoSaas_schema: appsync.CfnGraphQLSchema =
      new appsync.CfnGraphQLSchema(this, "todoSaasSchema", {
        apiId: todoSaas_appsync.attrApiId,
        definition: `type Todo {
                      id: ID!
                      name: String!
                    }

                    input TodoInput {
                      id: ID!
                      name: String!
                    }

                    type Query {
                      listTodos: [Todo]
                    }

                    type Mutation {
                      createTodo(Todo: TodoInput!): Todo
                      deleteTodo(TodoId: String!): String
                    }`,
      });
    new appsync.CfnApiKey(this, "apiKey", {
      apiId: todoSaas_appsync.attrApiId,
    });

    const todoSaas_servRole: iam.Role = new iam.Role(
      this,
      "appsyncServiceRole",
      {
        assumedBy: new iam.ServicePrincipal("appsync.amazonaws.com"),
      }
    );
    todoSaas_servRole.addToPolicy(
      new iam.PolicyStatement({
        resources: ["*"],
        actions: ["lambda:InvokeFunction"],
      })
    );

    const todoSaas_lambdaFn: lambda.Function = new lambda.Function(
      this,
      "todoSaasLambda",
      {
        functionName: "todoSaasLambda",
        runtime: lambda.Runtime.NODEJS_12_X,
        handler: "main.handler",
        code: lambda.Code.fromAsset("lambda-fns"),
        memorySize: 1024,
      }
    );
    const ds_todoSaas: appsync.CfnDataSource = new appsync.CfnDataSource(
      this,
      "todoSaasdataSourceGraphql",
      {
        name: "NaN",
        apiId: todoSaas_appsync.attrApiId,
        type: "AWS_LAMBDA",
        lambdaConfig: { lambdaFunctionArn: todoSaas_lambdaFn.functionArn },
        serviceRoleArn: todoSaas_servRole.roleArn,
      }
    );
    const todoSaas_table: dynamodb.Table = new dynamodb.Table(
      this,
      "todoSaasTable",
      {
        tableName: "todoSaas",
        billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
        partitionKey: {
          name: "id",
          type: dynamodb.AttributeType.STRING,
        },
      }
    );
    todoSaas_table.grantFullAccess(todoSaas_lambdaFn);

    new appsync.CfnResolver(this, "listTodos_resolver", {
      apiId: todoSaas_appsync.attrApiId,
      typeName: "Query",
      fieldName: "listTodos",
      dataSourceName: ds_todoSaas.name,
    });

    new appsync.CfnResolver(this, "createTodo_resolver", {
      apiId: todoSaas_appsync.attrApiId,
      typeName: "Mutation",
      fieldName: "createTodo",
      dataSourceName: ds_todoSaas.name,
    });
    new appsync.CfnResolver(this, "deleteTodo_resolver", {
      apiId: todoSaas_appsync.attrApiId,
      typeName: "Mutation",
      fieldName: "deleteTodo",
      dataSourceName: ds_todoSaas.name,
    });

    todoSaas_lambdaFn.addEnvironment(
      "todoSaas_TABLE",
      todoSaas_table.tableName
    );
  }
}

import { aws_appsync as appsync, CfnOutput } from "aws-cdk-lib";
import { aws_iam as iam } from "aws-cdk-lib";
import { Construct } from "constructs";
interface AppsyncProps {
  myApi_lambdaFn_getTodosArn: string;
  myApi_lambdaFn_addTodoArn: string;
  myApi_lambdaFn_deleteTodoArn: string;
  prod?: string;
}

export class AppsyncConstruct extends Construct {
  public api_url: string;
  public api_key: string;

  constructor(scope: Construct, id: string, props?: AppsyncProps) {
    super(scope, id);

    const myApi_appsync: appsync.CfnGraphQLApi = new appsync.CfnGraphQLApi(
      this,
      props?.prod ? props?.prod + "myApi" : "myApi",
      {
        authenticationType: "API_KEY",
        name: props?.prod ? props?.prod + "myApi" : "myApi",
      }
    );
    const myApi_schema: appsync.CfnGraphQLSchema = new appsync.CfnGraphQLSchema(
      this,
      props?.prod ? props?.prod + "myApiSchema" : "myApiSchema",
      {
        apiId: myApi_appsync.attrApiId,
        definition: `scalar AWSDate
scalar AWSTime
scalar AWSDateTime
scalar AWSTimestamp
scalar AWSEmail
scalar AWSJSON
scalar AWSURL
scalar AWSPhone
scalar AWSIPAddress

type Todo {
  id: ID!
  title: String!
}

input TodoInput {
  id: ID!
  title: String!
}

type Query {
  getTodos: [Todo]
}

type Mutation {
  addTodo(todo: TodoInput!): Todo     
  deleteTodo(todoId: String!): String  
}


`,
      }
    );
    const myApi_apiKey: appsync.CfnApiKey = new appsync.CfnApiKey(
      this,
      "apiKey",
      {
        apiId: myApi_appsync.attrApiId,
      }
    );
    const myApi_serviceRole: iam.Role = new iam.Role(
      this,
      "appsyncServiceRole",
      {
        assumedBy: new iam.ServicePrincipal("appsync.amazonaws.com"),
      }
    );
    myApi_serviceRole.addToPolicy(
      new iam.PolicyStatement({
        resources: ["*"],
        actions: ["lambda:InvokeFunction"],
      })
    );

    const ds_myApi_addTodo: appsync.CfnDataSource = new appsync.CfnDataSource(
      this,
      props?.prod
        ? props?.prod + "myApidataSourceGraphqladdTodo"
        : "myApidataSourceGraphqladdTodo",
      {
        name: props?.prod
          ? props?.prod + "myApi_dataSource_addTodo"
          : "myApi_dataSource_addTodo",
        apiId: myApi_appsync.attrApiId,
        type: "AWS_LAMBDA",
        lambdaConfig: { lambdaFunctionArn: props!.myApi_lambdaFn_addTodoArn },
        serviceRoleArn: myApi_serviceRole.roleArn,
      }
    );
    const ds_myApi_deleteTodo: appsync.CfnDataSource =
      new appsync.CfnDataSource(
        this,
        props?.prod
          ? props?.prod + "myApidataSourceGraphqldeleteTodo"
          : "myApidataSourceGraphqldeleteTodo",
        {
          name: props?.prod
            ? props?.prod + "myApi_dataSource_deleteTodo"
            : "myApi_dataSource_deleteTodo",
          apiId: myApi_appsync.attrApiId,
          type: "AWS_LAMBDA",
          lambdaConfig: {
            lambdaFunctionArn: props!.myApi_lambdaFn_deleteTodoArn,
          },
          serviceRoleArn: myApi_serviceRole.roleArn,
        }
      );
    const ds_myApi_getTodos: appsync.CfnDataSource = new appsync.CfnDataSource(
      this,
      props?.prod
        ? props?.prod + "myApidataSourceGraphqlgetTodos"
        : "myApidataSourceGraphqlgetTodos",
      {
        name: props?.prod
          ? props?.prod + "myApi_dataSource_getTodos"
          : "myApi_dataSource_getTodos",
        apiId: myApi_appsync.attrApiId,
        type: "AWS_LAMBDA",
        lambdaConfig: { lambdaFunctionArn: props!.myApi_lambdaFn_getTodosArn },
        serviceRoleArn: myApi_serviceRole.roleArn,
      }
    );
    const getTodos_resolver: appsync.CfnResolver = new appsync.CfnResolver(
      this,
      "getTodos_resolver",
      {
        apiId: myApi_appsync.attrApiId,
        typeName: "Query",
        fieldName: "getTodos",
        dataSourceName: ds_myApi_getTodos.name,
      }
    );
    getTodos_resolver.node.addDependency(myApi_schema);
    getTodos_resolver.node.addDependency(ds_myApi_getTodos);

    const addTodo_resolver: appsync.CfnResolver = new appsync.CfnResolver(
      this,
      "addTodo_resolver",
      {
        apiId: myApi_appsync.attrApiId,
        typeName: "Mutation",
        fieldName: "addTodo",
        dataSourceName: ds_myApi_addTodo.name,
      }
    );
    addTodo_resolver.node.addDependency(myApi_schema);
    addTodo_resolver.node.addDependency(ds_myApi_addTodo);

    const deleteTodo_resolver: appsync.CfnResolver = new appsync.CfnResolver(
      this,
      "deleteTodo_resolver",
      {
        apiId: myApi_appsync.attrApiId,
        typeName: "Mutation",
        fieldName: "deleteTodo",
        dataSourceName: ds_myApi_deleteTodo.name,
      }
    );
    deleteTodo_resolver.node.addDependency(myApi_schema);
    deleteTodo_resolver.node.addDependency(ds_myApi_deleteTodo);

    this.api_url = myApi_appsync.attrGraphQlUrl;
    this.api_key = myApi_apiKey.attrApiKey;
    new CfnOutput(
      this,
      props?.prod ? props.prod + "APIGraphQlURL" : "APIGraphQlURL",
      {
        value: myApi_appsync.attrGraphQlUrl,
        description: "The URL of the GraphQl API",
        exportName: props?.prod
          ? props.prod + "graphQlAPIURL"
          : "graphQlAPIURL",
      }
    );
    new CfnOutput(
      this,
      props?.prod ? props.prod + "GraphQLAPIKey" : "GraphQLAPIKey",
      {
        value: myApi_apiKey.attrApiKey || "",
        description: "The API Key of the GraphQl API",
        exportName: props?.prod
          ? props.prod + "graphQlAPIKey"
          : "graphQlAPIKey",
      }
    );
  }
}

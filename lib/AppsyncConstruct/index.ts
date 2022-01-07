import { aws_appsync as appsync, CfnOutput } from "aws-cdk-lib";
import { aws_iam as iam } from "aws-cdk-lib";
import { Construct } from "constructs";
interface AppsyncProps {
  todoApi_lambdaFn_getTodosArn: string;
  todoApi_lambdaFn_addTodoArn: string;
  todoApi_lambdaFn_deleteTodoArn: string;
  prod?: string;
}

export class AppsyncConstruct extends Construct {
  public api_url: string;
  public api_key: string;

  constructor(scope: Construct, id: string, props?: AppsyncProps) {
    super(scope, id);

    const todoApi_appsync: appsync.CfnGraphQLApi = new appsync.CfnGraphQLApi(
      this,
      props?.prod ? props?.prod + "todoApi" : "todoApi",
      {
        authenticationType: "API_KEY",
        name: props?.prod ? props?.prod + "todoApi" : "todoApi",
      }
    );
    const todoApi_schema: appsync.CfnGraphQLSchema =
      new appsync.CfnGraphQLSchema(
        this,
        props?.prod ? props?.prod + "todoApiSchema" : "todoApiSchema",
        {
          apiId: todoApi_appsync.attrApiId,
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


# @microService(name:"todo")`,
        }
      );
    const todoApi_apiKey: appsync.CfnApiKey = new appsync.CfnApiKey(
      this,
      "apiKey",
      {
        apiId: todoApi_appsync.attrApiId,
      }
    );
    const todoApi_serviceRole: iam.Role = new iam.Role(
      this,
      "appsyncServiceRole",
      {
        assumedBy: new iam.ServicePrincipal("appsync.amazonaws.com"),
      }
    );
    todoApi_serviceRole.addToPolicy(
      new iam.PolicyStatement({
        resources: ["*"],
        actions: ["lambda:InvokeFunction"],
      })
    );

    const ds_todoApi_addTodo: appsync.CfnDataSource = new appsync.CfnDataSource(
      this,
      props?.prod
        ? props?.prod + "todoApidataSourceGraphqladdTodo"
        : "todoApidataSourceGraphqladdTodo",
      {
        name: props?.prod
          ? props?.prod + "todoApi_dataSource_addTodo"
          : "todoApi_dataSource_addTodo",
        apiId: todoApi_appsync.attrApiId,
        type: "AWS_LAMBDA",
        lambdaConfig: { lambdaFunctionArn: props!.todoApi_lambdaFn_addTodoArn },
        serviceRoleArn: todoApi_serviceRole.roleArn,
      }
    );
    const ds_todoApi_deleteTodo: appsync.CfnDataSource =
      new appsync.CfnDataSource(
        this,
        props?.prod
          ? props?.prod + "todoApidataSourceGraphqldeleteTodo"
          : "todoApidataSourceGraphqldeleteTodo",
        {
          name: props?.prod
            ? props?.prod + "todoApi_dataSource_deleteTodo"
            : "todoApi_dataSource_deleteTodo",
          apiId: todoApi_appsync.attrApiId,
          type: "AWS_LAMBDA",
          lambdaConfig: {
            lambdaFunctionArn: props!.todoApi_lambdaFn_deleteTodoArn,
          },
          serviceRoleArn: todoApi_serviceRole.roleArn,
        }
      );
    const ds_todoApi_getTodos: appsync.CfnDataSource =
      new appsync.CfnDataSource(
        this,
        props?.prod
          ? props?.prod + "todoApidataSourceGraphqlgetTodos"
          : "todoApidataSourceGraphqlgetTodos",
        {
          name: props?.prod
            ? props?.prod + "todoApi_dataSource_getTodos"
            : "todoApi_dataSource_getTodos",
          apiId: todoApi_appsync.attrApiId,
          type: "AWS_LAMBDA",
          lambdaConfig: {
            lambdaFunctionArn: props!.todoApi_lambdaFn_getTodosArn,
          },
          serviceRoleArn: todoApi_serviceRole.roleArn,
        }
      );
    const getTodos_resolver: appsync.CfnResolver = new appsync.CfnResolver(
      this,
      "getTodos_resolver",
      {
        apiId: todoApi_appsync.attrApiId,
        typeName: "Query",
        fieldName: "getTodos",
        dataSourceName: ds_todoApi_getTodos.name,
      }
    );
    getTodos_resolver.node.addDependency(todoApi_schema);
    getTodos_resolver.node.addDependency(ds_todoApi_getTodos);

    const addTodo_resolver: appsync.CfnResolver = new appsync.CfnResolver(
      this,
      "addTodo_resolver",
      {
        apiId: todoApi_appsync.attrApiId,
        typeName: "Mutation",
        fieldName: "addTodo",
        dataSourceName: ds_todoApi_addTodo.name,
      }
    );
    addTodo_resolver.node.addDependency(todoApi_schema);
    addTodo_resolver.node.addDependency(ds_todoApi_addTodo);

    const deleteTodo_resolver: appsync.CfnResolver = new appsync.CfnResolver(
      this,
      "deleteTodo_resolver",
      {
        apiId: todoApi_appsync.attrApiId,
        typeName: "Mutation",
        fieldName: "deleteTodo",
        dataSourceName: ds_todoApi_deleteTodo.name,
      }
    );
    deleteTodo_resolver.node.addDependency(todoApi_schema);
    deleteTodo_resolver.node.addDependency(ds_todoApi_deleteTodo);

    this.api_url = todoApi_appsync.attrGraphQlUrl;
    this.api_key = todoApi_apiKey.attrApiKey;
    new CfnOutput(
      this,
      props?.prod ? props.prod + "APIGraphQlURL" : "APIGraphQlURL",
      {
        value: todoApi_appsync.attrGraphQlUrl,
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
        value: todoApi_apiKey.attrApiKey || "",
        description: "The API Key of the GraphQl API",
        exportName: props?.prod
          ? props.prod + "graphQlAPIKey"
          : "graphQlAPIKey",
      }
    );
  }
}

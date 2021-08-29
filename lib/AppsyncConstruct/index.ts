import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { aws_appsync as appsync } from "aws-cdk-lib";
import { aws_iam as iam } from "aws-cdk-lib";

interface AppsyncProps {
  todoApi_lambdaFnArn: string;
}

export class AppsyncConstruct extends Construct {
  constructor(scope: Construct, id: string, props?: AppsyncProps) {
    super(scope, id);

    const todoApi_appsync: appsync.CfnGraphQLApi = new appsync.CfnGraphQLApi(
      this,
      "todoApi",
      {
        authenticationType: "API_KEY",
        name: "todoApi",
      }
    );
    const todoApi_schema: appsync.CfnGraphQLSchema =
      new appsync.CfnGraphQLSchema(this, "todoApiSchema", {
        apiId: todoApi_appsync.attrApiId,
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
  updateTodo(todo: TodoInput!): Todo
}
`,
      });
    new appsync.CfnApiKey(this, "apiKey", {
      apiId: todoApi_appsync.attrApiId,
    });

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

    const ds_todoApi: appsync.CfnDataSource = new appsync.CfnDataSource(
      this,
      "todoApidataSourceGraphql",
      {
        name: "todoApi_dataSource",
        apiId: todoApi_appsync.attrApiId,
        type: "AWS_LAMBDA",
        lambdaConfig: { lambdaFunctionArn: props!.todoApi_lambdaFnArn },
        serviceRoleArn: todoApi_serviceRole.roleArn,
      }
    );
    const listTodos_resolver: appsync.CfnResolver = new appsync.CfnResolver(
      this,
      "listTodos_resolver",
      {
        apiId: todoApi_appsync.attrApiId,
        typeName: "Query",
        fieldName: "listTodos",
        dataSourceName: ds_todoApi.name,
      }
    );
    listTodos_resolver.node.addDependency(todoApi_schema);
    listTodos_resolver.node.addDependency(ds_todoApi);

    const createTodo_resolver: appsync.CfnResolver = new appsync.CfnResolver(
      this,
      "createTodo_resolver",
      {
        apiId: todoApi_appsync.attrApiId,
        typeName: "Mutation",
        fieldName: "createTodo",
        dataSourceName: ds_todoApi.name,
      }
    );
    createTodo_resolver.node.addDependency(todoApi_schema);
    createTodo_resolver.node.addDependency(ds_todoApi);

    const deleteTodo_resolver: appsync.CfnResolver = new appsync.CfnResolver(
      this,
      "deleteTodo_resolver",
      {
        apiId: todoApi_appsync.attrApiId,
        typeName: "Mutation",
        fieldName: "deleteTodo",
        dataSourceName: ds_todoApi.name,
      }
    );
    deleteTodo_resolver.node.addDependency(todoApi_schema);
    deleteTodo_resolver.node.addDependency(ds_todoApi);
  }
}

var axios = require("axios");
import * as AWS from "aws-sdk";
import { AppSyncResolverEvent } from "aws-lambda";
import { MutationAddTodoArgs } from "../../customMockLambdaLayer/mockData/types";
const docClient = new AWS.DynamoDB.DocumentClient();
declare var process: {
  env: {
    TableName: string;
  };
};

exports.handler = async (event: AppSyncResolverEvent<MutationAddTodoArgs>) => {
  const result = await addTodo(event.arguments);
  return result;
};

async function addTodo(args: MutationAddTodoArgs) {
  // Write your buisness logic here

  // Example Schema:

  // type User {
  //   id: ID!
  //   name: String!
  //   age: Int!
  // }

  // input userInput {
  //   name: String!
  //   age: Int!
  // }

  // type Query {
  //   listUsers: [User!]
  // }

  // type Mutation {
  //   createUser(user: userInput!): String
  // }

  // Example Code:

  // try{
  // const params = {TableName:process.env.TableName, Item: args.user}
  // await docClient.put(params).promise()
  //return args.user.name
  // }
  // catch (err)  {
  // console.log('ERROR', err)
  // return null
  // }
  return { id: "01", title: "Cathie" };
}

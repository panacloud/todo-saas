var axios = require("axios");
import * as AWS from "aws-sdk";
import { AppSyncResolverEvent } from "aws-lambda";
const docClient = new AWS.DynamoDB.DocumentClient();
declare var process: {
  env: {
    TableName: string;
  };
};

exports.handler = async (event: AppSyncResolverEvent<null>) => {
  const result = await getTodos();
  return result;
};

async function getTodos() {
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
  // const params = {TableName:process.env.TableName}
  //   const data = await docClient.scan(params).promise()
  // return data.Items
  // }
  // catch (err)  {
  // console.log('ERROR', err)
  // return null
  // }
  return [
    { id: "01", title: "Melicent" },
    { id: "01", title: "Muffin" },
    { id: "01", title: "Kaila" },
  ];
}

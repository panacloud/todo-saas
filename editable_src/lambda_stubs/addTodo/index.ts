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
 
  try{
  const params = {TableName:process.env.TableName, Item: args.todo}
  await docClient.put(params).promise()
  return args.todo
  }
  catch (err)  {
  console.log('ERROR', err)
  return null
  }
}

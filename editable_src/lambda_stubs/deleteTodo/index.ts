import * as AWS from "aws-sdk";
import { AppSyncResolverEvent } from "aws-lambda";
import { MutationDeleteTodoArgs } from "../../customMockLambdaLayer/mockData/types";
const docClient = new AWS.DynamoDB.DocumentClient();
declare var process: {
  env: {
    TableName: string;
  };
};

exports.handler = async (
  event: AppSyncResolverEvent<MutationDeleteTodoArgs>
) => {
  const result = await deleteTodo(event.arguments);
  return result;
};

async function deleteTodo(args: MutationDeleteTodoArgs) {
 
  try{
    const params = {
      TableName: process.env.TableName,
      Key: {
        id: args.todoId,
      },
    };
    const data = await docClient.delete(params).promise();
  return args.todoId
  }
  catch (err)  {
  console.log('ERROR', err)
  return null
  }
}

const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();

async function deleteTodo(TodoId: String) {
    const params = {
        TableName: process.env.TODOS_TABLE,
        Key: {
          id: TodoId
        }
    }
    try {
        await docClient.delete(params).promise()
        return TodoId
    } catch (err) {
        console.log('DynamoDB error: ', err)
        return null
    }
}

export default deleteTodo;
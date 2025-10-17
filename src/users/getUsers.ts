import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const handler = async (
 event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
 try {
  console.log('table', process.env.USERS_TABLE);
  const command = new ScanCommand({
   TableName: process.env.USERS_TABLE,
  });

  const result = await docClient.send(command);

  if (result.Items?.length === 0) {
   return {
    statusCode: 200,
    body: JSON.stringify(result.Items || []),
   };
  }

  const users = result.Items?.map(user => {
   delete user.password;
   return user;
  });

  return {
   statusCode: 200,
   headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
   },
   body: JSON.stringify(users),
  };
 } catch (error) {
  console.log('error: ', error);
  return {
   statusCode: 500,
   headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
   },
   body: JSON.stringify({ message: 'Failed to scan users' }),
  };
 }
};

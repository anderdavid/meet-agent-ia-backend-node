import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBDocumentClient, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { getUserId } from './utils/getUserId';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const handler = async (
 event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
 try {
  const id = String(event.pathParameters?.id);
  const user = await getUserId(id);

  if (!user) {
   return {
    statusCode: 404,
    body: JSON.stringify({ message: 'User not found' }),
   };
  }

  const command = new DeleteCommand({
   TableName: process.env.USERS_TABLE,
   Key: {
    id: id,
   },
  });
  await docClient.send(command);
  return {
   statusCode: 201,
   body: JSON.stringify({ message: 'User delete' }),
  };
 } catch (error) {
  return {
   statusCode: 500,
   body: JSON.stringify({ message: 'Failed delete user' }),
  };
 }
};

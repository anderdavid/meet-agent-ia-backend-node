import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { getMeetById } from './utils/getMeetById';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const handler = async (
 event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
 try {
  const id = String(event.pathParameters?.id);
  const meet = await getMeetById(id);

  if (!meet) {
   return {
    statusCode: 404,
    body: JSON.stringify({ message: 'Meet not found' }),
   };
  }
  const command = new DeleteCommand({
   TableName: process.env.MEETS_TABLE,
   Key: {
    id: id,
   },
  });
  await docClient.send(command);
  return {
   statusCode: 201,
   body: JSON.stringify('meet delete'),
  };
 } catch (error) {
  return {
   statusCode: 500,
   body: JSON.stringify({ message: 'Failed...' }),
  };
 }
};

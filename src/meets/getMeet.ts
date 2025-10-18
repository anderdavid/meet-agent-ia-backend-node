import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import { getMeetById } from './utils/getMeetById';

const client = new DynamoDBClient({});

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

  return {
   statusCode: 200,
   body: JSON.stringify(meet),
  };
 } catch (error) {
  return {
   statusCode: 500,
   body: JSON.stringify({ message: 'Failed...' }),
  };
 }
};

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import { getUserId } from './utils/getUserId';

export const handler = async (
 event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
 try {
  const id = String(event.pathParameters?.id);
  const user = await getUserId(id);

  if (!user) {
   return {
    statusCode: 404,
    headers: {
     'Access-Control-Allow-Origin': '*',
     'Access-Control-Allow-Headers': 'Content-Type,Authorization',
     'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    },
    body: JSON.stringify({ message: 'User not found' }),
   };
  }

  return {
   statusCode: 200,
   headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
   },
   body: JSON.stringify(user),
  };
 } catch (error) {
  return {
   statusCode: 500,
   headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
   },
   body: JSON.stringify({ message: 'Failed to get user' }),
  };
 }
};

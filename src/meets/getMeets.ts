import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const handler = async (
 event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
 try {
  return {
   statusCode: 201,
   body: JSON.stringify('getMeets'),
  };
 } catch (error) {
  return {
   statusCode: 500,
   body: JSON.stringify({ message: 'Failed...' }),
  };
 }
};

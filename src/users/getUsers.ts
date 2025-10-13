import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const handler = async (
 event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
 try {
  const command = new ScanCommand({
   TableName: process.env.USERS_TABLE,
  });

  const result = await docClient.send(command);

  return {
   statusCode: 200,
   body: JSON.stringify(result.Items || []),
  };
 } catch (error) {
  console.log('error: ', error);
  return {
   statusCode: 500,
   body: JSON.stringify({ message: 'Failed to scan users' }),
  };
 }
};

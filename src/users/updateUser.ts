import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { getUserId } from './utils/getUserId';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

interface User {
 id: string;
 name: string;
 email: string;
 password: string;
 createdAt: number;
 updateAt: number;
}

export const handler = async (
 event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
 try {
  const id = String(event.pathParameters?.id);
  const user = await getUserId(id);

  const body = JSON.parse(event.body || '{}');
  const { name, email, password } = body;

  if (!user) {
   return {
    statusCode: 404,
    body: JSON.stringify({ message: 'User not found' }),
   };
  }

  const newUser: User = {
   id: user.id,
   name,
   email,
   password,
   createdAt: user.createdAt,
   updateAt: Date.now(),
  };

  const command = new PutCommand({
   TableName: process.env.USERS_TABLE,
   Item: newUser,
  });

  await docClient.send(command);
  return {
   statusCode: 201,
   body: JSON.stringify(user),
  };
 } catch (error) {
  return {
   statusCode: 500,
   body: JSON.stringify({ message: 'Failed to update user' }),
  };
 }
};

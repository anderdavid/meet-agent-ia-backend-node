import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { meetSchema } from './utils/meetsSchema';
import { z } from 'zod';
import { getMeetById } from './utils/getMeetById';
import { v4 as uuidv4 } from 'uuid';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

interface MeetI {
 id: string;
 nameMeeting: string;
 description: string;
 userId: string;
 createdAt: number;
 updateAt: number;
}

export const handler = async (
 event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
 try {
  const body = JSON.parse(event.body || '{}');
  const { nameMeeting, description, userId } = body;
  const validated = meetSchema.parse(body);

  const id = String(event.pathParameters?.id);
  const meet = getMeetById(id);

  if (!meet) {
   return {
    statusCode: 404,
    body: JSON.stringify({ message: 'Meet not found' }),
   };
  }

  const command = new UpdateCommand({
   TableName: process.env.MEETS_TABLE,
   Key: { id },
   UpdateExpression:
    'SET nameMeeting = :name, description = :desc, userId = :userId, updateAt = :updateAt',
   ExpressionAttributeValues: {
    ':name': nameMeeting,
    ':desc': description,
    ':userId': userId,
    ':updateAt': Date.now(),
   },
   ReturnValues: 'ALL_NEW',
  });

  await docClient.send(command);

  return {
   statusCode: 201,
   body: JSON.stringify({ mesage: 'meet is update' }),
  };
 } catch (error) {
  if (error instanceof z.ZodError) {
   return {
    statusCode: 400,
    body: JSON.stringify({
     message: 'Error de validación',
     errors: error.issues,
    }),
   };
  }
  return {
   statusCode: 500,
   body: JSON.stringify({ message: 'Failed...' }),
  };
 }
};

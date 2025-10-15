import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
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

  const newMeet: MeetI = {
   id: uuidv4(),
   nameMeeting,
   description,
   userId,
   createdAt: Date.now(),
   updateAt: Date.now(),
  };

  const command = new PutCommand({
   TableName: process.env.MEETS_TABLE,
   Item: newMeet,
  });

  await docClient.send(command);

  return {
   statusCode: 201,
   body: JSON.stringify(newMeet),
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

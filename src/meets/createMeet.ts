import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { meetSchema } from './utils/meetsSchema';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

interface MeetI {
 id: string;
 nameMeeting: string;
 description: string;
 userId: string;
 url: string;
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

  const s3 = new S3Client({ region: 'us-east-1' });
  const filename = `${nameMeeting}.mp3`;
  const contentType = 'audio/mp3';

  const s3Command = new PutObjectCommand({
   Bucket: process.env.BUCKET_NAME,
   Key: filename,
   ContentType: contentType,
  });

  const url = await getSignedUrl(s3, s3Command, { expiresIn: 300 });

  if (!url) {
   return {
    statusCode: 500,
    body: JSON.stringify({
     message: 'Error creatingg presigned URL',
    }),
   };
  }

  const meet: MeetI = {
   id: uuidv4(),
   nameMeeting,
   description,
   userId,
   url,
   createdAt: Date.now(),
   updateAt: Date.now(),
  };

  const command = new PutCommand({
   TableName: process.env.MEETS_TABLE,
   Item: meet,
  });

  await docClient.send(command);

  return {
   statusCode: 201,
   body: JSON.stringify(meet),
  };
 } catch (error) {
  console.log('error: ', error);
  if (error instanceof z.ZodError) {
   return {
    statusCode: 400,
    body: JSON.stringify({
     message: 'Error of validation',
     errors: error.issues,
    }),
   };
  }
  return {
   statusCode: 500,
   body: JSON.stringify({ message: 'Failed create meet' }),
  };
 }
};

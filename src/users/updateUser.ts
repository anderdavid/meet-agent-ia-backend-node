import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { getUserId } from './utils/getUserId';
import { getUserByEmail } from './utils/userByEmail';
import { z } from 'zod';

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

const userSchema = z.object({
 name: z.string().min(6, 'El nombre es obligatorio, minimo 6 caracteres'),
 email: z.string().email('Debe ser un email válido'),
});

export const handler = async (
 event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
 try {
  const id = String(event.pathParameters?.id);
  const user = await getUserId(id);

  const body = JSON.parse(event.body || '{}');
  const validated = userSchema.parse(body);
  const { name, email } = body;

  const usersWithThisEmail = await getUserByEmail(email);
  console.log('usersWithThisEmail', usersWithThisEmail);

  const othersUserWithThisEmail = (usersWithThisEmail || []).filter(
   mUser => mUser.email != user?.email
  );

  if (othersUserWithThisEmail.length > 0) {
   return {
    statusCode: 400,
    body: JSON.stringify({
     message: 'the user alrready exist',
    }),
   };
  }

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
   password: user.password,
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
   body: JSON.stringify(newUser),
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
   body: JSON.stringify({ message: 'Failed to update user' }),
  };
 }
};

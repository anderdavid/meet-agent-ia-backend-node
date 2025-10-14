import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { existUserByEmail } from './utils/userByEmail';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const ROUNDS = 10;

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
 password: z.string().min(8, 'Password es obligatorio'),
});

export const handler = async (
 event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
 try {
  const body = JSON.parse(event.body || '{}');
  const validated = userSchema.parse(body);

  const { name, email, password } = body;

  const existUser = await existUserByEmail(email);
  console.log('existUser', existUser);

  if (typeof existUser === null) {
   return {
    statusCode: 500,
    body: JSON.stringify({ message: 'Failed verify email' }),
   };
  }

  if (!existUser) {
   return {
    statusCode: 400,
    body: JSON.stringify({
     message: 'the user alrready exist',
    }),
   };
  }

  let bcryptPassword = bcrypt.hashSync(password, Number(ROUNDS));

  const user: User = {
   id: uuidv4(),
   name,
   email,
   password: bcryptPassword,
   createdAt: Date.now(),
   updateAt: Date.now(),
  };

  const command = new PutCommand({
   TableName: process.env.USERS_TABLE,
   Item: user,
  });

  await docClient.send(command);
  return {
   statusCode: 201,
   body: JSON.stringify(user),
  };
 } catch (error) {
  console.log('error: ', error);
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
   body: JSON.stringify({ message: 'Failed create user' }),
  };
 }
};

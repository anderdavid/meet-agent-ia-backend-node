import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { getUserId } from './utils/getUserId';
import { getUserByEmail } from './utils/userByEmail';
import { ROLE_ADMIN, ROLE_USER } from '../utils/constants';
import { z } from 'zod';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

interface User {
 id: string;
 name: string;
 email: string;
 role: string;
 password: string;
 createdAt: number;
 updateAt: number;
}

const userSchema = z.object({
 name: z.string().min(6, 'El nombre es obligatorio, minimo 6 caracteres'),
 email: z.string().email('Debe ser un email válido'),
});

const validateRole = (role: String) => {
 if (role === ROLE_ADMIN || role === ROLE_USER) {
  return true;
 } else {
  return false;
 }
};

export const handler = async (
 event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
 try {
  const id = String(event.pathParameters?.id);
  const user = await getUserId(id);

  const body = JSON.parse(event.body || '{}');
  const validated = userSchema.parse(body);
  const { name, email, role } = body;

  const mRole = validateRole(role);

  if (!mRole) {
   return {
    statusCode: 400,
    body: JSON.stringify({
     message: 'the role is not valid',
    }),
   };
  }

  const usersWithThisEmail = await getUserByEmail(email);
  console.log('usersWithThisEmail', usersWithThisEmail);

  const othersUserWithThisEmail = (usersWithThisEmail || []).filter(
   mUser => mUser.email != user?.email
  );

  console.log('othersUserWithThisEmail', othersUserWithThisEmail);

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

  const command = new UpdateCommand({
   TableName: process.env.USERS_TABLE,
   Key: { id },
   UpdateExpression:
    'SET #name = :name, #email = :email, #role = :role, #updateAt = :updateAt',
   ExpressionAttributeNames: {
    '#name': 'name',
    '#email': 'email',
    '#role': 'role',
    '#updateAt': 'updateAt',
   },
   ExpressionAttributeValues: {
    ':name': name,
    ':email': email,
    ':role': role,
    ':updateAt': Date.now(),
   },
   ReturnValues: 'ALL_NEW',
  });

  await docClient.send(command);
  return {
   statusCode: 201,
   body: JSON.stringify({ message: 'user id update' }),
  };
 } catch (error) {
  console.log('error', error);
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

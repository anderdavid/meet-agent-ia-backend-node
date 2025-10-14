import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { getUserByEmail } from './utils/userByEmail';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const userSchema = z.object({
 email: z.string().email('Debe ser un email válido'),
 password: z.string().min(8, 'Password es obligatorio'),
});

interface User {
 login: string;
 password: string;
}

export const handler = async (
 event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
 const body = JSON.parse(event.body || '{}');
 const validated = userSchema.parse(body);

 const { email, password } = body;

 const users = await getUserByEmail(email);
 console.log('users', users);

 if (!users || users.length === 0) {
  return {
   statusCode: 401,
   body: JSON.stringify({ message: 'Invalid credentials' }),
  };
 }

 const user = users[0];
 if (!bcrypt.compareSync(password, user.password)) {
  return {
   statusCode: 401,
   body: JSON.stringify({ message: 'Invalid credentials' }),
  };
 }

 return {
  statusCode: 200,
  body: JSON.stringify('login exitoso'),
 };
};

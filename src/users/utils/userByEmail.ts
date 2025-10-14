import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
 DynamoDBDocumentClient,
 GetCommand,
 ScanCommand,
} from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const getUserByEmail = async (email: string) => {
 const command = new ScanCommand({
  TableName: process.env.USERS_TABLE,
  FilterExpression: '#email = :email',
  ExpressionAttributeNames: {
   '#email': 'email',
  },
  ExpressionAttributeValues: {
   ':email': email,
  },
 });

 try {
  const result = await docClient.send(command);
  if (result.Count === 0) {
   return false;
  }
  return result.Items;
 } catch (error) {
  console.log('error', null);
 }
};

export const existUserByEmail = async (email: string) => {
 const command = new ScanCommand({
  TableName: process.env.USERS_TABLE,
  FilterExpression: '#email = :email',
  ExpressionAttributeNames: {
   '#email': 'email',
  },
  ExpressionAttributeValues: {
   ':email': email,
  },
 });

 try {
  const result = await docClient.send(command);
  console.log('result', result);

  if (result.Count === 0) {
   return true;
  }

  return false;
 } catch (error) {
  console.log('error', error);
  return null;
 }
};

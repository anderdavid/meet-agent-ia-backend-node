import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
 DynamoDBDocumentClient,
 GetCommand,
 ScanCommand,
} from '@aws-sdk/lib-dynamodb';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const getUserId = async (id: string) => {
 console.log('idc: ', id);
 const command = new GetCommand({
  TableName: process.env.USERS_TABLE,
  Key: {
   id: id,
  },
 });
 try {
  const result = await docClient.send(command);
  console.log('result: ', result);
  return result.Item;
 } catch (error) {
  console.log('error: ', error);
  return null;
 }
};

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const getMeetById = async (id: string) => {
 try {
  const command = new GetCommand({
   TableName: process.env.MEETS_TABLE,
   Key: {
    id: id,
   },
  });
  const result = await docClient.send(command);
  console.log('result: ', result);
  const meet = result.Item;
  if (!meet) {
   return null;
  }
  return meet;
 } catch (error) {
  console.log('error: ', error);
  return null;
 }
};

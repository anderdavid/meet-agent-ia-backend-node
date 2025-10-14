import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';

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
  const user = result.Item;

  if (!user) {
   return null;
  }

  //delete user.password;
  return result.Item;
 } catch (error) {
  console.log('error: ', error);
  return null;
 }
};

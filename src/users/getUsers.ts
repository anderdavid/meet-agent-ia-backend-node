import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

export const handler = async (
 event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
 return {
  statusCode: 200,
  body: JSON.stringify({ message: 'Hola desde TS con Serverless v4' }),
 };
};

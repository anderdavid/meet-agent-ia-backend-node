import {
 APIGatewayTokenAuthorizerEvent,
 APIGatewayAuthorizerResult,
} from 'aws-lambda';
import jwt, { JwtPayload } from 'jsonwebtoken';

export const handler = async (
 event: APIGatewayTokenAuthorizerEvent
): Promise<APIGatewayAuthorizerResult> => {
 const token = event.authorizationToken?.replace('Bearer ', '');
 console.log('method arn', event.methodArn);

 if (!token || !event.methodArn) throw new Error('Unauthorized');

 const secret = process.env.JWT_SECRET;
 console.log('secret', secret);

 if (!secret) throw new Error('Unauthorized');

 try {
  const decoded = jwt.verify(token, secret) as JwtPayload;

  const userId = decoded.id;
  const role = decoded.role;

  if (!userId || !role) throw new Error('Unauthorized');

  return {
   principalId: userId,
   policyDocument: {
    Version: '2012-10-17',
    Statement: [
     {
      Action: 'execute-api:Invoke',
      Effect: 'Allow',
      Resource: event.methodArn,
     },
    ],
   },
   context: {
    userId,
    role,
   },
  };
 } catch (err) {
  console.error('JWT verification failed:', err);
  throw new Error('Unauthorized');
 }
};

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import { getUserId } from './utils/getUserId';

export const handler = async (
	event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
	try {
		const id = String(event.pathParameters?.id);
		const user = await getUserId(id);

		if (!user) {
			return {
				statusCode: 404,
				body: JSON.stringify({ message: 'User not found' }),
			};
		}

		return {
			statusCode: 200,
			body: JSON.stringify(user),
		};
	} catch (error) {
		return {
			statusCode: 500,
			body: JSON.stringify({ message: 'Failed to get user' }),
		};
	}
};

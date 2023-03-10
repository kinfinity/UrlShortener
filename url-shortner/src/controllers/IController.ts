import { DAXClient } from '@aws-sdk/client-dax'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { Context, APIGatewayProxyResult, APIGatewayProxyEvent } from 'aws-lambda'

export interface IController {
  [key: string]: (event: APIGatewayProxyEvent, context: Context, daxClient: DAXClient, dynamoDBClient: DynamoDBClient) => Promise<APIGatewayProxyResult>;
}
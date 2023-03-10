import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { Dax } from './dax'

// Initialize the DynamoDB client
export const dynamoDBClient = new DynamoDBClient({ serviceId: Dax.Client.config.serviceId, region: 'us-west-2' })

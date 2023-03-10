import { DAXClient } from '@aws-sdk/client-dax'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { HttpResponse } from '../utils/HttpResponse'
import { Context, APIGatewayProxyResult, APIGatewayProxyEvent } from 'aws-lambda'
import { ShortUrl } from '../services/shorturl_service'
import { LongUrlRequestFilter } from './utils/LongUrlRequestFilter'
import { Config } from '../config/config'

export const GetShortUrl = async (event: APIGatewayProxyEvent, context: Context, daxClient: DAXClient, dynamoDBClient: DynamoDBClient): Promise<APIGatewayProxyResult> => {
  // Validate http inputs
  if (!LongUrlRequestFilter(event,context)) {
    HttpResponse.Custom(400,"Invalid url") // bad request
  }
  const json_body = JSON.parse(event.body?.toString()?? '{}')
  const shortUrl = json_body.property1
  const url_shortner = new ShortUrl(Config.BASE_URL, daxClient, dynamoDBClient)
  url_shortner.getShortUrl(shortUrl) // send original url

  return HttpResponse.Response(
    JSON.stringify({ message: "Url Shortened successfully!", data: {/* object */ } })
  )
}


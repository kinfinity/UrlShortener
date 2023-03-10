import { DAXClient } from '@aws-sdk/client-dax'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { Context, APIGatewayProxyResult, APIGatewayProxyEvent } from 'aws-lambda'
import { HttpResponse } from '../utils/HttpResponse'
import { ShortUrl } from '../services/shorturl_service'
import { ShortenRequestFilter } from './utils/ShortenRequestFilter'
import { Config } from '../config/config'


export const Shorten = async (event: APIGatewayProxyEvent, context: Context, daxClient: DAXClient, dynamoDBClient: DynamoDBClient): Promise<APIGatewayProxyResult> => {
  // Validate http inputs
  if (!ShortenRequestFilter(event,context)) {
    HttpResponse.Custom(400,"Invalid url") // bad request
  }
  const json_body = JSON.parse(event.body?.toString()?? '{}')
  const longUrl = json_body.property1
  const url_shortner = new ShortUrl(Config.BASE_URL, daxClient, dynamoDBClient)
  url_shortner.getShortUrl(longUrl) // send original url

  return HttpResponse.Response(
    JSON.stringify({ message: "Url Shortened successfully!", data: {/* object */ } })
  )
}
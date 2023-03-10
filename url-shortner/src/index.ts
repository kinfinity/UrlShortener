import { Logger } from './utils/logger'
import { Dax } from './connections/dax'
import { dynamoDBClient } from './connections/dynamodb'
import { Context, APIGatewayProxyResult, APIGatewayEvent } from 'aws-lambda'
import { HttpResponse } from './utils/HttpResponse'
import { IController } from './controllers/IController'
import { GetShortUrl } from './controllers/GrabShortenController'
import { Shorten } from './controllers/ShortenController'

// 
export const lambdaHandler = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {

    Logger.http(`Event: ${JSON.stringify(event, null, 2)}`)
    Logger.http(`Context: ${JSON.stringify(context, null, 2)}`)

    try {
        const method = event.httpMethod
        const path = event.path
        const controllers: { [key: string]: IController } = {
            "/": {
                POST: Shorten,
                GET: GetShortUrl
            }
        }
        const controller = controllers[path][method]
        if (!controller) {
            return HttpResponse.Custom(404, "Not found")
        }
        return controller(event, context, Dax.Client, dynamoDBClient)
    } catch (e: any) {
        Logger.error(`Error: ${e.message}`)
        return HttpResponse.Custom(500, e.message)
    }

}


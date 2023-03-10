import { Context, APIGatewayProxyResult, APIGatewayEvent } from 'aws-lambda'
import { HttpResponse } from './utils/HttpResponse'

// 
export const lambdaHandler = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {

    try {
        const method = event.httpMethod
        const path = event.path

        return HttpResponse.Response("Good start!")
    } catch (e: any) {
        console.error(`Error: ${e.message}`)
        return HttpResponse.Custom(500, e.message)
    }

}


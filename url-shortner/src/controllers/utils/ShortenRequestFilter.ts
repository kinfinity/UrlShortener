import { Context, APIGatewayProxyEvent } from 'aws-lambda'
import * as Joi from "joi"
import { HttpResponse } from '../../utils/HttpResponse'
import { Logger } from '../../utils/logger'

interface ShortenRequestParams {
  url: string // URL - https://url.spec.whatwg.org/#api
}

const ShortenRequestSchema = Joi.object({
  url: Joi.string().required(),
})

class InvalidShortenRequestParamsError extends Error { }

async function validateShortenRequestParams(params: any): Promise<ShortenRequestParams> {
  const result = await ShortenRequestSchema.validateAsync(params, { abortEarly: false })
  if (result.error) {
    Logger.error(result.error)
    throw new InvalidShortenRequestParamsError(result.error.message)
  } else {
    return result.value as ShortenRequestParams
  }
}


export const ShortenRequestFilter = async (event: APIGatewayProxyEvent, context: Context): Promise<Boolean> => {
  // 
  try {
    const params: ShortenRequestParams = await validateShortenRequestParams(JSON.parse(event.body?.toString()?? '{}'))
  } catch (error) {
    if (error instanceof InvalidShortenRequestParamsError) {
      return false
    } else {
      Logger.error(error)
      HttpResponse.Custom(500, "Internal server error" )
      return false 
    }
  }
  return true
}
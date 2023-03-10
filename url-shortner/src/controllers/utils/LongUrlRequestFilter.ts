import { Context, APIGatewayProxyEvent } from 'aws-lambda'
import * as Joi from "joi"
import { Logger } from '../../utils/logger'

interface LongUrlRequestParams {
  shortUrl: string
}

const InvalidLongUrlRequestSchema = Joi.object({
  shortUrl: Joi.string().required(),
})

class InvalidLongUrlRequestParamsError extends Error { }

async function validateLongUrlRequestParams(params: any): Promise<LongUrlRequestParams> {
  const result = await InvalidLongUrlRequestSchema.validateAsync(params, { abortEarly: false })
  if (result.error) {
    throw new InvalidLongUrlRequestParamsError(result.error.message)
  } else {
    return result.value as LongUrlRequestParams
  }
}


export const LongUrlRequestFilter = async (event: APIGatewayProxyEvent, context: Context): Promise<Boolean> => {
  // 
  try {
    const params: LongUrlRequestParams = await validateLongUrlRequestParams(JSON.parse(event.body?.toString()?? '{}'))
    return true
  } catch (error) {
    if (error instanceof InvalidLongUrlRequestParamsError) {
      Logger.error(error.message)
      return false
    } else {
      Logger.error(error)
      return false
    }
  }
}

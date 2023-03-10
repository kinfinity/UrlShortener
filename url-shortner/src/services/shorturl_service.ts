import { DAXClient } from "@aws-sdk/client-dax"
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { GetItemCommand, PutItemCommand, PutItemCommandInput, GetItemCommandInput, PutItemCommandOutput } from '@aws-sdk/client-dynamodb'
import { compute_shortCode, reverse_shortUrl } from '../models/ShortUrl'
import { Logger } from "../utils/logger"

export class ShortUrl {

  private _BASE_URL: string
  private _daxClient: DAXClient
  private _dynamoDBClient: DynamoDBClient

  constructor(BASE_URL: string, daxclient: DAXClient, dynamodbclient: DynamoDBClient) {
    this._BASE_URL = BASE_URL
    // setup db connections
    this._daxClient = daxclient
    this._dynamoDBClient = dynamodbclient
  }

  async getShortUrl(url: URL): Promise<URL> {

    try {
      
      // Check if the long URL is already in DynamoDB
      const existingURL = await this._dynamoDBClient.send(new GetItemCommand({ TableName: 'URLsTable', Key: { longURL: { S: url.toString() } } })) // table name
      
      let shortURL: URL = new URL("")

      if (existingURL.Item?.shortURL?.S) {
        // If the long URL is already in DynamoDB, use the existing short URL
        shortURL = new URL(existingURL.Item.shortURL.S)
        // Save the short URL in the cache (DAX)
        const params: PutItemCommandInput = { TableName: 'URLsTable', Item: { shortURL: { S: shortURL.toString() }, longURL: { S: url.toString() } } }
        const _command = new PutItemCommand(params)
        // await this._daxClient.send(_command)
        return shortURL
      } else {
        // If the long URL is not in DynamoDB, create a new short URL and save it in DynamoDB and DAX
        const shortCode = compute_shortCode(url)
        shortURL = new URL(this._BASE_URL + shortCode)

        const params: PutItemCommandInput = { TableName: 'URLsTable', Item: { shortURL: { S: shortURL.toString() }, longURL: { S: url.toString() } } }
        const _command = new PutItemCommand(params)
    
        await Promise.all([
          // Save the URL mapping in DynamoDB
          this._dynamoDBClient.send(
            new PutItemCommand({ TableName: 'URLsTable', Item: { longURL: { S: url.toString() }, shortURL: { S: shortURL.toString() } } })
          ),

          // Save the URL mapping in the cache (DAX)
          // await this._daxClient.send(_command)
        ])
      }
      return shortURL
    } catch (error) {
      Logger.error(error)
      return new URL("")
    }

  }

  async getUrl(shortURL: URL): Promise<URL>  {
    // Check if the long URL is in the cache (DAX)
    const params: GetItemCommandInput = { TableName: 'URLsTable', Key: { shortURL: { S: shortURL.toString() } } }
    const _command = new GetItemCommand(params)
    // const cachedLongURL = await this._daxClient.send(_command)
    // if (cachedLongURL.Item?.longURL?.S) {
    //   return new URL(cachedLongURL.Item.longURL.S)
    // }
    // Check if the short URL is in DynamoDB
    const existingURL = await this._dynamoDBClient.send(_command)

    if (existingURL.Item?.longURL?.S) {
      // If the short URL is already in DynamoDB, use the existing long URL
      const longURL = existingURL.Item.longURL.S
      const params: PutItemCommandInput = { TableName: 'URLsTable', Item: { shortURL: { S: shortURL.toString() }, longURL: { S: longURL.toString() } } }
      const _command = new PutItemCommand(params)
      // Save the long URL in the cache (DAX)
      // await this._daxClient.send(_command)
      return new URL(longURL)
    } else {
      // If the short URL is not in DynamoDB, return null
      // typically we should not reverse it since we did not shorten it - but let's do that for fun
      return reverse_shortUrl(shortURL)
    }

  }

}

// The Read-Through caching strategy is also known as Lazy Loading.
// Applications using the Read-Through/Lazy Loading caching strategy consider the cache the main database.
// Therefore, when looking up a specific item, the application will hit the cache first
// If the data is not available within the cache, the cache pulls the data from the main database and updates it.
// Data Flow will follow the steps mentioned below:
// - Application searches cache for data.
// - If the application finds the data within the cache, then the cache returns the data to the application.
// - If the application does not find the data within the cache, the cache looks up the data from the database.
// - The database then populates the cache with the data.
// - The eviction policy then ensures that only new data will populate the cache.
// AWS DAX handles this task in three different ways. First, it uses TTL (Time-to-Live) value to decide the maximum lifespan of a specific value within the cache.
// Second, the DAX removes the values stored within the cache by using a Least Recently Used (LRU) algorithm when the cache is full.
// Third, the DAX will remove the old values as new values get written through the DAX using the write-through functionality.

// Scalability. Since DynamoDB runs on AWS infrastructure, users can leverage its scalability to expand storage and performance to store virtually unlimited amounts of data.
// Redundancy. DynamoDB allows users to set up high availability by using AWS's existing features, such as availability zones.
// Includes Free Tier. AWS DynamoDB provides a one-year subscription to their free tier that allows users to use the service for free restrictions do apply, but you can utilize all the credits provided within the free tier before you have to pay for the service.
// Inbuilt Security. DynamoDB provides proven security controls for encryption, authentication, and security for its underlying AWS infrastructure so that you need not have to worry about implementing the essential security controls.

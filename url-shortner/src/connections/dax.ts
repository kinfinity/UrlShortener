import { DAXClient, DAXClientConfig } from '@aws-sdk/client-dax'
import { Config } from "../config/config"

const DaxConfig: DAXClientConfig = {
  region: Config.region,
  endpoint: Config.DAX_ENDPOINT
}



// Initialize the DAX client
const Client: DAXClient = new DAXClient(DaxConfig)

export const Dax = {
  Client
}


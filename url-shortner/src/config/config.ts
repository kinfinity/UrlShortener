import * as dotenv from "dotenv"
import { SecretManager } from "./secrets"

dotenv.config()

const common = {
    environmentName: process.env.NODE_ENVIRONMENT ?? "development",
    logLevel: process.env.LOGLEVEL ?? 'debug',
    region: process.env.REGION ?? "us-east-2",
    BASE_URL: process.env.BASE_URL ?? ""
}

// environment specific configs for lambda
// alternatively the configs could be added through a lambda layer or second Docker wrap
const development = {
    ...SecretManager.getSecret("dev/UrlShortner/DBSecrets")
}

// Define environment(s) into a Map
const configMap = new Map()
configMap.set('development', development)

const env = process.env.NODE_ENVIRONMENT ? process.env.NODE_ENVIRONMENT : 'development'
const envConfig = configMap.get(env)

// merge common and env specific config
const Config = {
    ...common,
    ...envConfig
}

console.info(`Config: ${JSON.stringify(Config)}`)

export { Config }

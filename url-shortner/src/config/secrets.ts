import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager"

const client = new SecretsManagerClient({ region: process.env.REGION ?? "us-east-2" })

async function getSecret(SecretId: string) {
  try {
    const command = new GetSecretValueCommand({ SecretId: SecretId })
    const response = await client.send(command)

    if (response.SecretString !== undefined) {
      return response.SecretString
    } else if (response.SecretBinary !== undefined) {
      const buff = Buffer.from(response.SecretBinary)
      return buff.toString("ascii")
    } else {
      throw new Error("Secret is empty")
    }
  } catch (error) {
    console.error(error)
  }
}

export const SecretManager = {
  getSecret
}
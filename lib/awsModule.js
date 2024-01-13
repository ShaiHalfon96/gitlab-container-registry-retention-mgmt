const {
  SecretsManagerClient,
  GetSecretValueCommand,
} = require("@aws-sdk/client-secrets-manager");
const {CreateSecretManagerClientError, GetSecretValueError} = require("../errors/appError")

class SecretManagerIntegrartion {
  constructor() {
    // Initialize AWS SDK with the region
    this.client;

    try {
      this.client = new SecretsManagerClient();
    } catch (error) {
      throw new CreateSecretManagerClientError(error);
    }
  }
  async getSecret(secret_name) {
    let response;

    try {
      response = await this.client.send(
        new GetSecretValueCommand({
          SecretId: secret_name,
          VersionStage: "AWSCURRENT", // VersionStage defaults to AWSCURRENT if unspecified
        })
      );
    } catch (error) {
      throw new GetSecretValueError(error);
    }
    return response.SecretString;
  }
}
module.exports = SecretManagerIntegrartion;
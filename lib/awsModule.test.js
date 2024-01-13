const { default: expect } = require("expect");
const SecretManagerIntegrartion = require("./awsModule");

test('should retrun an AWS secret value', async () => {
  const secretName = "<aws-secret-name>";
  const secretManagerInstance = new SecretManagerIntegrartion();
  const secertValue = await secretManagerInstance.getSecret(secretName);
  expect(secertValue).toBeDefined();
});
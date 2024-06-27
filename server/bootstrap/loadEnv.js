"use strict";

const {
  GetSecretValueCommand,
  SecretsManagerClient,
} = require("@aws-sdk/client-secrets-manager");
const client = new SecretsManagerClient({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

exports.loadKeys = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const secretsProperties = ["rds!db-2c1e61ba-bfee-4cc2-be3a-281e4e98b4a3"];
      for (const secretsProperty of secretsProperties) {
        const latestSecret = await client.send(
          new GetSecretValueCommand({
            SecretId: secretsProperty,
          })
        );
        if(secretsProperty === 'rds!db-2c1e61ba-bfee-4cc2-be3a-281e4e98b4a3') {
          const secrets = JSON.parse(latestSecret['SecretString']);
          process.env['DBUSER'] = secrets.username
          process.env['DBPASS'] = secrets.password
        } else {
          process.env[secretsProperty] = latestSecret['SecretString'];
        }
       
      }
      resolve(true);
    } catch (e) {
      reject(e);
    }
  });
};

import { AdminDeleteUserCommand } from '@aws-sdk/client-cognito-identity-provider';

export function createCognitoIdentityAdmin({ client, userPoolId }) {
  if (!client?.send || !userPoolId) throw new TypeError('Cognito admin client and user pool are required');
  return {
    async deleteUser(providerSubject) {
      if (!providerSubject) throw new TypeError('provider subject is required');
      await client.send(new AdminDeleteUserCommand({ UserPoolId: userPoolId, Username: providerSubject }));
    },
  };
}

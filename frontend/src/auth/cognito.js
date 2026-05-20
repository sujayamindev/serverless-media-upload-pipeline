import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserAttribute,
} from 'amazon-cognito-identity-js';

const UserPoolId = import.meta.env.VITE_COGNITO_USER_POOL_ID;
const ClientId = import.meta.env.VITE_COGNITO_CLIENT_ID;

if (!UserPoolId) throw new Error('VITE_COGNITO_USER_POOL_ID is not set.');
if (!ClientId) throw new Error('VITE_COGNITO_CLIENT_ID is not set.');

const userPool = new CognitoUserPool({ UserPoolId, ClientId });

export function getCurrentUser() {
  return userPool.getCurrentUser();
}

export function signUp(email, password) {
  return new Promise((resolve, reject) => {
    const attributes = [new CognitoUserAttribute({ Name: 'email', Value: email })];
    userPool.signUp(email, password, attributes, null, (err, result) => {
      if (err) return reject(err);
      resolve(result.user);
    });
  });
}

export function confirmSignUp(email, code) {
  return new Promise((resolve, reject) => {
    const cognitoUser = new CognitoUser({ Username: email, Pool: userPool });
    cognitoUser.confirmRegistration(code, true, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
}

export function signIn(email, password) {
  return new Promise((resolve, reject) => {
    const cognitoUser = new CognitoUser({ Username: email, Pool: userPool });
    const authDetails = new AuthenticationDetails({ Username: email, Password: password });
    cognitoUser.authenticateUser(authDetails, {
      onSuccess: (session) => resolve({ user: cognitoUser, session }),
      onFailure: (err) => reject(err),
    });
  });
}

export function signOut() {
  return new Promise((resolve) => {
    const cognitoUser = userPool.getCurrentUser();
    if (!cognitoUser) {
      resolve();
      return;
    }
    cognitoUser.globalSignOut({
      onSuccess: () => resolve(),
      onFailure: () => {
        // Even on network failure, clear local state
        cognitoUser.signOut();
        resolve();
      },
    });
  });
}

export function getAccessToken() {
  return new Promise((resolve, reject) => {
    const cognitoUser = userPool.getCurrentUser();
    if (!cognitoUser) return reject(new Error('No authenticated user'));
    cognitoUser.getSession((err, session) => {
      if (err) return reject(err);
      if (!session || !session.isValid()) {
        return reject(new Error('Session is not valid'));
      }
      resolve(session.getAccessToken().getJwtToken());
    });
  });
}

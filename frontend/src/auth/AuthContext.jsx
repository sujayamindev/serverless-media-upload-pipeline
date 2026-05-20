import { useEffect, useState, useCallback } from 'react';
import * as cognito from './cognito';
import { AuthContext } from './context';

export { AuthContext };

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const cognitoUser = cognito.getCurrentUser();

    if (!cognitoUser) {
      Promise.resolve().then(() => {
        if (!active) return;
        setUser(null);
        setIsLoading(false);
      });
    } else {
      cognitoUser.getSession((err, session) => {
        if (!active) return;
        if (err || !session || !session.isValid()) {
          setUser(null);
        } else {
          setUser({
            username: cognitoUser.getUsername(),
            sub: session.getIdToken().payload.sub,
            email: session.getIdToken().payload.email,
          });
        }
        setIsLoading(false);
      });
    }

    return () => { active = false; };
  }, []);

  const refreshUser = useCallback(() => {
    const cognitoUser = cognito.getCurrentUser();
    if (!cognitoUser) {
      setUser(null);
      return;
    }
    cognitoUser.getSession((err, session) => {
      if (err || !session || !session.isValid()) {
        setUser(null);
      } else {
        setUser({
          username: cognitoUser.getUsername(),
          sub: session.getIdToken().payload.sub,
          email: session.getIdToken().payload.email,
        });
      }
    });
  }, []);

  const signIn = useCallback(async (email, password) => {
    await cognito.signIn(email, password);
    refreshUser();
  }, [refreshUser]);

  const signUp = useCallback((email, password) => {
    return cognito.signUp(email, password);
  }, []);

  const confirmSignUp = useCallback((email, code) => {
    return cognito.confirmSignUp(email, code);
  }, []);

  const signOut = useCallback(() => {
    cognito.signOut();
    setUser(null);
  }, []);

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    signIn,
    signUp,
    confirmSignUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

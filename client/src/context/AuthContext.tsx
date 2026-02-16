import { createContext, useContext, useMemo, useState } from 'react';

type AuthContextValue = { token: string | null; role: string | null; login: (t: string, r: string) => void; logout: () => void };
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [role, setRole] = useState<string | null>(localStorage.getItem('role'));

  const value = useMemo(
    () => ({
      token,
      role,
      login: (t: string, r: string) => {
        setToken(t);
        setRole(r);
        localStorage.setItem('token', t);
        localStorage.setItem('role', r);
      },
      logout: () => {
        setToken(null);
        setRole(null);
        localStorage.clear();
      },
    }),
    [token, role],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('AuthProvider missing');
  return ctx;
};

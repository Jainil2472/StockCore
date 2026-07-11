import { createContext, useContext, useState, useEffect } from 'react';

// 1. Create the context
const AuthContext = createContext(null);

// 2. Provider component — wraps your entire app
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);       // stores { token, role, companyId }
  const [isLoading, setIsLoading] = useState(true); // prevents flash of wrong UI on refresh

  // On app start, check if token already exists in localStorage
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const companyId = localStorage.getItem("companyId");

    if (token) {
      setUser({ token, role, companyId }); // restore user session
    }

    setIsLoading(false); // done checking
  }, []);

  // Call this after successful login
  const login = (data) => {
    localStorage.setItem("token", data.token);
    localStorage.setItem("role", data.role);
    localStorage.setItem("companyId", data.companyId);
    setUser({ token: data.token, role: data.role, companyId: data.companyId });
  };

  // Call this on logout
  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

// 3. Custom hook — use this anywhere instead of localStorage directly
export const useAuth = () => useContext(AuthContext);
import React, { createContext, useContext, useState } from "react";

// Dummy initial state for demonstration
const initialUser = {
  isLoggedIn: false,
  isAdmin: false,
  name: "",
  photoUrl: "",
};

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(initialUser);

  // Replace with real Appwrite auth logic
  const login = () => setUser({ ...user, isLoggedIn: true, name: "Asha", photoUrl: "", isAdmin: false });
  const logout = () => setUser(initialUser);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
} 
import React from "react";
import { AuthProvider } from "./context/AuthContext";
import { PlacesProvider } from "./context/PlacesContext";
import Home from "./pages/Home";

function App() {
  return (
    <AuthProvider>
      <PlacesProvider>
        <Home />
      </PlacesProvider>
    </AuthProvider>
  );
}

export default App;

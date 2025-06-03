import React, { createContext, useState, useEffect, useContext, useMemo } from 'react';
import { jwtDecode } from 'jwt-decode'; 

export const AuthContext = createContext(null); 
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false); 

  const decodeAndSetUser = (token) => {
    if (!token) {
      setUser(null);
      setIsSideMenuOpen(false);
      return;
    }
    try {
      const decodedToken = jwtDecode(token);
      if (decodedToken.exp * 1000 < Date.now()) {
        console.warn("Термін дії токена закінчився. Виходимо з системи.");
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('companyName'); 
        setUser(null);
        setIsSideMenuOpen(false);
        return;
      }
      setUser({
        token: token,
        role: decodedToken.role || decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'],
        email: decodedToken.email,
        userId: decodedToken.nameid,
      });
      setIsSideMenuOpen(true); 
    } catch (error) {
      console.error("Помилка розшифровки токена:", error);
      localStorage.removeItem('jwtToken');
      localStorage.removeItem('companyName');
      setUser(null);
      setIsSideMenuOpen(false); 
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    const storedCompanyName = localStorage.getItem('companyName');
    if (token) {
      decodeAndSetUser(token);
      if (storedCompanyName) {
        setUser(prevUser => ({
          ...prevUser,
          companyName: storedCompanyName
        }));
      }
    }
    setLoading(false);
  }, []);

  const login = (token, companyName) => {
    localStorage.setItem('jwtToken', token);
    localStorage.setItem('companyName', companyName);
    decodeAndSetUser(token);

    setUser(prevUser => ({
      ...prevUser,
      companyName: companyName
    }));
    setIsSideMenuOpen(true); 
  };

  const logout = () => {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('registeringUserId');
    localStorage.removeItem('companyName');
    setUser(null); 
    setIsSideMenuOpen(false);
    console.log("AuthContext: logout() викликано."); 
    console.log("AuthContext: user після logout:", null); 
  };

  const toggleSideMenu = () => { 
    setIsSideMenuOpen(prev => !prev);
  };

  const authValue = useMemo(() => ({
    user,
    isAuthenticated: !!user?.token,
    userRole: user?.role,
    companyName: user?.companyName,
    login,
    logout,
    loading,
    isSideMenuOpen,    
    setIsSideMenuOpen,  
    toggleSideMenu      
  }), [user, loading, isSideMenuOpen]); 

  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth повинен використовуватися всередині AuthProvider');
  }
  return context;
};
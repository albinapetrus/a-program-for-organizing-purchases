// src/contexts/AuthContext.js

import React, { createContext, useState, useEffect, useContext, useMemo } from 'react';
import { jwtDecode } from 'jwt-decode'; 

// ЗМІНЮЄМО ЦЕЙ РЯДОК:
// Було: const AuthContext = createContext(null);
// Стало: export const AuthContext = createContext(null);
export const AuthContext = createContext(null); // <--- Ось тут додаємо 'export'


export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false); // ДОДАНО: Стан для сайд-меню

  const decodeAndSetUser = (token) => {
    if (!token) {
      setUser(null);
      setIsSideMenuOpen(false); // Закриваємо меню при виході
      return;
    }
    try {
      const decodedToken = jwtDecode(token);
      if (decodedToken.exp * 1000 < Date.now()) {
        console.warn("Термін дії токена закінчився. Виходимо з системи.");
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('companyName'); 
        setUser(null);
        setIsSideMenuOpen(false); // Закриваємо меню при виході
        return;
      }
      setUser({
        token: token,
        role: decodedToken.role || decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'],
        email: decodedToken.email,
        userId: decodedToken.nameid,
        //companyName: decodedToken.companyName || '' // Припускаємо, що companyName може бути в токені
      });
      // Можливо, автоматично відкриваємо сайд-меню при успішному логіні
      // Якщо сайд-меню має бути завжди відкритим для залогінених користувачів
      setIsSideMenuOpen(true); 
    } catch (error) {
      console.error("Помилка розшифровки токена:", error);
      localStorage.removeItem('jwtToken');
      localStorage.removeItem('companyName');
      setUser(null);
      setIsSideMenuOpen(false); // Закриваємо меню при помилці токена
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
    // Після успішного логіну можна відразу відкрити сайд-меню
    setIsSideMenuOpen(true); 
  };

  const logout = () => {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('registeringUserId');
    localStorage.removeItem('companyName');
    setUser(null); // Це призводить до оновлення `isAuthenticated`
    setIsSideMenuOpen(false);
    console.log("AuthContext: logout() викликано."); // <-- Додайте цей лог
    console.log("AuthContext: user після logout:", null); // <-- І цей лог
  };

  const toggleSideMenu = () => { // ДОДАНО: Функція для перемикання стану сайд-меню
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
    isSideMenuOpen,      // ДОДАНО: Передаємо стан сайд-меню
    setIsSideMenuOpen,   // ДОДАНО: Передаємо функцію для прямого керування
    toggleSideMenu       // ДОДАНО: Передаємо функцію для перемикання
  }), [user, loading, isSideMenuOpen]); // Додаємо isSideMenuOpen до залежностей useMemo

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
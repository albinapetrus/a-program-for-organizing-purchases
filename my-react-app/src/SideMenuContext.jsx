import { createContext, useState } from "react";

export const SideMenuContext = createContext();

export function SideMenuProvider({ children }) {
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [isRegistered, setIsRegistered] = useState(localStorage.getItem('isRegistered') === 'true');

  // Функція для виходу
  const handleExit = () => {
    localStorage.setItem('isRegistered', 'false');
    setIsSideMenuOpen(false);
    setIsRegistered(false);  // змінюємо статус на незареєстрований
  };
  const [companyName, setCompanyName] = useState('');

  const handleCompanyNameChange = (name) => {
    setCompanyName(name);
  };

  return (
    <SideMenuContext.Provider value={{isSideMenuOpen, 
      setIsSideMenuOpen, 
      handleExit, // додаємо handleExit
      isRegistered,
      setIsRegistered,
      companyName, // передаємо назву компанії в контекст
      handleCompanyNameChange,}}>
      {children}
    </SideMenuContext.Provider>
  );
}

import { useContext } from 'react';
import { SideMenuContext } from '../SideMenuContext';
import { useNavigate } from 'react-router-dom';
import classes from "./SideMenu.module.css"

function ExitButton() {
  const { handleExit } = useContext(SideMenuContext); // Використовуємо функцію з контексту
  const navigate = useNavigate();

  const handleLogout = () => {
    handleExit();  // Викликаємо функцію виходу з контексту
    navigate('/');  // Перенаправляємо на головну сторінку
  };

  return (
    <button onClick={handleLogout} className={classes.exit} style={{ backgroundColor: "#fff" }}>Вийти</button>
  );
}

export default ExitButton;

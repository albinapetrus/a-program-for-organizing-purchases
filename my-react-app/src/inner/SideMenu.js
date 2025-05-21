

import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { IoMdMenu } from "react-icons/io";
import classes from "./SideMenu.module.css";
import { IoHomeOutline } from "react-icons/io5";
import { CiBookmarkPlus } from "react-icons/ci";
import { IoIosSearch } from "react-icons/io";
import { MdOutlineNotifications } from "react-icons/md";
import { RxExit } from "react-icons/rx";
import { MdOutlineEventNote } from "react-icons/md";
import { LuBriefcaseBusiness } from "react-icons/lu";
import { LuNotebookPen } from "react-icons/lu";
import ExitButton from './ExitButton'; 
import { Link, useNavigate } from 'react-router-dom';
// import { SideMenuContext } from "../SideMenuContext"; // <<< ВИДАЛІТЬ ЦЕЙ РЯДОК


import { useAuth } from '../context/AuthContext'; // <<< ОБОВ'ЯЗКОВО ІМПОРТУЙТЕ ЦЕЙ РЯДОК!
                                                    // Перевірте шлях: '../../contexts/AuthContext'
                                                    // якщо SideMenu знаходиться в src/inner, то дві крапки.
                                                    // якщо SideMenu знаходиться в src/components/SideMenu,
                                                    // то також дві крапки, бо contexts на рівні src/components.


function SideMenu() {
  const [show, setShow] = useState(false);
 const navigate = useNavigate();
  // !!! ОТРИМУЄМО ВСІ НЕОБХІДНІ ДАНІ З AuthContext !!!
  const { userRole, companyName, isAuthenticated, logout, loading } = useAuth(); // <<< КЛЮЧОВА ЗМІНА

  // const role = localStorage.getItem('role'); // <<< ВИДАЛІТЬ ЦЕЙ РЯДОК
  // const { companyName} = useContext(SideMenuContext); // <<< ВИДАЛІТЬ ЦЕЙ РЯДОК

  const toggleMenu = () => setShow(!show);

  // !!! ЛОГІКА, ЯКА ПРИХОВУЄ МЕНЮ, ЯКЩО КОРИСТУВАЧ НЕ АВТЕНТИФІКОВАНИЙ !!!
  // Якщо AuthContext ще завантажується або користувач не залогінений, то меню не показуємо
  if (loading || !isAuthenticated) {
    return null; // Нічого не рендеримо
  }
 const handleLogout = () => {
    logout(); // Викликаємо функцію logout з AuthContext, яка очищує токени
    navigate('/'); // <--- Перенаправляємо на головну сторінку
    setShow(false); // Закриваємо сайд-меню після виходу
  };
  // Якщо користувач залогінений, рендеримо меню
  return (
    <>
      <button className={classes.menu_button} onClick={toggleMenu}>
        {show ? "" : <IoMdMenu />}
      </button>

      <div className={`offcanvas offcanvas-start ${show ? "show" : ""}`} tabIndex="-1" style={{ visibility: show ? "visible" : "hidden", backgroundColor: "#fff", maxWidth: "260px" }}>
        <div className="offcanvas-header" style={{ backgroundColor: "#fff" }}>
          <h4 className="label10" style={{
            color: "orange",
            padding: "0.5em",
            fontWeight: "bold",
            fontSize: "1.5em",
            background: "white",
          }}>UkrainianTrading</h4>
          <button type="button" className="btn-close" style={{ fontSize: "0.5em", margin: "0.5em" }} onClick={toggleMenu}></button>
        </div>
        <div className="offcanvas-body" style={{ backgroundColor: "#fff" }}>
          {/* Використовуємо userRole з AuthContext */}
          {userRole === 'supplier' ? (
            <>
              <ul style={{ backgroundColor: "#fff" }} className={classes.list}>
                <li style={{ backgroundColor: "#fff" }}><p style={{ backgroundColor: "#fff", fontWeight: "bold", }}> Назва моєї компанії: {companyName || "Не вказано"}</p></li> {/* Використовуємо companyName з AuthContext */}
                <li style={{ backgroundColor: "#fff" }} className={classes.li}><a href="#" style={{ backgroundColor: "#fff" }}><IoHomeOutline className={classes.icon} />Кабінет</a></li>
                <li style={{ backgroundColor: "#fff" }} className={classes.li}><a href="#" style={{ backgroundColor: "#fff" }}><CiBookmarkPlus className={classes.icon} /> Мої заявки</a></li>
                <li style={{ backgroundColor: "#fff" }} className={classes.li}><a href="#" style={{ backgroundColor: "#fff" }}><IoIosSearch className={classes.icon} />Знайти закупівлю</a></li>
                <li style={{ backgroundColor: "#fff" }} className={classes.li}><a href="#" style={{ backgroundColor: "#fff" }}><MdOutlineNotifications className={classes.icon} />Сповіщення</a></li>
              </ul>
            </>
          ) : userRole === 'customer' ? (
            <>
              <ul style={{ backgroundColor: "#fff" }} className={classes.list}>
                <li style={{ backgroundColor: "#fff" }}><p style={{ backgroundColor: "#fff", fontWeight: "bold", }}> Назва моєї компанії: {companyName}</p></li> {/* Використовуємо companyName з AuthContext */}
                <li style={{ backgroundColor: "#fff" }} className={classes.li}><Link to="/cabinetCust" style={{ backgroundColor: "#fff" }}><IoHomeOutline className={classes.icon} />Кабінет</Link></li>
                <li style={{ backgroundColor: "#fff" }} className={classes.li}><Link to="/newOne" style={{ backgroundColor: "#fff" }}><LuNotebookPen className={classes.icon} />Зареєструвати за...</Link></li>
                <li style={{ backgroundColor: "#fff" }} className={classes.li}><Link to="/myPurch" style={{ backgroundColor: "#fff" }}><MdOutlineEventNote className={classes.icon} />Мої закупівлі</Link></li>
                <li style={{ backgroundColor: "#fff" }} className={classes.li}><a href="#" style={{ backgroundColor: "#fff" }}><LuBriefcaseBusiness className={classes.icon} />Пропозиції</a></li>
                <li style={{ backgroundColor: "#fff" }} className={classes.li}><a href="#" style={{ backgroundColor: "#fff" }}><MdOutlineNotifications className={classes.icon} />Сповіщення</a></li>
              </ul>
            </>
          ) : null} {/* Якщо роль не customer і не supplier, нічого не показуємо */}

          <p style={{ backgroundColor: "#fff" }} className={classes.help}>Служба підтримки<br />
            0-800-503-400</p>
          {/* !!! КНОПКА ВИХОДУ ТЕПЕР ВИКЛИКАЄ logout З AuthContext !!! */}
          <button style={{ backgroundColor: "#fff" }} className={classes.exit} onClick={handleLogout}> {/* <<< ЗМІНА ТУТ */}
            <RxExit className={classes.icon} />
            {/* <ExitButton /> */} {/* <<< ЦЕЙ КОМПОНЕНТ МОЖНА ВИДАЛИТИ, АБО ЗМІНИТИ ЙОГО, ЩОБ ВІН ОТРИМУВАВ logout */}
            <span style={{ backgroundColor: "#fff" }}>Вихід</span> {/* Додайте текст, якщо ExitButton видалено */}
          </button>
        </div>
      </div>
    </>
  );
}

export default SideMenu;

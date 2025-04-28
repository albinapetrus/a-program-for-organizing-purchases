import { useState, useContext } from "react";
import "bootstrap/dist/css/bootstrap.min.css"; 
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { IoMdMenu } from "react-icons/io";
import classes from "./SideMenu.module.css"
import { IoHomeOutline } from "react-icons/io5";
import { CiBookmarkPlus } from "react-icons/ci";
import { IoIosSearch } from "react-icons/io";
import { MdOutlineNotifications } from "react-icons/md";
import { RxExit } from "react-icons/rx";
import { MdOutlineEventNote } from "react-icons/md";
import { LuBriefcaseBusiness } from "react-icons/lu";
import { LuNotebookPen } from "react-icons/lu";
import ExitButton from './ExitButton';
import { SideMenuContext } from "../SideMenuContext";
import { Link } from 'react-router-dom'; 

function SideMenu() {


  const [show, setShow] = useState(false);
  const role = localStorage.getItem('role');
  const { companyName} = useContext(SideMenuContext);
  const toggleMenu = () => setShow(!show);

  return (
    <>
      <button className={classes.menu_button} onClick={toggleMenu}>
        {show ? "" : <IoMdMenu/>}
      </button>

      <div className={`offcanvas offcanvas-start ${show ? "show" : ""}`} tabIndex="-1" style={{ visibility: show ? "visible" : "hidden", backgroundColor: "#fff",maxWidth: "260px" } }>
        <div className="offcanvas-header" style={{ backgroundColor: "#fff" }}>
          <h4 className="label10"  style={{
    color: "orange",
    padding: "0.5em",
    fontWeight: "bold",
    fontSize: "1.5em",
    background: "white",
  }}>UkrainianTrading</h4>
          <button type="button" className="btn-close" style={{fontSize:"0.5em", margin:"0.5em"}} onClick={toggleMenu}></button>
        </div>
        <div className="offcanvas-body" style={{ backgroundColor: "#fff" }}>
        {role === 'supplier' ? (
              <>
          <ul style={{ backgroundColor: "#fff" }} className={classes.list}>
            <li style={{ backgroundColor: "#fff" }}><p style={{ backgroundColor: "#fff",   fontWeight: "bold", }}> Назва моєї компанії: {companyName || "Не вказано"}</p></li>
            <li style={{ backgroundColor: "#fff" }}  className={classes.li}><a href="#" style={{ backgroundColor: "#fff" }}><IoHomeOutline className={classes.icon}/>Кабінет</a></li>
            <li style={{ backgroundColor: "#fff" }}  className={classes.li}><a href="#" style={{ backgroundColor: "#fff" }}><CiBookmarkPlus className={classes.icon}/> Мої заявки</a></li>
            <li style={{ backgroundColor: "#fff" }}  className={classes.li}><a href="#" style={{ backgroundColor: "#fff" }}><IoIosSearch className={classes.icon}/>Знайти закупівлю</a></li>
            <li style={{ backgroundColor: "#fff" }}  className={classes.li}><a href="#" style={{ backgroundColor: "#fff" }}><MdOutlineNotifications className={classes.icon}/>Сповіщення</a></li>            
          </ul>
          </>) : role === 'customer' ? (<>
            <ul style={{ backgroundColor: "#fff" }} className={classes.list}>
            <li style={{ backgroundColor: "#fff" }}><p style={{ backgroundColor: "#fff",   fontWeight: "bold", }}> Назва моєї компанії: {companyName }</p></li>
            <li style={{ backgroundColor: "#fff" }}  className={classes.li}><a href="#" style={{ backgroundColor: "#fff" }}><IoHomeOutline className={classes.icon}/>Кабінет</a></li>
            <li style={{ backgroundColor: "#fff" }}  className={classes.li}><Link to="/newOne" style={{ backgroundColor: "#fff" }}><LuNotebookPen   className={classes.icon}/>Зареєструвати за...</Link></li>
            <li style={{ backgroundColor: "#fff" }}  className={classes.li}><Link to="/myPurch"style={{ backgroundColor: "#fff" }}><MdOutlineEventNote  className={classes.icon}/>Мої закупівлі</Link></li>
            <li style={{ backgroundColor: "#fff" }}  className={classes.li}><a href="#" style={{ backgroundColor: "#fff" }}><LuBriefcaseBusiness className={classes.icon}/>Пропозиції</a></li>
            <li style={{ backgroundColor: "#fff" }}  className={classes.li}><a href="#" style={{ backgroundColor: "#fff" }}><MdOutlineNotifications className={classes.icon}/>Сповіщення</a></li>            
          </ul>
            </>)
             : null}

          <p style={{ backgroundColor: "#fff" }} className={classes.help}>Служба підтримки<br/>
          0-800-503-400</p>
          <button style={{ backgroundColor: "#fff" }} className={classes.exit}><RxExit className={classes.icon}/><ExitButton  /></button>
        </div>
      </div>
    </>
  );
}

export default SideMenu;

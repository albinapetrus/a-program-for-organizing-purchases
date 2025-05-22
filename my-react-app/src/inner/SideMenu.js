import { useState, useEffect } from "react"; // Додаємо useEffect
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
// ExitButton можна видалити, якщо його функціонал повністю перенесено в handleLogout
// import ExitButton from './ExitButton';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios'; // Імпортуємо axios для HTTP-запитів

// НЕ ВИКОРИСТОВУЄМО AuthContext напряму в цьому варіанті
// import { useAuth } from '../context/AuthContext';


function SideMenu() {
    const [show, setShow] = useState(false);
    const navigate = useNavigate();

    // Стан для даних користувача, що завантажуються безпосередньо в цьому компоненті
    const [userRole, setUserRole] = useState(null);
    const [companyName, setCompanyName] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true); // Стан завантаження даних профілю

    const toggleMenu = () => setShow(!show);

    // Функція для отримання даних профілю користувача з бекенду
    const fetchUserProfile = async () => {
        setLoading(true); // Починаємо завантаження
        const jwtToken = localStorage.getItem('jwtToken');

        if (!jwtToken) {
            setIsAuthenticated(false);
            setUserRole(null);
            setCompanyName(null);
            setLoading(false);
            return;
        }

        try {
            const response = await axios.get('/api/users/profile', {
                headers: {
                    'Authorization': `Bearer ${jwtToken}`
                }
            });

            const userData = response.data;
            setUserRole(userData.role);
            setCompanyName(userData.companyName);
            setIsAuthenticated(true);
        } catch (error) {
            console.error('Помилка завантаження профілю в SideMenu:', error.response ? error.response.data : error.message);
            // Якщо токен недійсний або є помилка, очищаємо дані та вважаємо користувача неавтентифікованим
            localStorage.removeItem('jwtToken');
            localStorage.removeItem('role'); // Очищаємо, якщо раніше зберігали
            localStorage.removeItem('companyName'); // Очищаємо, якщо раніше зберігали
            setIsAuthenticated(false);
            setUserRole(null);
            setCompanyName(null);
            // Можливо, перенаправити на сторінку логіну, якщо це критично
            // navigate('/form');
        } finally {
            setLoading(false); // Завершуємо завантаження
        }
    };

    // useEffect для завантаження даних при монтуванні компонента
    useEffect(() => {
        fetchUserProfile();

        // Додаємо слухача для подій localStorage, щоб оновлювати меню,
        // якщо логін/виход відбувся в іншій вкладці або через інші компоненти
        const handleStorageChange = () => {
            fetchUserProfile();
        };
        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []); // Пустий масив залежностей означає, що ефект запускається один раз при монтуванні

    // Функція для обробки виходу з системи
    const handleLogout = () => {
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('role');
        localStorage.removeItem('companyName');
        localStorage.removeItem('registeringUserId'); // Якщо використовується
        setIsAuthenticated(false); // Оновлюємо стан в цьому компоненті
        setUserRole(null);
        setCompanyName(null);
        navigate('/'); // Перенаправляємо на головну сторінку
        setShow(false); // Закриваємо сайд-меню після виходу
    };

    // Якщо дані ще завантажуються або користувач не залогінений, то меню не показуємо
    if (loading || !isAuthenticated) {
        return null; // Нічого не рендеримо
    }

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
                    {/* Використовуємо userRole, отриманий безпосередньо цим компонентом */}
                    {userRole === 'supplier' ? (
                        <>
                            <ul style={{ backgroundColor: "#fff" }} className={classes.list}>
                                {/* Відображаємо назву компанії, отриману безпосередньо цим компонентом */}
                                <li style={{ backgroundColor: "#fff" }}><p style={{ backgroundColor: "#fff", fontWeight: "bold", }}> Назва моєї компанії: {companyName || "Не вказано"}</p></li>
                                <li style={{ backgroundColor: "#fff" }} className={classes.li}><a href="#" style={{ backgroundColor: "#fff" }}><IoHomeOutline className={classes.icon} />Кабінет</a></li>
                                <li style={{ backgroundColor: "#fff" }} className={classes.li}>< Link to="/myoffers" style={{ backgroundColor: "#fff" }}><CiBookmarkPlus className={classes.icon} /> Мої заявки</Link></li>
                                <li style={{ backgroundColor: "#fff" }} className={classes.li}><Link to="/ProcurementSearch" style={{ backgroundColor: "#fff" }}><IoIosSearch className={classes.icon} />Знайти закупівлю</Link></li>
                                <li style={{ backgroundColor: "#fff" }} className={classes.li}><a href="#" style={{ backgroundColor: "#fff" }}><MdOutlineNotifications className={classes.icon} />Сповіщення</a></li>
                            </ul>
                        </>
                    ) : userRole === 'customer' ? (
                        <>
                            <ul style={{ backgroundColor: "#fff" }} className={classes.list}>
                                {/* Відображаємо назву компанії, отриману безпосередньо цим компонентом */}
                                <li style={{ backgroundColor: "#fff" }}><p style={{ backgroundColor: "#fff", fontWeight: "bold", }}> Назва моєї компанії: {companyName || "Не вказано"}</p></li>
                                <li style={{ backgroundColor: "#fff" }} className={classes.li}><Link to="/cabinetCust" style={{ backgroundColor: "#fff" }}><IoHomeOutline className={classes.icon} />Кабінет</Link></li>
                                <li style={{ backgroundColor: "#fff" }} className={classes.li}><Link to="/newOne" style={{ backgroundColor: "#fff" }}><LuNotebookPen className={classes.icon} />Зареєструвати за...</Link></li>
                                <li style={{ backgroundColor: "#fff" }} className={classes.li}><Link to="/myprocurements" style={{ backgroundColor: "#fff" }}><MdOutlineEventNote className={classes.icon} />Мої закупівлі</Link></li>
                                <li style={{ backgroundColor: "#fff" }} className={classes.li}>
    <Link to="customeroffers" style={{ backgroundColor: "#fff" }}>
        <LuBriefcaseBusiness className={classes.icon} />Пропозиції
    </Link>
</li>
                                <li style={{ backgroundColor: "#fff" }} className={classes.li}><a href="#" style={{ backgroundColor: "#fff" }}><MdOutlineNotifications className={classes.icon} />Сповіщення</a></li>
                            </ul>
                        </>
                    ) : null} {/* Якщо роль не customer і не supplier, нічого не показуємо */}

                    <p style={{ backgroundColor: "#fff" }} className={classes.help}>Служба підтримки<br />
                        0-800-503-400</p>
                    {/* Кнопка виходу, яка викликає handleLogout */}
                    <button style={{ backgroundColor: "#fff" }} className={classes.exit} onClick={handleLogout}>
                        <RxExit className={classes.icon} />
                        <span style={{ backgroundColor: "#fff" }}>Вихід</span>
                    </button>
                </div>
            </div>
        </>
    );
}

export default SideMenu;
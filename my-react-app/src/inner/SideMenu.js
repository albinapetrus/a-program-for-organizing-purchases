import { useState, useEffect } from "react";
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
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios'; // Імпортуємо axios для HTTP-запитів

// !!! ВАЖЛИВО: Імпортуємо useAuth з вашого AuthContext !!!
import { useAuth } from '../context/AuthContext';


function SideMenu() {
    const [show, setShow] = useState(false);
    const navigate = useNavigate();

    // !!! ОТРИМУЄМО СТАН ТА ФУНКЦІЇ З AUTHCONTEXT !!!
    // Використовуємо 'user' з AuthContext для отримання ролі та назви компанії
    const { logout, user, isAuthenticated, loading } = useAuth();

    // Локальні стани для даних профілю, які можуть бути відсутні в токені або вимагати додаткового запиту
    // Ініціалізуємо їх з user з AuthContext, якщо доступно, інакше null
    const [localUserRole, setLocalUserRole] = useState(user?.role || null);
    const [localCompanyName, setLocalCompanyName] = useState(user?.companyName || null);
    const [profileLoading, setProfileLoading] = useState(false); // Стан завантаження даних профілю з API

    const toggleMenu = () => setShow(!show);

    // Функція для отримання даних профілю користувача з бекенду (якщо вони не повністю містяться в токені)
    const fetchUserProfile = async () => {
        // Завантажуємо дані профілю, тільки якщо користувач автентифікований
        if (!isAuthenticated) {
            setLocalUserRole(null);
            setLocalCompanyName(null);
            return;
        }

        setProfileLoading(true); // Починаємо завантаження профілю
        const jwtToken = localStorage.getItem('jwtToken'); // Беремо токен з localStorage

        if (!jwtToken) {
            setProfileLoading(false);
            return;
        }

        try {
            const response = await axios.get('/api/users/profile', {
                headers: {
                    'Authorization': `Bearer ${jwtToken}`
                }
            });

            const userData = response.data;
            setLocalUserRole(userData.role);
            setLocalCompanyName(userData.companyName);
        } catch (error) {
            console.error('Помилка завантаження профілю в SideMenu:', error.response ? error.response.data : error.message);
            // Якщо є помилка, очищаємо локальні дані, але НЕ торкаємося центрального AuthContext
            setLocalUserRole(null);
            setLocalCompanyName(null);
        } finally {
            setProfileLoading(false); // Завершуємо завантаження профілю
        }
    };

    // useEffect для завантаження даних профілю, коли змінюється isAuthenticated з AuthContext
    useEffect(() => {
        // Якщо AuthContext показує, що користувач залогінений, спробуємо завантажити деталі профілю
        if (isAuthenticated && !loading) { // Переконуємось, що AuthContext закінчив завантаження
            fetchUserProfile();
        } else if (!isAuthenticated && !loading) {
            // Якщо користувач розлогінився, очищаємо локальні дані
            setLocalUserRole(null);
            setLocalCompanyName(null);
        }
        // Додаємо слухача для подій localStorage, щоб оновлювати меню,
        // якщо логін/виход відбувся в іншій вкладці або через інші компоненти
        const handleStorageChange = () => {
            if (!loading) { // Запускаємо fetchUserProfile лише коли AuthContext завершив початкове завантаження
                fetchUserProfile();
            }
        };
        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [isAuthenticated, loading]); // Залежимо від isAuthenticated та loading з AuthContext


    // Функція для обробки виходу з системи
    const handleLogout = () => {
        console.log("Кнопка 'Вийти' натиснута в SideMenu. Викликаю logout з AuthContext.");
        logout(); // !!! ВИКЛИКАЄМО ЦЕНТРАЛІЗОВАНУ ФУНКЦІЮ LOGOUT З AUTHCONTEXT !!!
        
        // Після logout() з AuthContext, `isAuthenticated` в `AppContent` стане `false`
        // і воно негайно перерендерить хедер/футер.
        // navigate('/') тут потрібне, щоб перевести користувача на головну сторінку.
        navigate('/'); 
        
        setShow(false); // Закриваємо сайд-меню після виходу
    };

    // !!! УМОВНЕ РЕНДЕРЕННЯ ТЕПЕР БАЗУЄТЬСЯ НА ДАНИХ З AUTHCONTEXT !!!
    // Якщо AuthContext ще завантажується або користувач не залогінений, то меню не показуємо
    // Також чекаємо на завантаження додаткових даних профілю (якщо такі є)
    if (loading || !isAuthenticated || profileLoading) {
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
                    {/* Використовуємо userRole та companyName, отримані з AuthContext або з локального завантаження профілю */}
                    {localUserRole === 'supplier' ? ( // Використовуємо localUserRole
                        <>
                            <ul style={{ backgroundColor: "#fff" }} className={classes.list}>
                                {/* Відображаємо назву компанії, отриману з локального завантаження профілю */}
                                <li style={{ backgroundColor: "#fff" }}><p style={{ backgroundColor: "#fff", fontWeight: "bold", }}> Назва моєї компанії: <span style={{color:"#2070d1", background:" white"}}>{localCompanyName || "Не вказано"}</span></p></li>
                                <li style={{ backgroundColor: "#fff" }} className={classes.li}><Link to="/cabinetCust" style={{ backgroundColor: "#fff" }}><IoHomeOutline className={classes.icon} />Кабінет</Link></li>
                                <li style={{ backgroundColor: "#fff" }} className={classes.li}>< Link to="/myoffers" style={{ backgroundColor: "#fff" }}><CiBookmarkPlus className={classes.icon} /> Мої заявки</Link></li>
                                <li style={{ backgroundColor: "#fff" }} className={classes.li}><Link to="/ProcurementSearch" style={{ backgroundColor: "#fff" }}><IoIosSearch className={classes.icon} />Знайти закупівлю</Link></li>
                                <li style={{ backgroundColor: "#fff" }} className={classes.li}><a href="#" style={{ backgroundColor: "#fff" }}><MdOutlineNotifications className={classes.icon} />Сповіщення</a></li>
                            </ul>
                        </>
                    ) : localUserRole === 'customer' ? ( // Використовуємо localUserRole
                        <>
                            <ul style={{ backgroundColor: "#fff" }} className={classes.list}>
                                {/* Відображаємо назву компанії, отриману з локального завантаження профілю */}
                                <li style={{ backgroundColor: "#fff" }}><p style={{ backgroundColor: "#fff", fontWeight: "bold", }}> Назва моєї компанії: <span style={{color:"#2070d1", background:" white"}}>{localCompanyName || "Не вказано"}</span></p></li>
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

                    <a href="tel:+380800503400 " style={{ backgroundColor: "#fff", cursor:"pointer", textDecoration:"none", color:"inherit", display:"block", marginBottom:"0.5em" }} className={classes.help}>Служба підтримки<br />
                        0-800-503-400</a>
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
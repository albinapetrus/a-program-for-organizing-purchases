// src/customer/cabinetCust.js (Переконайтеся, що це правильний шлях до вашого файлу)

import React, { Component } from 'react';
import classes from './Universal.module.css';
import { IoPersonSharp } from "react-icons/io5";
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom'; // useNavigate потрібен для обгортки
import { AuthContext } from '../context/AuthContext'; // <--- Імпортуйте AuthContext

export class CabinetCustComponent extends Component {
    // 1. Еквівалент useAuth() для доступу до контексту
    static contextType = AuthContext; 

    constructor(props) {
        super(props);
        this.state = {
            companyName: 'Завантаження...',
            email: 'Завантаження...',
            role: 'Завантаження...',
            error: '',
            loading: true,
        };
        // 2. Еквівалент useNavigate() для доступу до функції навігації
        this.navigate = props.navigate; // useNavigate передається як проп через WithRouter
    }

    async componentDidMount() {
        await this.fetchUserProfile();
    }

    fetchUserProfile = async () => {
        this.setState({ loading: true, error: '' });

        // Отримуємо logout з контексту (аналог const { logout } = useAuth();)
        const { logout } = this.context; 

        const jwtToken = localStorage.getItem('jwtToken');

        if (!jwtToken) {
            console.log("CabinetCust: Токена немає при завантаженні профілю. Викликаємо logout і перенаправляємо.");
            logout(); // Очищаємо стан аутентифікації
            this.navigate('/form'); // Перенаправляємо
            this.setState({
                error: 'Ви не аутентифіковані. Будь ласка, увійдіть.',
                loading: false,
            });
            return;
        }

        try {
            const response = await axios.get('/api/users/profile', {
                headers: {
                    'Authorization': `Bearer ${jwtToken}`
                }
            });

            const userData = response.data;

            this.setState({
                companyName: userData.companyName || 'Не вказано',
                email: userData.email || 'Не вказано',
                role: userData.role || 'Не вказано',
                loading: false,
                error: '',
            });

        } catch (error) {
            console.error('Помилка завантаження профілю:', error.response ? error.response.data : error.message);
            let errorMessage = 'Не вдалося завантажити профіль користувача. Спробуйте пізніше.';

            if (error.response) {
                if (error.response.status === 401) {
                    errorMessage = 'Сесія закінчилася або ви не авторизовані. Будь ласка, увійдіть знову.';
                    console.log("CabinetCust: Отримано 401 помилку. Викликаємо logout і перенаправляємо.");
                    logout(); // Очищаємо стан аутентифікації
                    this.navigate('/form'); // Перенаправляємо
                } else if (error.response.data && error.response.data.message) {
                    errorMessage = error.response.data.message;
                } else if (error.response.data) {
                    errorMessage = JSON.stringify(error.response.data);
                }
            } else if (error.message) {
                errorMessage = error.message;
            }
            this.setState({ error: errorMessage, loading: false });
        }
    };

    // Функція для обробки виходу користувача (аналог handleLogoutClick у SideMenu)
    handleLogout = () => {
        const { logout } = this.context; // Отримуємо logout з контексту
        console.log("CabinetCust: Кнопка 'Вийти' натиснута. Викликаємо logout і перенаправляємо.");
        logout(); // <--- Спочатку оновлюємо глобальний стан аутентифікації
        this.navigate('/form'); // <--- Потім перенаправляємо
    };

    render() {
        const { companyName, email, role, error, loading } = this.state;

        return (
            <div className={classes.universal}>
                <div className={classes.block2}>
                    <div className={classes.help} >
                        <h1 className={`${classes.label} ${classes.labelBlue}`}>
                            <IoPersonSharp className={classes.icon} />Ваш кабінет
                        </h1>
                        {loading ? (
                            <p>Завантаження даних профілю...</p>
                        ) : error ? (
                            <p style={{ color: 'red', fontWeight: 'bold' }}>{error}</p>
                        ) : (
                            <>
                                <p style={{ fontWeight: "bold" }}>Назва компанії: <span style={{ color: "orange" }}>{companyName}</span></p>
                                <p>Email: <span style={{ fontWeight: "bold" }}>{email}</span></p>
                                <p>Роль: <span style={{ color: "green", fontWeight: 'bold' }}>Замовник</span></p>
                            </>
                        )}
                    </div>
                </div>
                <div className={classes.help2}>
                    <button className={classes.buttonHelp}>Редагувати</button>
                    <Link to="/myprocurements" className={classes.buttonHelpLink}>
                        Мої закупівлі
                    </Link>
                </div>
                <div className={classes.help2}>
                    <Link to="/newOne" className={classes.buttonHelpLink}>
                        Додати закупівлю
                    </Link>
                    <button className={classes.buttonHelp} onClick={this.handleLogout}>Вийти</button>
                </div>
            </div>
        );
    }
}

// <------------------ ОБГОРТКОВИЙ КОМПОНЕНТ (ТАКИЙ Ж САМИЙ, ЯК І РАНІШЕ) ------------------>
// Це дозволяє передати хук useNavigate до класового компонента
function WithRouter(Component) {
    function ComponentWithRouterProp(props) {
        let navigate = useNavigate();
        return <Component {...props} navigate={navigate} />;
    }
    return ComponentWithRouterProp;
}

// Експортуємо обгорнутий компонент за замовчуванням
export default WithRouter(CabinetCustComponent);
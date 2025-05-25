// src/customer/cabinetCust.js

import React, { Component } from 'react';
import classes from './Universal.module.css';
import { IoPersonSharp } from "react-icons/io5";
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext'; 

export class CabinetCustComponent extends Component {
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
        this.navigate = props.navigate;
    }

    async componentDidMount() {
        await this.fetchUserProfile();
    }

    fetchUserProfile = async () => {
        this.setState({ loading: true, error: '' });

        const { logout } = this.context; 

        const jwtToken = localStorage.getItem('jwtToken');

        if (!jwtToken) {
            console.log("CabinetCust: Токена немає при завантаженні профілю. Викликаємо logout і перенаправляємо.");
            logout(); 
            this.navigate('/form'); 
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
                // Перетворюємо роль до нижнього регістру одразу, щоб уникнути проблем з регістром
                role: (userData.role || 'Не вказано').toLowerCase(), 
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
                    logout(); 
                    this.navigate('/form'); 
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

    handleLogout = () => {
        const { logout } = this.context; 
        console.log("CabinetCust: Кнопка 'Вийти' натиснута. Викликаємо logout і перенаправляємо.");
        logout(); 
        this.navigate('/form'); 
    };

    render() {
        const { companyName, email, role, error, loading } = this.state;

        // Визначаємо відображувану роль для тексту на українській мові
        // Порівнюємо з роллю в нижньому регістрі
        let displayRole = 'Завантаження...';
        if (!loading && !error) {
            if (role === 'customer') { // Змінено на 'customer'
                displayRole = 'Замовник';
            } else if (role === 'supplier') { // Змінено на 'supplier'
                displayRole = 'Постачальник';
            } else {
                displayRole = role; // Якщо роль інша, відображаємо як є
            }
        }

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
                                {/* Відображення ролі динамічно українською */}
                                <p>Роль: <span style={{ color: "green", fontWeight: 'bold' }}>{displayRole}</span></p>
                            </>
                        )}
                    </div>
                </div>

                {/* Умовне відображення кнопок залежно від ролі */}
                {/* Якщо роль Замовник (customer) */}
                {role === 'customer' && ( // Змінено на 'customer'
                    <>
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
                    </>
                )}

                {/* Якщо роль Постачальник (supplier) */}
                {role === 'supplier' && ( // Змінено на 'supplier'
                    <>
                        <div className={classes.help2}>
                            <button className={classes.buttonHelp}>Редагувати</button>
                            <Link to="/myoffers" className={classes.buttonHelpLink}>
                                Мої пропозиції
                            </Link>
                        </div>
                        <div className={classes.help2}>
                            <Link to="/ProcurementSearch" className={classes.buttonHelpLink}>
                                Знайти закупівлю
                            </Link>
                            <button className={classes.buttonHelp} onClick={this.handleLogout}>Вийти</button>
                        </div>
                    </>
                )}
                
                {/* Якщо роль не customer і не supplier, але дані вже завантажені */}
                {role !== 'customer' && role !== 'supplier' && !loading && !error && ( // Змінено на 'customer' та 'supplier'
                    <div className={classes.help2}>
                        <button className={classes.buttonHelp} onClick={this.handleLogout}>Вийти</button>
                        <p style={{marginTop: '10px', color: '#666'}}>Для вашої ролі додаткові дії на цій сторінці не передбачені.</p>
                    </div>
                )}
            </div>
        );
    }
}

// <------------------ ОБГОРТКОВИЙ КОМПОНЕНТ ------------------>
function WithRouter(Component) {
    function ComponentWithRouterProp(props) {
        let navigate = useNavigate();
        return <Component {...props} navigate={navigate} />;
    }
    return ComponentWithRouterProp;
}

export default WithRouter(CabinetCustComponent);
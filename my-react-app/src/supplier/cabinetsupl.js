import React, { Component } from 'react';
import classes from './Universal.module.css';
import { IoPersonSharp } from "react-icons/io5";
import axios from 'axios'; // Імпортуємо axios для HTTP-запитів
import { Navigate, Link } from 'react-router-dom'; // Імпортуємо Navigate для перенаправлення та Link для навігації
// Якщо ти використовуєш SideMenuContext для глобального стану, можеш його імпортувати
// import { SideMenuContext } from '../SideMenuContext';

export class cabinetsupl extends Component {
    // static contextType = SideMenuContext; // Якщо потрібно використовувати контекст

    constructor(props) {
        super(props);
        this.state = {
            companyName: 'Завантаження...', // Початкові значення для відображення
            email: 'Завантаження...',
            role: 'Завантаження...',
            // registrationDate: 'Завантаження...', // Видалено, оскільки бекенд не повертає це поле в UserProfileDto
            error: '', // Для відображення помилок
            loading: true, // Стан завантаження даних з бекенду
            redirect: false, // Для перенаправлення на сторінку логіну
        };
    }

    // componentDidMount викликається один раз після першого рендерингу компонента
    async componentDidMount() {
        await this.fetchUserProfile();
    }

    // Асинхронна функція для отримання даних профілю користувача
    fetchUserProfile = async () => {
        this.setState({ loading: true, error: '' }); // Встановлюємо стан завантаження та очищаємо попередні помилки

        const jwtToken = localStorage.getItem('jwtToken'); // Отримуємо JWT токен з localStorage

        // Якщо токена немає, користувач не авторизований
        if (!jwtToken) {
            this.setState({
                error: 'Ви не аутентифіковані. Будь ласка, увійдіть.',
                loading: false,
                redirect: true // Встановлюємо redirect на true, щоб перенаправити на сторінку логіну
            });
            return; // Виходимо з функції
        }

        try {
            // Відправляємо GET-запит до твого UsersController
            // URL: /api/users/profile
            const response = await axios.get('/api/users/profile', {
                headers: {
                    'Authorization': `Bearer ${jwtToken}` // Додаємо JWT токен у заголовок Authorization
                }
            });

            const userData = response.data; // Отримуємо дані профілю з відповіді бекенду

            // Оновлюємо стан компонента отриманими даними
            this.setState({
                companyName: userData.companyName || 'Не вказано', // Використовуємо userData.companyName
                email: userData.email || 'Не вказано',             // Використовуємо userData.email
                role: userData.role || 'Не вказано',               // Використовуємо userData.role
                // registrationDate: userData.registrationDate ? new Date(userData.registrationDate).toLocaleDateString() : 'Не вказано', // Якщо бекенд почне повертати дату
                loading: false, // Завантаження завершено
                error: '',      // Очищаємо помилки
            });

        } catch (error) {
            console.error('Помилка завантаження профілю:', error.response ? error.response.data : error.message);
            let errorMessage = 'Не вдалося завантажити профіль користувача. Спробуйте пізніше.';

            if (error.response) {
                // Обробка помилки 401 (Unauthorized) - токен недійсний або закінчився
                if (error.response.status === 401) {
                    errorMessage = 'Сесія закінчилася або ви не авторизовані. Будь ласка, увійдіть знову.';
                    // Очищаємо всі дані авторизації з localStorage
                    localStorage.removeItem('jwtToken');
                    localStorage.removeItem('role');
                    localStorage.removeItem('companyName');
                    // Якщо використовуєш контекст, онови його стан
                    // if (this.context) {
                    //     this.context.setIsSideMenuOpen(false);
                    //     this.context.handleCompanyNameChange('');
                    // }
                    this.setState({ redirect: true }); // Перенаправляємо на сторінку логіну
                } else if (error.response.data && error.response.data.message) {
                    // Загальне повідомлення про помилку від бекенду
                    errorMessage = error.response.data.message;
                } else if (error.response.data) {
                    // Якщо бекенд повернув дані, але не в очікуваному форматі повідомлення
                    errorMessage = JSON.stringify(error.response.data);
                }
            } else if (error.message) {
                // Мережеві помилки або інші помилки
                errorMessage = error.message;
            }
            this.setState({ error: errorMessage, loading: false }); // Оновлюємо стан помилки
        }
    };

    // Функція для обробки виходу користувача
    handleLogout = () => {
        // Очищаємо всі дані авторизації з localStorage
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('role');
        localStorage.removeItem('companyName');
        // Якщо використовуєш контекст, онови його стан
        // if (this.context) {
        //     this.context.setIsSideMenuOpen(false);
        //     this.context.handleCompanyNameChange('');
        // }
        this.setState({ redirect: true }); // Перенаправляємо на сторінку логіну
    };

    render() {
        // Якщо redirect === true, перенаправляємо користувача
        if (this.state.redirect) {
            // Заміни "/form" на реальний шлях до твоєї сторінки логіну/реєстрації
            return <Navigate to="/form" />;
        }

        // Деструктуризація стану для зручності
        const { companyName, email, role, error, loading } = this.state;

        return (
            <div className={classes.universal}>
                <div className={classes.block2}>
                    <div className={classes.help}>
                        <h1 className={`${classes.label} ${classes.labelBlue}`}>
                            <IoPersonSharp className={classes.icon} />Ваш кабінет
                        </h1>
                        {loading ? (
                            // Відображаємо повідомлення про завантаження
                            <p>Завантаження даних профілю...</p>
                        ) : error ? (
                            // Відображаємо помилку, якщо вона є
                            <p style={{ color: 'red', fontWeight: 'bold' }}>{error}</p>
                        ) : (
                            // Відображаємо дані профілю, якщо вони завантажені успішно
                            <>
                                <p style={{ fontWeight: "bold" }}>Назва компанії: <span>{companyName}</span></p>
                                <p>Email: <span>{email}</span></p>
                                <p>Роль: <span>{role}</span></p>
                                {/* <p>Зареєстровано: <span>{registrationDate}</span></p> */}
                                {/* Рядок для дати реєстрації закоментовано, оскільки бекенд не повертає це поле */}
                            </>
                        )}
                    </div>
                </div>
                <div className={classes.help2}>
                    <button className={classes.buttonHelp}>Редагувати</button>
                    {/* Використовуємо Link для навігації до "Мої закупівлі" */}
                    <Link to="/myoffers" className={classes.buttonHelpLink}>
                        <button className={classes.buttonHelp}>Мої заявки</button>
                    </Link>
                </div>
                <div className={classes.help2}>
                    {/* Використовуємо Link для навігації до "Додати закупівлю" */}
                    <Link to="/ProcurementSearch" className={classes.buttonHelpLink}>
                         <button className={classes.buttonHelp}>Знайти закупівлю</button>
                    </Link>
                    {/* Кнопка "Вийти" з обробником onClick */}
                    <button className={classes.buttonHelp} onClick={this.handleLogout}>Вийти</button>
                </div>
            </div>
        );
    }
}


export default cabinetsupl
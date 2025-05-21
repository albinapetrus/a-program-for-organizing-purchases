import React, { Component } from 'react';
import classes from './auth.module.css';
import { Link, Navigate } from 'react-router-dom';
import { useNavigate } from 'react-router-dom'; // <<< ДОДАЙТЕ ЦЕЙ ІМПОРТ
// import { SideMenuContext } from '../SideMenuContext'; // <<< ВИДАЛІТЬ ЦЕЙ РЯДОК
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useAuth } from '../context/AuthContext'; // <<< ДОДАЙТЕ ЦЕЙ ІМПОРТ

// --- ОБГОРТКА ДЛЯ КЛАСОВОГО КОМПОНЕНТА ---
// Це необхідно, щоб класовий компонент міг використовувати хуки (наприклад, useNavigate, useAuth)
function FormWrapper() {
  const { login } = useAuth(); // Отримуємо функцію 'login' з AuthContext
  const navigate = useNavigate(); // Отримуємо функцію 'navigate' для перенаправлення
  return <Form login={login} navigate={navigate} />; // Передаємо їх як props класовому компоненту Form
}
// --- КІНЕЦЬ ОБГОРТКИ ---


export class Form extends Component { // Зверніть увагу: назва компонента з великої літери
    // static contextType = SideMenuContext; // <<< ВИДАЛІТЬ ЦЕЙ РЯДОК
    constructor(props) {
        super(props);
        this.state = {
            email: '',
            password: '',
            error: '', // Для відображення помилок
            loading: false, // Додаємо стан завантаження
            // redirect: false, // Цей стан більше не потрібен для перенаправлення через useNavigate
        };
    }

    handleChange = (e) => {
        this.setState({ [e.target.name]: e.target.value, error: '' }); // Очищуємо помилку при зміні поля
    };

    handleSubmit = async (e) => {
        e.preventDefault();

        const { email, password } = this.state;

        if (!email || !password) {
            this.setState({ error: 'Будь ласка, введіть email та пароль.' });
            return;
        }

        this.setState({ loading: true, error: '' }); // Встановлюємо стан завантаження, очищуємо попередні помилки

        try {
            const response = await axios.post('/api/auth/login', { email, password });

            console.log('Логін успішний:', response.data);

            const token = response.data.token;

            if (token) {
                // !!! ВИКЛИКАЄМО login З AuthContext !!!
                // Ця функція сама збереже токен в localStorage, розшифрує його
                // і оновить глобальний стан користувача.
                this.props.login(token); // <<< Використовуємо login, переданий через props

                // Розшифровуємо токен, щоб отримати роль для ПЕРЕНАПРАВЛЕННЯ
                const decodedToken = jwtDecode(token);
                // JWT claims можуть бути як 'role', так і 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'
                const userRole = decodedToken.role || decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];

                // !!! ТЕПЕР ПЕРЕНАПРАВЛЕННЯ ЧЕРЕЗ this.props.navigate !!!
                if (userRole === 'customer') {
                    this.props.navigate('/cabinetCust');
                } else if (userRole === 'supplier') {
                    this.props.navigate('/cabinetCust');
                } else {
                    this.props.navigate('/cabinetCust'); // Шлях за замовчуванням
                }

                // !!! ВИДАЛЯЄМО СТАРІ ВИКЛИКИ SideMenuContext ТА localStorage.setItem('role') !!!
                // this.context.setIsSideMenuOpen(true); // <<< ВИДАЛІТЬ
                // this.context.handleCompanyNameChange(companyName); // <<< ВИДАЛІТЬ
                // localStorage.setItem('role', role); // <<< ВИДАЛІТЬ
                // localStorage.setItem('companyName', companyName); // <<< ВИДАЛІТЬ
                // this.setState({ redirect: true }); // <<< ВИДАЛІТЬ
            } else {
                this.setState({ error: 'Логін успішний, але токен не отримано.', loading: false });
            }

        } catch (error) {
            console.error('Помилка логіну:', error.response ? error.response.data : error.message);

            let errorMessage = 'Сталася помилка під час логіну.';
            if (error.response && error.response.data) {
                if (error.response.data.message) {
                    // Якщо бекенд повернув конкретне повідомлення про помилку
                    errorMessage = error.response.data.message;
                } else if (error.response.data.errors) {
                    // Якщо бекенд повернув валідаційні помилки (об'єкт)
                    try {
                        errorMessage = 'Помилки: <br/>' +
                            Object.entries(error.response.data.errors)
                                .map(([field, errors]) =>
                                    `<strong>${field}:</strong> ${errors.join(', ')}`
                                )
                                .join('<br/>');
                    } catch (e) {
                        errorMessage = 'Помилки валідації: ' + JSON.stringify(error.response.data.errors);
                    }
                } else {
                    errorMessage =  JSON.stringify(error.response.data);
                }
            } else if (error.message) {
                // Загальні помилки мережі
                errorMessage = 'Помилка мережі: ' + error.message;
            }

            this.setState({ error: errorMessage, loading: false }); // Встановлюємо помилку для відображення
        }
    };

    render() {
        // !!! ВИДАЛЯЄМО УМОВНЕ ПЕРЕНАПРАВЛЕННЯ З render !!!
        // if (this.state.redirect) {
        //     return <Navigate to="/myPurch" />;
        // }

        return (
            <div className={classes.auth}>
                <h2 className={classes.text1}>Форма авторизації</h2>
                <form className={classes.form1} onSubmit={this.handleSubmit}>
                    <fieldset className={classes.fieldset}>
                        <label htmlFor="email">Введіть email:</label>
                        <input
                            type="email"
                            id="email"
                            className={classes.email}
                            name="email"
                            placeholder="gmail@gmail.com"
                            value={this.state.email}
                            onChange={this.handleChange}
                        />
                        <label htmlFor="password">Введіть пароль:</label>
                        <input
                            type="password"
                            id="password"
                            className={classes.email}
                            name="password"
                            value={this.state.password}
                            onChange={this.handleChange}
                        />
                        {/* !!! МІСЦЕ ДЛЯ ВІДОБРАЖЕННЯ ПОМИЛКИ !!! */}
                        {this.state.error && (
                            <p className={classes.errorMessage} dangerouslySetInnerHTML={{ __html: this.state.error }} />
                        )}
                        {/* !!! КІНЕЦЬ МІСЦЯ ДЛЯ ВІДОБРАЖЕННЯ ПОМИЛКИ !!! */}

                        <button type="submit" className={classes.submit} disabled={this.state.loading}>
                            {this.state.loading ? 'Завантаження...' : 'Увійти'}
                        </button>
                    </fieldset>
                    <br />
                    <div className={classes.container}></div>
                </form>

                <div className={classes.container}>
                    <p className={classes.text}> <Link to="/auth">Повернутись</Link></p>
                </div>
            </div>
        );
    }
}

// !!! ВАЖЛИВО: ЕКСПОРТУЄМО ОБГОРТКУ, А НЕ САМ КЛАС !!!
export default FormWrapper;
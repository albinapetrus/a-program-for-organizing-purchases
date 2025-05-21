import React, { Component } from 'react';
import classes from './auth.module.css';
import { Link, Navigate } from 'react-router-dom';
// import { useNavigate } from 'react-router-dom'; // useNavigate використовується у функціональних компонентах
import axios from 'axios';

// Переконайся, що baseURL встановлено глобально десь на вході в застосунок
 axios.defaults.baseURL = 'https://localhost:7078';

export class auth extends Component {
    constructor(props) {
        super(props);
        this.state = {
            email: '',
            password: '',
            passwordConfirm: '',
            error: '', // Для відображення помилок
            redirect: false, // Стан для перенаправлення
            loading: false, // Стан завантаження
        };
    }

    // Метод для оновлення стану при зміні значень полів вводу
    handleChange = (e) => {
        this.setState({ [e.target.name]: e.target.value, error: '' }); // Очищаємо помилку при введенні
    };

    // Метод для обробки відправки форми першого етапу реєстрації
    handleSubmit = async (e) => {
        e.preventDefault();

        const { email, password, passwordConfirm } = this.state;

        // Базова фронтенд валідація: перевірка на порожні поля
        if (!email || !password || !passwordConfirm) {
            this.setState({ error: 'Будь ласка, заповніть всі поля.' });
            return;
        }

        // Базова фронтенд валідація: перевірка співпадіння паролів
        if (password !== passwordConfirm) {
            this.setState({ error: 'Паролі не співпадають' });
            return;
        }

        // Додатково можна додати базову валідацію формату email та мінімальної довжини пароля,
        // але за домовленістю поки зосереджуємось на бекенд-взаємодії.

        this.setState({ loading: true, error: '' }); // Встановлюємо стан завантаження

        try {
            // Виконуємо POST запит до бекенду для першого етапу реєстрації
            // Бекенд має повернути { message: "...", userId: "..." }
            const response = await axios.post('/api/Auth/register', { email, password });

            console.log('Етап 1 реєстрації успішний:', response.data);

            // !!! Отримуємо ID створеного користувача з відповіді !!!
            const userId = response.data.userId;

            // !!! Зберігаємо ID користувача для наступних етапів (наприклад, у localStorage) !!!
            if (userId) {
                localStorage.setItem('registeringUserId', userId);
                this.setState({ redirect: true, loading: false }); // Перенаправляємо на наступний етап
            } else {
                 // Якщо бекенд не повернув ID користувача, але запит був 200 OK
                 this.setState({ error: 'Реєстрація успішна, але не отримано ID користувача для продовження.', loading: false });
            }


        } catch (error) {
            console.error('Помилка на етапі 1 реєстрації:', error.response ? error.response.data : error.message);

            // Обробка помилок від бекенду
            let errorMessage = 'Сталася помилка під час реєстрації.';
             if (error.response && error.response.data) {
                 if (error.response.data.errors) {
                      // Обробка валідаційних помилок (якщо бекенд повернув ModelState)
                      const validationErrors = error.response.data.errors;
                      // Збираємо всі повідомлення про помилки
                      errorMessage = Object.values(validationErrors).map(errArray => errArray.join(', ')).join('<br/>');
                 } else if (error.response.data.message) {
                      // Обробка загального повідомлення про помилку (наприклад, "Користувач з таким email вже існує.")
                      errorMessage = error.response.data.message;
                 } else {
                      // Якщо data існує, але не має очікуваного формату
                       errorMessage = JSON.stringify(error.response.data);
                 }
             } else if (error.message) {
                  // Обробка мережевих помилок (наприклад, "Network Error")
                  errorMessage = error.message;
             }


            this.setState({ error: errorMessage, loading: false });
        }
    };

    render() {
        // Програмне перенаправлення, якщо redirect === true
        if (this.state.redirect) {
            return <Navigate to="/auth2" />;
        }

        const { email, password, passwordConfirm, error, loading } = this.state; // Отримуємо стан для використання у рендері

        return (
            <div className={classes.auth}>
                <p style={{ color: "#2070d1" }}>Всього 4 кроки до участі у закупівлі</p>
                <div className={classes.around}>
                    {/* Відповідні кружечки етапів */}
                    <div className={`${classes.circle} ${classes.circle1}`}>1</div> {/* Перший етап активний */}
                    <div className={classes.circle}>2</div>
                    <div className={classes.circle}>3</div>
                    <div className={classes.circle}>4</div>
                </div>

                <form className={classes.form1} onSubmit={this.handleSubmit}>
                    <fieldset className={classes.fieldset}>
                        <label htmlFor="email">Введіть email:</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            placeholder="gmail@gmail.com"
                            value={email} // Значення поля зі стану
                            onChange={this.handleChange} // Оновлення стану при зміні
                            required // Додаємо HTML5 валідацію (опціонально)
                        />
                        <label htmlFor="password">Введіть пароль:</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={password} // Значення поля зі стану
                            onChange={this.handleChange} // Оновлення стану
                            required // Додаємо HTML5 валідацію (опціонально)
                        />
                        <label htmlFor="passwordConfirm">Повторіть пароль:</label>
                        <input
                            type="password"
                            id="passwordConfirm" // Змінено id на passwordConfirm для відповідності name
                            name="passwordConfirm"
                            value={passwordConfirm} // Значення поля зі стану
                            onChange={this.handleChange} // Оновлення стану
                            required // Додаємо HTML5 валідацію (опціонально)
                        />

                        {/* Кнопка відправки */}
                        <input
                            type="submit"
                            className={classes.submit}
                            value={loading ? 'Відправка...' : 'Далі'} // Текст кнопки під час завантаження
                            disabled={loading} // Вимикаємо кнопку під час завантаження
                        />
                    </fieldset>
                </form><br />

                {/* Місце для відображення помилок */}
                {/* Використовуємо dangerouslySetInnerHTML для відображення помилок з <br/>, якщо вони є */}
                {error && (
                    <p style={{ color: 'red' }} dangerouslySetInnerHTML={{ __html: error }}></p>
                )}

                <div className={classes.container}>
                    <p className={classes.text}>Уже є акаунт? <Link to="/form">Увійти</Link></p>
                </div>
            </div>
        );
    }
}

export default auth;
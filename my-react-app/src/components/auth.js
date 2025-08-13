import React, { Component } from 'react';
import classes from './auth.module.css';
import { Link, Navigate } from 'react-router-dom';
import axios from 'axios';

axios.defaults.baseURL = 'https://localhost:7078';

export class auth extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
      passwordConfirm: '',
      error: '',
      redirect: false,
      loading: false,
    };
  }

  handleChange = (e) => {
    this.setState({ [e.target.name]: e.target.value, error: '' });
  };
  handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password, passwordConfirm } = this.state;

    if (!email || !password || !passwordConfirm) {
      this.setState({ error: 'Будь ласка, заповніть всі поля.' });
      return;
    }

    if (password !== passwordConfirm) {
      this.setState({ error: 'Паролі не співпадають' });
      return;
    }

    this.setState({ loading: true, error: '' });

    try {
      const response = await axios.post('/api/Auth/register', {
        email,
        password,
      });

      console.log('Етап 1 реєстрації успішний:', response.data);

      const userId = response.data.userId;

      if (userId) {
        localStorage.setItem('registeringUserId', userId);
        this.setState({ redirect: true, loading: false });
      } else {
        this.setState({
          error:
            'Реєстрація успішна, але не отримано ID користувача для продовження.',
          loading: false,
        });
      }
    } catch (error) {
      console.error(
        'Помилка на етапі 1 реєстрації:',
        error.response ? error.response.data : error.message
      );

      let errorMessage = 'Сталася помилка під час реєстрації.';
      if (error.response && error.response.data) {
        if (error.response.data.errors) {
          const validationErrors = error.response.data.errors;
          errorMessage = Object.values(validationErrors)
            .map((errArray) => errArray.join(', '))
            .join('<br/>');
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else {
          errorMessage = JSON.stringify(error.response.data);
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      this.setState({ error: errorMessage, loading: false });
    }
  };

  render() {
    if (this.state.redirect) {
      return <Navigate to="/auth2" />;
    }

    const { email, password, passwordConfirm, error, loading } = this.state;

    return (
      <div className={classes.auth}>
        <p style={{ color: '#2070d1' }}>Всього 4 кроки до участі у закупівлі</p>
        <div className={classes.around}>
          <div className={`${classes.circle} ${classes.circle1}`}>1</div>
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
              value={email}
              onChange={this.handleChange}
              required
            />
            <label htmlFor="password">Введіть пароль:</label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={this.handleChange}
              required
            />
            <label htmlFor="passwordConfirm">Повторіть пароль:</label>
            <input
              type="password"
              id="passwordConfirm"
              name="passwordConfirm"
              value={passwordConfirm}
              onChange={this.handleChange}
              required
            />

            <input
              type="submit"
              className={classes.submit}
              value={loading ? 'Відправка...' : 'Далі'}
              я
              disabled={loading}
            />
          </fieldset>
        </form>
        <br />

        {error && (
          <p
            style={{ color: 'red' }}
            dangerouslySetInnerHTML={{ __html: error }}
          ></p>
        )}

        <div className={classes.container}>
          <p className={classes.text}>
            Уже є акаунт? <Link to="/form">Увійти</Link>
          </p>
        </div>
      </div>
    );
  }
}

export default auth;

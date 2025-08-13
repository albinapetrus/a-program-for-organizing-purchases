import React, { Component } from 'react';
import classes from './auth.module.css';
import { Link, Navigate } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useAuth } from '../context/AuthContext';

function FormWrapper() {
  const { login } = useAuth();
  const navigate = useNavigate();
  return <Form login={login} navigate={navigate} />;
}

export class Form extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
      error: '',
      loading: false,
    };
  }

  handleChange = (e) => {
    this.setState({ [e.target.name]: e.target.value, error: '' });
  };

  handleSubmit = async (e) => {
    e.preventDefault();

    const { email, password } = this.state;

    if (!email || !password) {
      this.setState({ error: 'Будь ласка, введіть email та пароль.' });
      return;
    }

    this.setState({ loading: true, error: '' });

    try {
      const response = await axios.post('/api/auth/login', { email, password });

      console.log('Логін успішний:', response.data);

      const token = response.data.token;

      if (token) {
        this.props.login(token);

        const decodedToken = jwtDecode(token);
        const userRole =
          decodedToken.role ||
          decodedToken[
            'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'
          ];

        if (userRole === 'customer') {
          this.props.navigate('/cabinetCust');
        } else if (userRole === 'supplier') {
          this.props.navigate('/cabinetCust');
        } else {
          this.props.navigate('/cabinetCust');
        }
      } else {
        this.setState({
          error: 'Логін успішний, але токен не отримано.',
          loading: false,
        });
      }
    } catch (error) {
      console.error(
        'Помилка логіну:',
        error.response ? error.response.data : error.message
      );

      let errorMessage = 'Сталася помилка під час логіну.';
      if (error.response && error.response.data) {
        if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.errors) {
          try {
            errorMessage =
              'Помилки: <br/>' +
              Object.entries(error.response.data.errors)
                .map(
                  ([field, errors]) =>
                    `<strong>${field}:</strong> ${errors.join(', ')}`
                )
                .join('<br/>');
          } catch (e) {
            errorMessage =
              'Помилки валідації: ' +
              JSON.stringify(error.response.data.errors);
          }
        } else {
          errorMessage = JSON.stringify(error.response.data);
        }
      } else if (error.message) {
        errorMessage = 'Помилка мережі: ' + error.message;
      }

      this.setState({ error: errorMessage, loading: false });
    }
  };

  render() {
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
            {this.state.error && (
              <p
                className={classes.errorMessage}
                dangerouslySetInnerHTML={{ __html: this.state.error }}
              />
            )}
            <button
              type="submit"
              className={classes.submit}
              disabled={this.state.loading}
            >
              {this.state.loading ? 'Завантаження...' : 'Увійти'}
            </button>
          </fieldset>
          <br />
          <div className={classes.container}></div>
        </form>

        <div className={classes.container}>
          <Link to="/auth" className={classes.text}>
            Повернутись
          </Link>
        </div>
      </div>
    );
  }
}

export default FormWrapper;

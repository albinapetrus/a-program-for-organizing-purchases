import React, { Component } from 'react';
import classes from './auth.module.css';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function Auth3Wrapper() {
  const { login } = useAuth();
  const navigate = useNavigate();
  return <Auth3 login={login} navigate={navigate} />;
}

export class Auth3 extends Component {
  constructor(props) {
    super(props);
    this.state = {
      companyName: '',
      category: '',
      error: '',
      loading: false,
    };
  }

  handleChange = (e) => {
    this.setState({ [e.target.name]: e.target.value, error: '' });
  };

  handleSubmit = async (e) => {
    e.preventDefault();

    const { companyName, category } = this.state;
    const userId = localStorage.getItem('registeringUserId');

    if (!userId) {
      this.setState({
        error:
          'Помилка: ID користувача не знайдено в localStorage. Почніть реєстрацію з першого етапу.',
      });
      return;
    }

    if (!companyName || !category) {
      this.setState({ error: "Будь ласка, заповніть всі обов'язкові поля." });
      return;
    }

    this.setState({ loading: true, error: '' });

    const dataToSend = {
      UserId: userId,
      CompanyName: companyName,
      Category: category,
    };

    try {
      const response = await axios.put('/api/Auth/profile/step3', dataToSend);

      console.log('Етап 3 реєстрації успішний (Фінал):', response.data);

      const jwtToken = response.data.token;

      if (jwtToken) {
        this.props.login(jwtToken);
        localStorage.removeItem('registeringUserId');
        this.props.navigate('/auth4');
      } else {
        this.setState({
          error:
            'Реєстрація завершена, але токен для автоматичного логіну не отримано. Спробуйте увійти вручну.',
          loading: false,
        });
      }
    } catch (error) {
      console.error(
        'Помилка на етапі 3 реєстрації:',
        error.response ? error.response.data : error.message
      );
      let errorMessage = 'Сталася помилка на етапі 3 реєстрації.';
      if (error.response && error.response.data) {
        if (error.response.data.errors) {
          const validationErrors = error.response.data.errors;
          try {
            errorMessage =
              'Помилки валідації: <br/>' +
              Object.entries(validationErrors)
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
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.detail) {
          errorMessage = error.response.data.detail;
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
    const { companyName, category, error, loading } = this.state;
    return (
      <div className={classes.auth}>
        <p style={{ color: '#2070d1' }}>Всього 4 кроки до участі у закупівлі</p>
        <div className={classes.around}>
          <div className={`${classes.circle} ${classes.circle1}`}>1</div>
          <div className={`${classes.circle} ${classes.circle1}`}>2</div>
          <div className={`${classes.circle} ${classes.circle1}`}>3</div>
          <div className={classes.circle}>4</div>
        </div>
        <form className={classes.form1} onSubmit={this.handleSubmit}>
          <fieldset className={classes.fieldset}>
            <label>Вкажіть назву компанії</label>
            <input
              type="text"
              name="companyName"
              value={companyName}
              onChange={this.handleChange}
              required
            />
            <label>Вкажіть категорію</label>
            <select
              style={{ marginBottom: '1em' }}
              id="category"
              name="category"
              value={category}
              onChange={this.handleChange}
              required
            >
              <option value="" disabled hidden>
                Оберіть категорію
              </option>
              <option value="Будівництво">Будівництво</option>
              <option value="Медицина">Медицина</option>
              <option value="Меблі">Меблі</option>
              <option value="Комп'ютерна техніка">Комп'ютерна техніка</option>
              <option value="Канцелярія та госптовари">
                Канцелярія та госптовари
              </option>
              <option value="Транспорт та запчастини">
                Транспорт та запчастини
              </option>
              <option value="Енергетика, нафтопродукти та паливо">
                Енергетика, нафтопродукти та паливо
              </option>
              <option value="Метали">Метали</option>
              <option value="Комунальне та побутове обслуговування">
                Комунальне та побутове обслуговування
              </option>
              <option value="Навчання та консалтинг">
                Навчання та консалтинг
              </option>
              <option value="Нерухомість">Нерухомість</option>
              <option value="Сільське господарство">
                Сільське господарство
              </option>
              <option value="Одяг, взуття та текстиль">
                Одяг, взуття та текстиль
              </option>
              <option value="Промислове обладнання та прилади">
                Промислове обладнання та прилади
              </option>
              <option value="Харчування">Харчування</option>
              <option value="Поліграфія">Поліграфія</option>
              <option value="Науково-дослідні роботи">
                Науково-дослідні роботи
              </option>
              <option value="Різні послуги та товари">
                Різні послуги та товари
              </option>
            </select>
            <input
              type="submit"
              className={classes.submit}
              value={loading ? 'Завершення...' : 'Завершити реєстрацію'}
              disabled={loading}
            />
          </fieldset>
        </form>
        {error && (
          <p
            style={{ color: 'red', background: 'white' }}
            dangerouslySetInnerHTML={{ __html: error }}
          ></p>
        )}
      </div>
    );
  }
}

export default Auth3Wrapper;

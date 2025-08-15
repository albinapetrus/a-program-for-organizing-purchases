import React, { Component } from 'react';
import classes from './Universal.module.css';
import { GoPaperclip } from 'react-icons/go';
import axios from 'axios';
import { IoCreateSharp } from 'react-icons/io5';
import { LuNotebookPen } from 'react-icons/lu';

axios.defaults.baseURL = 'https://localhost:7078';

export class NewOne extends Component {
  constructor(props) {
    super(props);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const minDate = tomorrow.toISOString().split('T')[0];

    this.state = {
      name: '',
      description: '',
      category: '',
      quantityOrVolume: '',
      estimatedBudget: '',
      completionDate: '',
      supportingDocument: null,
      deliveryAddress: '',
      contactPhone: '',
      error: '',
      loading: false,
      successMessage: '',
      minCompletionDate: minDate,
    };
  }

  handleChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === 'file') {
      this.setState({ [name]: files[0], error: '', successMessage: '' });
    } else {
      this.setState({ [name]: value, error: '', successMessage: '' });
    }
  };

  handleSubmit = async (e) => {
    e.preventDefault();
    const {
      name,
      description,
      category,
      quantityOrVolume,
      estimatedBudget,
      completionDate,
      supportingDocument,
      deliveryAddress,
      contactPhone,
      minCompletionDate,
    } = this.state;

    if (
      !name ||
      !category ||
      quantityOrVolume === '' ||
      estimatedBudget === '' ||
      !completionDate
    ) {
      this.setState({ error: "Будь ласка, заповніть всі обов'язкові поля." });
      return;
    }

    
    if (completionDate) {
      const selectedDate = new Date(completionDate);
      const tomorrow = new Date(minCompletionDate);
      selectedDate.setHours(0, 0, 0, 0);
      tomorrow.setHours(0, 0, 0, 0);

      if (selectedDate < tomorrow) {
        this.setState({
          error: 'Дата завершення закупівлі не може бути раніше ніж завтра.',
        });
        return;
      }
    }

    const phoneRegex = /^\+?[0-9\s\(\)-]{10,18}$/;
    if (contactPhone && !phoneRegex.test(contactPhone)) {
      this.setState({
        error:
          'Некоректний формат номеру телефону. Введіть у форматі +380XXXXXXXXX або 0XXXXXXXXX.',
      });
      return;
    }

    if (parseFloat(quantityOrVolume) <= 0) {
      this.setState({ error: 'Кількість/Обсяг має бути більше нуля.' });
      return;
    }

    if (parseFloat(estimatedBudget) <= 0) {
      this.setState({ error: 'Орієнтовний бюджет має бути більше нуля.' });
      return;
    }

    this.setState({ loading: true, error: '', successMessage: '' });

    const formData = new FormData();
    formData.append('Name', name);
    formData.append('Description', description);
    formData.append('Category', category);
    formData.append('QuantityOrVolume', quantityOrVolume);
    formData.append('EstimatedBudget', estimatedBudget);
    if (completionDate) {
      formData.append('CompletionDate', completionDate);
    }
    formData.append('DeliveryAddress', deliveryAddress);
    formData.append('ContactPhone', contactPhone);

    if (supportingDocument) {
      formData.append('SupportingDocument', supportingDocument);
    }

    const jwtToken = localStorage.getItem('jwtToken');

    if (!jwtToken) {
      this.setState({
        error: 'Ви не аутентифіковані. Будь ласка, увійдіть.',
        loading: false,
      });
      return;
    }

    try {
      const response = await axios.post('/api/Procurements', formData, {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      });

      console.log('Створення закупівлі успішне:', response.data);

      this.setState({
        successMessage: response.data.message || 'Закупівлю успішно створено!',
        error: '',
        loading: false,
        name: '',
        description: '',
        category: '',
        quantityOrVolume: '',
        estimatedBudget: '',
        completionDate: '',
        supportingDocument: null,
        deliveryAddress: '',
        contactPhone: '',
      });
    } catch (error) {
      console.error(
        'Помилка створення закупівлі:',
        error.response ? error.response.data : error.message
      );
      let errorMessage = 'Сталася помилка під час створення закупівлі.';
      if (error.response && error.response.data) {
        if (error.response.data.errors) {
          try {
            errorMessage =
              'Помилки валідації: <br/>' +
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
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
          if (error.response.status === 401) {
            errorMessage = 'Ви не аутентифіковані. Будь ласка, увійдіть знову.';
          }
        } else {
          errorMessage = JSON.stringify(error.response.data);
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      this.setState({
        error: errorMessage,
        loading: false,
        successMessage: '',
      });
    }
  };

  render() {
    const {
      name,
      description,
      category,
      quantityOrVolume,
      estimatedBudget,
      completionDate,
      supportingDocument,
      deliveryAddress,
      contactPhone,
      error,
      loading,
      successMessage,
      minCompletionDate,
    } = this.state;

    return (
      <div className={classes.universal}>
        <form
          className={classes.block}
          style={{ width: '60%', paddingLeft: '13em', paddingRight: '0' }}
          onSubmit={this.handleSubmit}
        >
          <h1 className={`${classes.label} ${classes.labelBlue}`}>
            <LuNotebookPen className={classes.icon} /> Зареєструйте нову
            закупівлю
          </h1>

          <label htmlFor="purch_name">Назва закупівлі:</label>
          <input
            type="text"
            id="purch_name"
            placeholder="Закупівля системних ПК...."
            name="name"
            value={name}
            onChange={this.handleChange}
            required
          />

          <label htmlFor="purch_desc">Опис закупівлі:</label>
          <textarea
            id="purch_desc"
            placeholder="Тендер на закупівлю нових або в хорошому стані ....."
            name="description"
            value={description}
            onChange={this.handleChange}
            rows={4}
            style={{ width: '70%', marginBottom: '1em' }}
            required
          />

          <label htmlFor="delivery_address">Адрес доставки:</label>
          <textarea
            id="delivery_address"
            placeholder="Місто, вулиця, будинок, квартира, відділення пошти..."
            name="deliveryAddress"
            value={deliveryAddress}
            onChange={this.handleChange}
            rows={3}
            style={{ width: '70%', marginBottom: '1em' }}
            required
          />

          <label htmlFor="contact_phone">Контактний номер телефону:</label>
          <input
            type="tel"
            id="contact_phone"
            placeholder="+380 XX XXX XX XX"
            name="contactPhone"
            value={contactPhone}
            onChange={this.handleChange}
            style={{
              width: '70%',
              background: 'rgb(243, 243, 247)',
              color: 'black',
              border: '1px solid gray',
              height: '2em',
              marginBottom: '1em',
              paddingLeft: '0.5em',
            }}
            required
            pattern="^\+?[0-9\s\(\)-]{10,18}$"
          />

          <label>Додайте супровідні документи:</label>
          <label
            htmlFor="supportingDocumentFile"
            className={classes.styledFile}
          >
            <GoPaperclip className={classes.icon} />
          </label>
          <input
            type="file"
            id="supportingDocumentFile"
            name="supportingDocument"
            onChange={this.handleChange}
            style={{ display: 'none' }}
          />
          {supportingDocument && <p>Обрано файл: {supportingDocument.name}</p>}

          <label>Вкажіть категорію</label>
          <select
            id="purch_category"
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
            <option value="Сільське господарство">Сільське господарство</option>
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

          <div style={{ backgroundColor: '#fff', marginBottom: '2em' }}>
            <label>Кількість/Обсяг</label>
            <input
              type="number"
              id="purch_amount"
              name="quantityOrVolume"
              value={quantityOrVolume}
              onChange={this.handleChange}
              required
              style={{
                marginRight: '1em',
                marginLeft: '0.5em',
                height: '2em',
                width: '15%',
              }}
              min="0.01"
              step="any"
            />

            <label>Орієнтовний бюджет($)</label>
            <input
              type="number"
              id="purch_budget"
              name="estimatedBudget"
              value={estimatedBudget}
              onChange={this.handleChange}
              required
              style={{ marginLeft: '0.5em', height: '2em', width: '15%' }}
              min="0.01"
              step="any"
            />
          </div>

          <div style={{ backgroundColor: '#fff' }}>
            <label>Завершення закупівлі:</label>
            <input
              type="date"
              id="purch_deadline"
              name="completionDate"
              value={completionDate}
              onChange={this.handleChange}
              required
              min={minCompletionDate}
            />
          </div>

          <input
            type="submit"
            className={classes.submit}
            value={loading ? 'Надсилання...' : 'Надіслати'}
            disabled={loading}
          />
        </form>

        {error && (
          <p
            style={{
              color: 'red',
              marginTop: '1em',
              width: '70%',
              marginLeft: 'auto',
              marginRight: 'auto',
              textAlign: 'center',
              fontWeight: 'bold',
              height: 'auto',
              minHeight: '2em',
              padding: '0.5em 0',
            }}
            dangerouslySetInnerHTML={{ __html: error }}
          ></p>
        )}
        {successMessage && (
          <p
            style={{
              color: 'green',
              marginTop: '1em',
              width: '70%',
              marginLeft: 'auto',
              marginRight: 'auto',
              textAlign: 'center',
              fontWeight: 'bold',
              height: '2em',
            }}
          >
            {successMessage}
          </p>
        )}
      </div>
    );
  }
}

export default NewOne;

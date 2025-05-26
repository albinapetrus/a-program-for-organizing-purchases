import React, { Component } from 'react';
import classes from './Universal.module.css'; // Переконайся, що шлях до CSS правильний
import { GoPaperclip } from "react-icons/go";
import axios from 'axios'; // Імпортуємо axios

// Переконайся, що baseURL для axios встановлено глобально десь на вході в застосунок
axios.defaults.baseURL = 'https://localhost:7078';

export class NewOne extends Component {
    constructor(props) {
        super(props);
        this.state = {
            // !!! ДОДАНО: Поля для збору даних форми закупівлі !!!
            name: '', // Назва закупівлі
            description: '', // Опис закупівлі
            category: '', // Категорія закупівлі
            quantityOrVolume: '', // Кількість/Обсяг
            estimatedBudget: '', // Орієнтовний бюджет
            completionDate: '', // Дата завершення закупівлі (формат РРРР-ММ-ДД)
            supportingDocument: null, // Для збереження об'єкта файлу

            error: '', // Для відображення помилок
            loading: false, // Стан завантаження
            successMessage: '', // Для відображення повідомлення про успіх
        };
    }

    // Метод для обробки зміни значень полів вводу, select та file
    handleChange = (e) => {
        const { name, value, type, files } = e.target;

        if (type === 'file') {
            // Якщо поле типу file, зберігаємо об'єкт File
            this.setState({ [name]: files[0], error: '', successMessage: '' }); // Очищаємо помилки та повідомлення при виборі файлу
        } else {
            // Для інших полів, зберігаємо значення
            this.setState({ [name]: value, error: '', successMessage: '' }); // Очищаємо помилки та повідомлення при введенні
        }
    };

    // Метод для відправки даних нової закупівлі на бекенд
    handleSubmit = async (e) => {
        e.preventDefault();

        // !!! Отримуємо всі необхідні дані зі стану !!!
        const { name, description, category, quantityOrVolume, estimatedBudget, completionDate, supportingDocument } = this.state;

        // Базова фронтенд валідація: перевірка на порожні обов'язкові поля
        // (Можна розширити цю валідацію згідно правил бекенду)
         if (!name || !category || quantityOrVolume === '' || estimatedBudget === '' || !completionDate) {
              this.setState({ error: 'Будь ласка, заповніть всі обов\'язкові поля.' });
              return;
         }
         // Якщо документ обов'язковий, додай перевірку:
         // if (!supportingDocument) {
         //      this.setState({ error: 'Будь ласка, завантажте супровідний документ.' });
         //      return;
         // }

        // Додаткова валідація для числових полів
        if (parseFloat(quantityOrVolume) <= 0) {
            this.setState({ error: 'Кількість/Обсяг має бути більше нуля.' });
            return;
        }
        if (parseFloat(estimatedBudget) <= 0) {
            this.setState({ error: 'Орієнтовний бюджет має бути більше нуля.' });
            return;
        }

        this.setState({ loading: true, error: '', successMessage: '' }); // Встановлюємо стан завантаження та очищаємо повідомлення

        // !!! Створюємо об'єкт FormData для відправки даних з файлом !!!
        const formData = new FormData();
        formData.append('Name', name); // Назва поля відповідає полю в DTO на бекенді
        formData.append('Description', description); // Назва поля відповідає полю в DTO на бекенді
        formData.append('Category', category); // Назва поля відповідає полю в DTO на бекенді
        formData.append('QuantityOrVolume', quantityOrVolume); // Назва поля відповідає полю в DTO на бекенді
        formData.append('EstimatedBudget', estimatedBudget); // Назва поля відповідає полю в DTO на бекенді
        // Додаємо дату, переконавшись, що формат відповідає очікуваному бекендом (YYYY-MM-DD)
        if (completionDate) {
             formData.append('CompletionDate', completionDate); // Назва поля відповідає полю в DTO на бекенді
        }

        // Додаємо файл, якщо він обраний
        if (supportingDocument) {
            // 'SupportingDocument' - це ім'я поля, яке очікує бекенд у CreateProcurementDto (IFormFile)
            formData.append('SupportingDocument', supportingDocument);
        }


        // !!! Отримуємо JWT токен з localStorage !!!
        const jwtToken = localStorage.getItem('jwtToken');

        // Перевіряємо, чи є токен
        if (!jwtToken) {
            this.setState({ error: 'Ви не аутентифіковані. Будь ласка, увійдіть.', loading: false });
            // Можливо, тут варто перенаправити на сторінку логіну
            // return <Navigate to="/form" />; // Або інший спосіб перенаправлення
            return;
        }

        try {
            // !!! Виконуємо POST запит до бекенду для створення закупівлі !!!
            // Адреса endpoint: /api/Procurements
            // Метод: POST
            // Дані: formData (multipart/form-data)
            // !!! Додаємо заголовок авторизації з JWT токеном !!!
            const response = await axios.post('/api/Procurements', formData, {
                headers: {
                    'Authorization': `Bearer ${jwtToken}` // Додаємо заголовок авторизації
                    // 'Content-Type': 'multipart/form-data' // Axios додасть цей заголовок автоматично для FormData
                }
            });

            console.log('Створення закупівлі успішне:', response.data);

            // !!! Обробка успіху !!!
            this.setState({
                successMessage: response.data.message || 'Закупівлю успішно створено!',
                error: '', // Очищаємо помилки
                loading: false,
                // Очищаємо форму після успішної відправки (опціонально)
                 name: '',
                 description: '',
                 category: '',
                 quantityOrVolume: '',
                 estimatedBudget: '',
                 completionDate: '',
                 supportingDocument: null,
            });


        } catch (error) {
            console.error('Помилка створення закупівлі:', error.response ? error.response.data : error.message);

            // Обробка помилок від бекенду
            let errorMessage = 'Сталася помилка під час створення закупівлі.';
             if (error.response && error.response.data) {
                 if (error.response.data.errors) {
                      // Обробка валідаційних помилок
                      const validationErrors = error.response.data.errors;
                       try {
                           errorMessage = 'Помилки валідації: <br/>' +
                               Object.entries(validationErrors)
                                     .map(([field, errors]) =>
                                         `<strong>${field}:</strong> ${errors.join(', ')}`
                                     )
                                     .join('<br/>');
                       } catch (e) {
                           errorMessage = 'Помилки валідації: ' + JSON.stringify(error.response.data.errors);
                       }

                 } else if (error.response.data.message) {
                      // Обробка загального повідомлення про помилку (наприклад, відмовлено в доступі)
                      errorMessage = error.response.data.message;
                      // Якщо помилка 401, токен недійсний або відсутній
                       if (error.response.status === 401) {
                           errorMessage = 'Ви не аутентифіковані. Будь ласка, увійдіть знову.';
                           // Можливо, тут варто очистити токен і перенаправити на логін
                           // localStorage.removeItem('jwtToken');
                           // this.setState({ redirect: true }); // Navigate to "/form"
                       }
                 } else {
                      // Якщо data існує, але не має очікуваного формату
                       errorMessage = JSON.stringify(error.response.data);
                 }
             } else if (error.message) {
                  // Обробка мережевих помилок
                  errorMessage = error.message;
             }


            this.setState({ error: errorMessage, loading: false, successMessage: '' }); // Очищаємо повідомлення про успіх
        }
    };


    render() {
        // !!! Отримуємо всі необхідні поля зі стану для прив'язки !!!
        const { name, description, category, quantityOrVolume, estimatedBudget, completionDate, supportingDocument, error, loading, successMessage } = this.state;

        return (
            <div className={classes.universal}>
                {/* Прив'язуємо метод handleSubmit до події onSubmit форми */}
                <form className={classes.block} style={{width:"76%", paddingLeft:"17em" , paddingRight:"0"}} onSubmit={this.handleSubmit}>
                    <h1 className={`${classes.label} ${classes.labelBlue}`}>Зареєструйте нову закупівлю</h1>

                    {/* Поле "Назва закупівлі" - Прив'язуємо до стану */}
                    <label htmlFor="purch_name">Назва закупівлі:</label>
                    <input
                        type="text"
                        id="purch_name"
                        placeholder="Закупівля системних ПК...."
                        name="name" // !!! Ім'я відповідає полю в DTO на бекенді !!!
                        value={name} // Значення зі стану
                        onChange={this.handleChange} // Обробник зміни
                        required // Робимо обов'язковим (HTML5)
                    />

                    {/* Поле "Опис закупівлі" - Прив'язуємо до стану */}
                    {/* Твоє поле вводу для опису має тип text, хоча зазвичай це textarea для опису */}
                    {/* Якщо на бекенді очікується string, то input type="text" підійде, але textarea краще для довгих текстів */}
                    <label htmlFor="purch_desc">Опис закупівлі:</label>
                     <input
                         type="text" // Можливо, варто змінити на textarea
                         id="purch_desc"
                         placeholder="Тендер на закупівлю нових або в хорошому стані ....."
                         name="description" // !!! Ім'я відповідає полю в DTO на бекенді !!!
                         value={description} // Значення зі стану
                         onChange={this.handleChange} // Обробник зміни
                         // required // Якщо опис обов'язковий
                     />
                    {/* Якщо використовуєш textarea: */}
                    {/*
                     <textarea
                         id="purch_desc"
                         placeholder="Тендер на закупівлю нових або в хорошому стані ....."
                         name="description" // Ім'я відповідає полю в DTO на бекенді
                         value={description} // Значення зі стану
                         onChange={this.handleChange} // Обробник зміни
                         // required // Якщо опис обов'язковий
                     ></textarea>
                    */}


                    {/* Поле "Додайте супровідні документи" - Прив'язуємо до стану */}
                    <label>Додайте супровідні документи:</label>
                    {/* Label стилізований як кнопка */}
                    <label htmlFor="supportingDocumentFile" className={classes.styledFile}><GoPaperclip className={classes.icon} /></label>
                    {/* Приховане поле input типу file */}
                    <input
                        type="file"
                        id="supportingDocumentFile" // ID, на який посилається label
                        name="supportingDocument" // !!! Ім'я відповідає полю в DTO на бекенді (IFormFile) !!!
                        onChange={this.handleChange} // Обробник зміни (збереже файл у стані)
                        style={{ display: "none" }} // Приховуємо стандартне поле file
                        // required // Якщо документ обов'язковий
                    />
                    {/* Відображення імені обраного файлу, якщо він обраний */}
                    {supportingDocument && <p>Обрано файл: {supportingDocument.name}</p>}


                    {/* Випадаючий список категорій - Прив'язуємо до стану */}
                    <label>Вкажіть категорію</label>
                    <select
                        id="purch_category"
                        name="category" // !!! Ім'я відповідає полю в DTO на бекенді !!!
                        value={category} // Значення зі стану
                        onChange={this.handleChange} // Обробник зміни
                        required // Робимо обов'язковим (HTML5)
                    >
                        {/* Опція за замовчуванням або порожня */}
                        <option value="" disabled hidden>Оберіть категорію</option> {/* Приклад */}
                        {/* Опції категорій (збігаються з auth3, можна винести в окремий масив) */}
                        <option value="Будівництво">Будівництво</option>
                        <option value="Медицина">Медицина</option>
                        <option value="Меблі">Меблі</option>
                        <option value="Комп'ютерна техніка">Комп'ютерна техніка</option>
                        <option value="Канцелярія та госптовари">Канцелярія та госптовари</option>
                        <option value="Транспорт та запчастини">Транспорт та запчастини</option>
                        <option value="Енергетика, нафтопродукти та паливо">Енергетика, нафтопродукти та паливо</option>
                        <option value="Метали">Метали</option>
                        <option value="Комунальне та побутове обслуговування">Комунальне та побутове обслуговування</option>
                        <option value="Навчання та консалтинг">Навчання та консалтинг</option>
                        <option value="Нерухомість">Нерухомість</option>
                        <option value="Сільське господарство">Сільське господарство</option>
                        <option value="Одяг, взуття та текстиль">Одяг, взуття та текстиль</option>
                        <option value="Промислове обладнання та прилади">Промислове обладнання та прилади</option>
                        <option value="Харчування">Харчування</option>
                        <option value="Поліграфія">Поліграфія</option>
                        <option value="Науково-дослідні роботи">Науково-дослідні роботи</option>
                        <option value="Різні послуги та товари">Різні послуги та товари</option>
                    </select>

                    <div style={{ backgroundColor: "#fff", marginBottom: "2em" }}>
                        {/* Поле "Кількість/Обсяг" - Прив'язуємо до стану */}
                        <label>Кількість/Обсяг</label>
                        <input
                            type="number"
                            id="purch_amount"
                            name="quantityOrVolume" // !!! Ім'я відповідає полю в DTO на бекенді !!!
                            value={quantityOrVolume} // Значення зі стану
                            onChange={this.handleChange} // Обробник зміни
                            required // Робимо обов'язковим (HTML5)
                            style={{ marginRight: "1em", marginLeft: "0.5em", height: "2em", width: "15%" }}
                            min="0" // Додаємо HTML5 валідацію мінімального значення
                        />

                        {/* Поле "Орієнтовний бюджет" - Прив'язуємо до стану */}
                        <label>Орієнтовний бюджет($)</label>
                        <input
                            type="number"
                            id="purch_budget"
                            name="estimatedBudget" // !!! Ім'я відповідає полю в DTO на бекенді !!!
                            value={estimatedBudget} // Значення зі стану
                            onChange={this.handleChange} // Обробник зміни
                            required // Робимо обов'язковим (HTML5)
                            style={{ marginLeft: "0.5em", height: "2em", width: "15%" }}
                            min="0" // Додаємо HTML5 валідацію мінімального значення
                        />
                    </div>

                    <div style={{ backgroundColor: "#fff" }}>
                        {/* Поле "Завершення закупівлі" - Прив'язуємо до стану */}
                        <label>Завершення закупівлі:</label>
                        <input
                            type="date"
                            id="purch_deadline"
                            name="completionDate" // !!! Ім'я відповідає полю в DTO на бекенді !!!
                            value={completionDate} // Значення зі стану
                            onChange={this.handleChange} // Обробник зміни
                            required // Робимо обов'язковим (HTML5)
                        />
                    </div>

                    {/* Кнопка відправки форми */}
                    <input
                        type="submit"
                        className={classes.submit} // Якщо ти використовуєш клас submit для стилізації кнопки
                        value={loading ? 'Надсилання...' : 'Надіслати'} // Текст кнопки під час завантаження
                        disabled={loading} // Вимикаємо кнопку під час завантаження
                        // placeholder="Створити закупівлю" // placeholder для type="submit" не має ефекту
                    />

                </form>

                 {/* Місце для відображення повідомлень про помилки або успіх */}
                 {error && (
                     <p style={{ color: 'red', marginTop: '1em', width:"70%", marginLeft:"auto", marginRight:"auto", textAlign:"center", fontWeight:"bold", height:"2em" }} dangerouslySetInnerHTML={{ __html: error }}></p>
                 )}
                 {successMessage && (
                      <p style={{ color: 'green', marginTop: '1em', width:"70%", marginLeft:"auto", marginRight:"auto", textAlign:"center", fontWeight:"bold", height:"2em" }}>{successMessage}</p>
                 )}

            </div>
        );
    }
}

export default NewOne;
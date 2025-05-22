import React, { Component } from 'react';
import classes from './auth.module.css';
import { GiTakeMyMoney } from "react-icons/gi";
import { TbPigMoney } from "react-icons/tb";
import { Link, Navigate } from 'react-router-dom';
import axios from 'axios'; // Імпортуємо axios

// Переконайся, що baseURL встановлено глобально
 axios.defaults.baseURL = 'https://localhost:7078';

export class auth2 extends Component {
    constructor(props) {
        super(props);
        this.state = {
            redirect: false, 
            selectedRole: localStorage.getItem('role') || 'supplier', 
            legalStatus: '', 
            fullName: '', 
            ipn: '',
            dateOfBirth: '', 
            passportPhoto: null, 

            error: '',
            loading: false, 
        };
    }

    // Метод для обробки зміни значень полів вводу та файлу
    handleChange = (e) => {
        const { name, value, type, files } = e.target;

        if (type === 'file') {
            // Якщо поле типу file, зберігаємо об'єкт File
            this.setState({ [name]: files[0], error: '' });
        } else {
            // Для інших полів, зберігаємо значення
            this.setState({ [name]: value, error: '' }); // Очищаємо помилку при введенні
        }
    };

    // Метод для обробки зміни ролі (якщо клікаємо на label)
    handleRoleChange = (role) => {
        this.setState({ selectedRole: role });
        localStorage.setItem('role', role); // Зберігаємо роль у localStorage (опціонально, якщо потрібно запам'ятати вибір при перезавантаженні)
    };


    // Метод для відправки даних другого етапу на бекенд
    handleSubmit = async (e) => {
        e.preventDefault();

        // !!! Отримуємо всі необхідні дані зі стану !!!
        const { selectedRole, legalStatus, fullName, ipn, dateOfBirth, passportPhoto } = this.state;

        // !!! Отримуємо ID користувача, збережений на першому етапі !!!
        const userId = localStorage.getItem('registeringUserId');

        // Базова фронтенд валідація: перевірка на наявність User ID (для налагодження)
        if (!userId) {
            this.setState({ error: 'Помилка: ID користувача не знайдено в localStorage. Почніть реєстрацію з першого етапу.' });
            return;
        }

        // Базова фронтенд валідація: перевірка на порожні обов'язкові поля (крім файлу)
         // (Можна розширити цю валідацію згідно правил бекенду)
        if (!selectedRole || !legalStatus || !fullName || !ipn || !dateOfBirth) {
             this.setState({ error: 'Будь ласка, заповніть всі обов\'язкові текстові поля.' });
             return;
        }
        // Якщо фото паспорту обов'язкове, додай перевірку:
        // if (!passportPhoto) {
        //      this.setState({ error: 'Будь ласка, завантажте фото паспорту.' });
        //      return;
        // }


        this.setState({ loading: true, error: '' }); // Встановлюємо стан завантаження

        // !!! Створюємо об'єкт FormData для відправки даних з файлом !!!
        const formData = new FormData();
        formData.append('UserId', userId); // !!! Додаємо User ID до FormData (назва поля має співпадати з DTO на бекенді) !!!
        formData.append('Role', selectedRole); // Назва поля має співпадати з DTO на бекенді
        formData.append('LegalStatus', legalStatus); // Назва поля має співпадати з DTO на бекенді
        formData.append('FullName', fullName); // Назва поля має співпадати з DTO на бекенді
        formData.append('Ipn', ipn); // Назва поля має співпадати з DTO на бекенді
        // Додаємо дату, переконавшись, що формат відповідає очікуваному бекендом (YYYY-MM-DD)
         if (dateOfBirth) {
             formData.append('DateOfBirth', dateOfBirth);
         }


        // Додаємо файл фото паспорту, якщо він обраний
        if (passportPhoto) {
            // 'PassportPhoto' - це ім'я поля, яке очікує бекенд у RegisterStep2Dto (IFormFile)
            formData.append('PassportPhoto', passportPhoto);
        }


        try {
            // !!! Виконуємо PUT запит до бекенду для другого етапу !!!
            // Адреса endpoint: /api/Auth/profile/step2
            // Метод: PUT
            // Дані: formData (multipart/form-data)
            // Цей ендпоінт не вимагає JWT токена, оскільки ми передаємо User ID в тілі запиту.
            const response = await axios.put('/api/Auth/profile/step2', formData); // Використовуємо PUT

            console.log('Етап 2 реєстрації успішний:', response.data);

            // Можна отримати оновлений userId або іншу інформацію, якщо бекенд її повертає
            // const nextUserId = response.data.userId;
            // Якщо потрібно передати ID далі на Етап 3, можна зберегти його знову,
            // але якщо бекенд не повертає новий ID, використовуємо той самий збережений
            // localStorage.setItem('registeringUserId', nextUserId || userId);


            // !!! Перенаправляємо на сторінку третього етапу !!!
            this.setState({ redirect: true, loading: false });


        } catch (error) {
            console.error('Помилка на етапі 2 реєстрації:', error.response ? error.response.data : error.message);

            // Обробка помилок від бекенду
            let errorMessage = 'Сталася помилка на етапі 2 реєстрації.';
             if (error.response && error.response.data) {
                 if (error.response.data.errors) {
                      // Обробка валідаційних помилок від бекенду
                      const validationErrors = error.response.data.errors;
                      // Збираємо всі повідомлення про помилки з усіх полів
                      // error.response.data.errors може мати формат { "FieldName": ["Error1", "Error2"], ... }
                       try {
                           errorMessage = 'Помилки валідації: <br/>' +
                               Object.entries(validationErrors)
                                     .map(([field, errors]) =>
                                         `<strong>${field}:</strong> ${errors.join(', ')}`
                                     )
                                     .join('<br/>');
                       } catch (e) {
                           // На випадок, якщо формат errors не такий, як очікується
                           errorMessage = 'Помилки валідації: ' + JSON.stringify(error.response.data.errors);
                       }

                 } else if (error.response.data.message) {
                      // Обробка загального повідомлення про помилку
                      errorMessage = error.response.data.message;
                 } else {
                      // Якщо data існує, але не має очікуваного формату
                       errorMessage = JSON.stringify(error.response.data);
                 }
             } else if (error.message) {
                  // Обробка мережевих помилок
                  errorMessage = error.message;
             }


            this.setState({ error: errorMessage, loading: false });
        }
    };

    render() {
        // Програмне перенаправлення, якщо redirect === true
        if (this.state.redirect) {
            return <Navigate to="/auth3" />; // Перенаправляємо на третій етап
        }

        // !!! Отримуємо всі необхідні поля зі стану для прив'язки !!!
        const { selectedRole, legalStatus, fullName, ipn, dateOfBirth, passportPhoto, error, loading } = this.state;

        return (
            <div className={classes.auth}>

                <p style={{ color: "#2070d1" }}>Всього 4 кроки до участі у закупівлі</p>
                <div className={classes.around}>
                    {/* Кружечки етапів */}
                    <div className={`${classes.circle} ${classes.circle1}`}>1</div>
                    <div className={`${classes.circle} ${classes.circle1}`}>2</div> {/* Цей етап активний */}
                    <div className={classes.circle}>3</div>
                    <div className={classes.circle}>4</div>
                </div>

                {/* Прив'язуємо метод handleSubmit до події onSubmit форми */}
                <form className={classes.form1} onSubmit={this.handleSubmit}>
                    <fieldset className={classes.fieldset}>

                        {/* Вибір ролі (Постачальник/Замовник) - логіка onClick залишається */}
                        <label
                            className={`${classes.role} ${classes.role2} ${selectedRole === 'supplier' ? classes.activeRole : classes.inactiveRole}`}
                            onClick={() => this.handleRoleChange('supplier')}>
                            {/* input[type="radio"] для Постачальника */}
                            <input
                                type="radio"
                                name="role"
                                value="supplier"
                                checked={selectedRole === 'supplier'} // Прив'язка до стану
                                onChange={() => {}} // Пустий onChange, оскільки обробка вже в onClick label
                                style={{ display: "none" }}
                                required // Робимо обов'язковим (HTML5)
                            />
                            Постачальник <TbPigMoney className={classes.icon} />
                        </label>

                        <label
                            className={`${classes.role} ${classes.role1} ${selectedRole === 'customer' ? classes.activeRole : classes.inactiveRole}`}
                            onClick={() => this.handleRoleChange('customer')}>
                             {/* input[type="radio"] для Замовника */}
                            <input
                                type="radio"
                                name="role"
                                value="customer"
                                checked={selectedRole === 'customer'} // Прив'язка до стану
                                onChange={() => {}} // Пустий onChange
                                style={{ display: "none" }}
                                required // Робимо обов'язковим (HTML5)
                            />
                            Замовник <GiTakeMyMoney className={classes.icon} />
                        </label>

                        {/* Вибір правового статусу (Фізичне/Юридичне лице) - Прив'язуємо до стану */}
                        <label className={classes.first}>Вкажіть правовий статус:</label>
                        <div>
                            <input
                                type="radio"
                                id="fiz"
                                name="legalStatus" // Ім'я відповідає полю у стані
                                value="fiz"
                                checked={legalStatus === 'fiz'} // Прив'язка до стану
                                onChange={this.handleChange} // Обробляємо зміну стану
                                required // Робимо обов'язковим (HTML5)
                            />
                            <label htmlFor="fiz">Фізичне лице</label>

                            <input
                                type="radio"
                                id="ur"
                                name="legalStatus" // Ім'я відповідає полю у стані
                                value="ur"
                                checked={legalStatus === 'ur'} // Прив'язка до стану
                                onChange={this.handleChange} // Обробляємо зміну стану
                                required // Робимо обов'язковим (HTML5)
                            />
                            <label htmlFor="ur">Юридичне лице</label>
                        </div>

                        {/* Поле для ПІБ - Прив'язуємо до стану */}
                        <label>Вкажіть ПІБ</label>
                        <input
                            type="text"
                            name="fullName" // Ім'я відповідає полю у стані
                            value={fullName} // Значення зі стану
                            onChange={this.handleChange} // Обробник зміни
                            required // Робимо обов'язковим (HTML5)
                        />

                        {/* Поле для ІПН - Прив'язуємо до стану */}
                        <label>Вкажіть ІПН</label>
                        <input
                            type="text"
                            name="ipn" // Ім'я відповідає полю у стані
                            value={ipn} // Значення зі стану
                            onChange={this.handleChange} // Обробник зміни
                            pattern="[0-9]{10}" // Валідація на фронтенді (HTML5)
                            required // Робимо обов'язковим (HTML5)
                        />

                        <label>Вкажіть дату народження</label>
                        <input
                            type="date"
                            name="dateOfBirth" 
                            value={dateOfBirth} 
                            onChange={this.handleChange} 
                        />

                        <label>Вставте фото паспорту для перевірки (першу сторінку)</label>
                        <label htmlFor="passportPhotoFile" className={classes.styledFile}>Завантажити</label>
                        <input
                            type="file"
                            id="passportPhotoFile" 
                            name="passportPhoto" 
                            onChange={this.handleChange} 
                            style={{ display: "none" }} 
                        />
                         {passportPhoto && <p style={{background:"white", color:"#2070d1"}}>Обрано файл: {passportPhoto.name}</p>}


                        <input
                            type="submit"
                            className={classes.submit}
                            value={loading ? 'Відправка...' : 'Далі'}
                            disabled={loading} 
                        />
                    </fieldset>
                </form>

                {error && (
                    <p style={{ color: 'red' }} dangerouslySetInnerHTML={{ __html: error }}></p>
                )}

             

            </div>
        );
    }
}

export default auth2;
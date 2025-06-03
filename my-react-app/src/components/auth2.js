import React, { Component } from 'react';
import classes from './auth.module.css';
import { GiTakeMyMoney } from "react-icons/gi";
import { TbPigMoney } from "react-icons/tb";
import {  Navigate } from 'react-router-dom';
import axios from 'axios'; 

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

    handleChange = (e) => {
        const { name, value, type, files } = e.target;

        if (type === 'file') {
            this.setState({ [name]: files[0], error: '' });
        } else {
            this.setState({ [name]: value, error: '' }); 
        }
    };

    handleRoleChange = (role) => {
        this.setState({ selectedRole: role });
        localStorage.setItem('role', role); 
    };

    handleSubmit = async (e) => {
        e.preventDefault();
        const { selectedRole, legalStatus, fullName, ipn, dateOfBirth, passportPhoto } = this.state;

        const userId = localStorage.getItem('registeringUserId');

        if (!userId) {
            this.setState({ error: 'Помилка: ID користувача не знайдено в localStorage. Почніть реєстрацію з першого етапу.' });
            return;
        }

        if (!selectedRole || !legalStatus || !fullName || !ipn || !dateOfBirth) {
             this.setState({ error: 'Будь ласка, заповніть всі обов\'язкові текстові поля.' });
             return;
        }
     
        this.setState({ loading: true, error: '' }); 

        const formData = new FormData();
        formData.append('UserId', userId); 
        formData.append('Role', selectedRole);
        formData.append('LegalStatus', legalStatus); 
        formData.append('FullName', fullName); 
        formData.append('Ipn', ipn); 

         if (dateOfBirth) {
             formData.append('DateOfBirth', dateOfBirth);
         }


       
        if (passportPhoto) {
            formData.append('PassportPhoto', passportPhoto);
        }


        try {
            const response = await axios.put('/api/Auth/profile/step2', formData); 

            console.log('Етап 2 реєстрації успішний:', response.data);
            this.setState({ redirect: true, loading: false });


        } catch (error) {
            console.error('Помилка на етапі 2 реєстрації:', error.response ? error.response.data : error.message);

            let errorMessage = 'Сталася помилка на етапі 2 реєстрації.';
             if (error.response && error.response.data) {
                 if (error.response.data.errors) {
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
            return <Navigate to="/auth3" />; 
        }

        const { selectedRole, legalStatus, fullName, ipn, dateOfBirth, passportPhoto, error, loading } = this.state;

        return (
            <div className={classes.auth}>

                <p style={{ color: "#2070d1" }}>Всього 4 кроки до участі у закупівлі</p>
                <div className={classes.around}>
                    <div className={`${classes.circle} ${classes.circle1}`}>1</div>
                    <div className={`${classes.circle} ${classes.circle1}`}>2</div>
                    <div className={classes.circle}>3</div>
                    <div className={classes.circle}>4</div>
                </div>

                <form className={classes.form1} onSubmit={this.handleSubmit}>
                    <fieldset className={classes.fieldset}>

                        <label
                            className={`${classes.role} ${classes.role2} ${selectedRole === 'supplier' ? classes.activeRole : classes.inactiveRole}`}
                            onClick={() => this.handleRoleChange('supplier')}>
                            <input
                                type="radio"
                                name="role"
                                value="supplier"
                                checked={selectedRole === 'supplier'} 
                                onChange={() => {}} 
                                style={{ display: "none" }}
                                required 
                            />
                            Постачальник <TbPigMoney className={classes.icon} />
                        </label>

                        <label
                            className={`${classes.role} ${classes.role1} ${selectedRole === 'customer' ? classes.activeRole : classes.inactiveRole}`}
                            onClick={() => this.handleRoleChange('customer')}>
                            <input
                                type="radio"
                                name="role"
                                value="customer"
                                checked={selectedRole === 'customer'}
                                onChange={() => {}} 
                                style={{ display: "none" }}
                                required 
                            />
                            Замовник <GiTakeMyMoney className={classes.icon} />
                        </label>

                        <label className={classes.first}>Вкажіть правовий статус:</label>
                        <div>
                            <input
                                type="radio"
                                id="fiz"
                                name="legalStatus" 
                                value="fiz"
                                checked={legalStatus === 'fiz'} 
                                onChange={this.handleChange} 
                                required 
                            />
                            <label htmlFor="fiz">Фізичне лице</label>

                            <input
                                type="radio"
                                id="ur"
                                name="legalStatus" 
                                value="ur"
                                checked={legalStatus === 'ur'} 
                                onChange={this.handleChange}
                                required 
                            />
                            <label htmlFor="ur">Юридичне лице</label>
                        </div>

                        <label>Вкажіть ПІБ</label>
                        <input
                            type="text"
                            name="fullName" 
                            value={fullName} 
                            onChange={this.handleChange} 
                            required 
                        />

                        <label>Вкажіть ІПН</label>
                        <input
                            type="text"
                            name="ipn" 
                            value={ipn} 
                            onChange={this.handleChange} 
                            pattern="[0-9]{10}"
                            required 
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
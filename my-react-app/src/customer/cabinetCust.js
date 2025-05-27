import React, { Component } from 'react';
import classes from './Universal.module.css'; // Переконайтеся, що шлях правильний
import { IoPersonSharp } from "react-icons/io5";
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext'; // Переконайтеся, що шлях правильний
import { CiCircleCheck } from "react-icons/ci";
import { CiCircleRemove } from "react-icons/ci";

export class CabinetCustComponent extends Component {
    static contextType = AuthContext;

    constructor(props) {
        super(props);
        this.state = {
            companyName: 'Завантаження...',
            email: 'Завантаження...',
            role: 'Завантаження...',
            error: '',
            loading: true,
            isEditingCompanyName: false,
            newCompanyName: '',
            updateSuccess: '',
        };
        this.navigate = props.navigate;
    }

    async componentDidMount() {
        await this.fetchUserProfile();
    }

    fetchUserProfile = async () => {
        this.setState({ loading: true, error: '', updateSuccess: '' });

        const { logout } = this.context;

        const jwtToken = localStorage.getItem('jwtToken');

        if (!jwtToken) {
            console.log("CabinetCust: Токена немає при завантаженні профілю. Викликаємо logout і перенаправляємо.");
            logout();
            this.navigate('/form');
            this.setState({
                error: 'Ви не аутентифіковані. Будь ласка, увійдіть.',
                loading: false,
            });
            return;
        }

        try {
            const response = await axios.get('/api/users/profile', {
                headers: {
                    'Authorization': `Bearer ${jwtToken}`
                }
            });

            const userData = response.data;
            this.setState({
                companyName: userData.companyName || 'Не вказано',
                email: userData.email || 'Не вказано',
                role: (userData.role || 'Не вказано').toLowerCase(),
                newCompanyName: userData.companyName || '',
                loading: false,
                error: '',
            });

        } catch (error) {
            console.error('Помилка завантаження профілю:', error.response ? error.response.data : error.message);
            let errorMessage = 'Не вдалося завантажити профіль користувача. Спробуйте пізніше.';

            if (error.response) {
                if (error.response.status === 401) {
                    errorMessage = 'Сесія закінчилася або ви не авторизовані. Будь ласка, увійдіть знову.';
                    console.log("CabinetCust: Отримано 401 помилку. Викликаємо logout і перенаправляємо.");
                    logout();
                    this.navigate('/form');
                } else if (error.response.data && error.response.data.message) {
                    errorMessage = error.response.data.message;
                } else if (error.response.data) {
                    errorMessage = JSON.stringify(error.response.data);
                }
            } else if (error.message) {
                errorMessage = error.message;
            }
            this.setState({ error: errorMessage, loading: false });
        }
    };

    handleLogout = () => {
        const { logout } = this.context;
        console.log("CabinetCust: Кнопка 'Вийти' натиснута. Викликаємо logout і перенаправляємо.");
        logout();
        this.navigate('/form');
    };

    handleEditClick = () => {
        this.setState({ isEditingCompanyName: true, error: '', updateSuccess: '' });
    };

    handleCompanyNameChange = (event) => {
        this.setState({ newCompanyName: event.target.value });
    };

    handleSaveCompanyName = async () => {
        const { newCompanyName, companyName } = this.state;
        if (newCompanyName.trim() === companyName.trim()) {
            this.setState({ isEditingCompanyName: false, error: '', updateSuccess: 'Назва компанії не змінилася.' });
            return;
        }
        if (newCompanyName.trim() === '') {
            this.setState({ error: 'Назва компанії не може бути порожньою.', updateSuccess: '' });
            return;
        }

        this.setState({ loading: true, error: '', updateSuccess: '' });
        const jwtToken = localStorage.getItem('jwtToken');

        if (!jwtToken) {
            this.setState({ error: 'Ви не аутентифіковані. Будь ласка, увійдіть.', loading: false });
            return;
        }

        try {
            const response = await axios.patch('/api/users/company-name', {
                companyName: newCompanyName
            }, {
                headers: {
                    'Authorization': `Bearer ${jwtToken}`,
                    'Content-Type': 'application/json'
                }
            });

            this.setState({
                companyName: newCompanyName,
                isEditingCompanyName: false,
                loading: false,
                updateSuccess: response.data.message || 'Назва компанії успішно оновлена!',
                error: '',
            });
        } catch (error) {
            console.error('Помилка оновлення назви компанії:', error.response ? error.response.data : error.message);
            let errorMessage = 'Не вдалося оновити назву компанії. Спробуйте пізніше.';
            if (error.response) {
                if (error.response.data && error.response.data.message) {
                    errorMessage = error.response.data.message;
                } else if (error.response.data) {
                    errorMessage = JSON.stringify(error.response.data);
                }
            } else if (error.message) {
                errorMessage = error.message;
            }
            this.setState({ error: errorMessage, loading: false, updateSuccess: '' });
        }
    };

    handleCancelEdit = () => {
        this.setState(prevState => ({
            isEditingCompanyName: false,
            newCompanyName: prevState.companyName,
            error: '',
            updateSuccess: '',
        }));
    };

    render() {
        const { companyName, email, role, error, loading, isEditingCompanyName, newCompanyName, updateSuccess } = this.state;

        let displayRole = 'Завантаження...';
        if (!loading && !error) {
            if (role === 'customer') {
                displayRole = 'Замовник';
            } else if (role === 'supplier') {
                displayRole = 'Постачальник';
            } else {
                displayRole = role;
            }
        }

        return (
            <div className={classes.universal}>
                <div className={classes.block2}>
                    <div style={{ fontSize: "130%" }} className={classes.help} >
                        <h1 className={`${classes.label} ${classes.labelBlue}`}>
                            <IoPersonSharp className={classes.icon} />Ваш кабінет
                        </h1>
                        {loading ? (
                            <p>Завантаження даних профілю...</p>
                        ) : error && !isEditingCompanyName ? (
                            <p style={{ color: 'red', fontWeight: 'bold' }}>{error}</p>
                        ) : (
                            <>
                                <p style={{ fontWeight: "bold" }}>
                                    Назва компанії: {" "}
                                    {isEditingCompanyName ? (
                                        // <<-- ПОЛЕ ВВЕДЕННЯ В РЕЖИМІ РЕДАГУВАННЯ та КНОПКИ ОБ'ЄДНАНІ В ОДИН БЛОК
                                        <div className={classes.companyNameEditGroup}>
                                            <input
                                                type="text"
                                                value={newCompanyName}
                                                onChange={this.handleCompanyNameChange}
                                                className={classes.companyNameInput}
                                            />
                                            <button onClick={this.handleSaveCompanyName} className={classes.buttonSave}> <CiCircleCheck style={{color:"green", background:"white", fontSize:"1.5em"}}/> </button>
                                            <button onClick={this.handleCancelEdit} className={classes.buttonCancel}><CiCircleRemove style={{color:"red", background:"white", fontSize:"1.5em"}}/></button>
                                        </div>
                                    ) : (
                                        // <<-- ЗВИЧАЙНИЙ ТЕКСТ, КОЛИ НЕ РЕДАГУЄМО
                                        <span style={{ color: "orange" }}>{companyName}</span>
                                    )}
                                </p>
                                {error && isEditingCompanyName && (
                                    <p style={{ color: 'red', fontSize: '0.9em', marginTop: '5px' }}>{error}</p>
                                )}
                                <p>Email: <span style={{ fontWeight: "bold" }}>{email}</span></p>
                                <p>Роль: <span style={{ color: "green", fontWeight: 'bold' }}>{displayRole}</span></p>
                                {updateSuccess && <p style={{ color: 'green', fontWeight: 'bold', marginTop: '10px' }}>{updateSuccess}</p>}
                            </>
                        )}
                    </div>
                </div>

                {/* Умовне відображення кнопок залежно від ролі */}
                {role === 'customer' && (
                    <>
                        <div className={classes.help2}>
                            <button className={classes.buttonHelp} onClick={this.handleEditClick}>Редагувати</button>
                            <Link to="/myprocurements" className={classes.buttonHelpLink}>
                                Мої закупівлі
                            </Link>
                        </div>
                        <div className={classes.help2}>
                            <Link to="/newOne" className={classes.buttonHelpLink}>
                                Додати закупівлю
                            </Link>
                            <button className={classes.buttonHelp} onClick={this.handleLogout}>Вийти</button>
                        </div>
                    </>
                )}

                {role === 'supplier' && (
                    <>
                        <div className={classes.help2}>
                            <button className={classes.buttonHelp} onClick={this.handleEditClick}>Редагувати</button>
                            <Link to="/myoffers" className={classes.buttonHelpLink}>
                                Мої пропозиції
                            </Link>
                        </div>
                        <div className={classes.help2}>
                            <Link to="/ProcurementSearch" className={classes.buttonHelpLink}>
                                Знайти закупівлю
                            </Link>
                            <button className={classes.buttonHelp} onClick={this.handleLogout}>Вийти</button>
                        </div>
                    </>
                )}

                {role !== 'customer' && role !== 'supplier' && !loading && !error && (
                    <div className={classes.help2}>
                        <button className={classes.buttonHelp} onClick={this.handleLogout}>Вийти</button>
                        <p style={{ marginTop: '10px', color: '#666' }}>Для вашої ролі додаткові дії на цій сторінці не передбачені.</p>
                    </div>
                )}
            </div>
        );
    }
}

function WithRouter(Component) {
    function ComponentWithRouterProp(props) {
        let navigate = useNavigate();
        return <Component {...props} navigate={navigate} />;
    }
    return ComponentWithRouterProp;
}

export default WithRouter(CabinetCustComponent);
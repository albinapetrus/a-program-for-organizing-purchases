import React, { useState, useEffect } from 'react';
import axios from 'axios';
import classes from '../customer/Universal.module.css';
import { IoSearchOutline } from "react-icons/io5";
import { Link, useNavigate } from 'react-router-dom';

function ProcurementSearch() {
    const navigate = useNavigate();

    const [searchName, setSearchName] = useState('');
    const [searchCategory, setSearchCategory] = useState('');

    const [procurements, setProcurements] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const categories = [
        "Будівництво", "Медицина", "Меблі", "Комп'ютерна техніка",
        "Канцелярія та госптовари", "Транспорт та запчастини",
        "Енергетика, нафтопродукти та паливо", "Метали",
        "Комунальне та побутове обслуговування", "Навчання та консалтинг",
        "Нерухомість", "Сільське господарство", "Одяг, взуття та текстиль",
        "Промислове обладнання та прилади", "Харчування", "Поліграфія",
        "Науково-дослідні роботи", "Різні послуги та товари"
    ];

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');
        setProcurements([]);

        try {
            const params = {};
            if (searchName) {
                params.name = searchName;
            }
            if (searchCategory) {
                params.category = searchCategory;
            }

            const jwtToken = localStorage.getItem('jwtToken');
            const headers = jwtToken ? { 'Authorization': `Bearer ${jwtToken}` } : {};

            const response = await axios.get('/api/procurements/search', {
                params: params,
                headers: headers
            });

            if (response.data && response.data.length > 0) {
                setProcurements(response.data);
            } else {
                setMessage('За вашим запитом закупівель не знайдено.');
            }
        } catch (err) {
            console.error('Помилка пошуку закупівель:', err.response ? err.response.data : err.message);
            setError('Не вдалося виконати пошук закупівель. Спробуйте пізніше.');
            if (err.response && err.response.status === 401) {
                setError('Ви не авторизовані для перегляду закупівель. Будь ласка, увійдіть.');
                // navigate('/form'); // Закоментовано, щоб не перенаправляти автоматично
            }
        } finally {
            setLoading(false);
        }
    };

    const handleRespondClick = (procurementId) => {
        navigate("/offercreate", { state: { procurementId: procurementId } });
    };

    useEffect(() => {
        handleSearch({ preventDefault: () => {} });
    }, []);

    return (
        <div className={classes.universal}>
            {/* Блок 1: Заголовок та форма пошуку */}
            <div className={classes.block}>
                <h1 className={`${classes.label} ${classes.labelBlue}`}>
                    <IoSearchOutline className={classes.icon} />Пошук закупівель
                </h1>

                <form onSubmit={handleSearch} style={{background:"white"}} className={classes.form}>
                    <label htmlFor="searchName">Назва закупівлі: </label>
                    <input
                        type="text"
                        id="searchName"
                        placeholder="Введіть назву..."
                        value={searchName}
                        onChange={(e) => setSearchName(e.target.value)}
                        className={classes.inputField}
                        style={{width:"21.5em"}}
                    />
                    <br/>
                    <div style={{
                        display: 'flex',
                        alignItems: 'spacebetween',
                        flexWrap: 'nowrap',
                        background:"white"
                    }}>
                        <label htmlFor="searchCategory">Категорія:</label>
                        <select
                            id="searchCategory"
                            value={searchCategory}
                            onChange={(e) => setSearchCategory(e.target.value)}
                            className={classes.selectField}
                            style={{marginTop:"0", marginLeft:"0.5em", marginRight:"10em"}}
                        >
                            <option value="">Всі категорії</option>
                            {categories.map((cat, index) => (
                                <option key={index} value={cat}>{cat}</option>
                            ))}
                        </select>

                        <button type="submit" className={classes.submitButton}
                        disabled={loading}
                        style={{width:"15em"}}>
                            {loading ? 'Пошук...' : 'Знайти закупівлі'}
                        </button>
                    </div>
                </form>
            </div> {/* Кінець Блоку 1 */}

            {/* Блок 2: Повідомлення про помилки/успіх (якщо є) */}
            {(error || message) && ( // Рендеримо цей блок, тільки якщо є помилка або повідомлення
                <div className={classes.block} style={{ marginTop: '1em' }}>
                    {error && <p style={{ color: 'red' }}>{error}</p>}
                    {message && <p style={{ color: 'blue' }}>{message}</p>}
                </div>
            )}

            {/* Блок 3: Відображення результатів пошуку */}
            {procurements.length > 0 && (
                <div className={classes.block} style={{ marginTop: '1em' }}>
                    <div className={classes.resultsContainer}>
                        <h2 className={classes.resultsTitle}>Знайдені закупівлі:</h2>
                        {procurements.map((procurement) => {
                            console.log('ProcurementSearch: Current procurement ID:', procurement.id);
                            return (
                                <div key={procurement.id} className={classes.procurementCard}>
                                    <h4 style={{background:"white"}}>{procurement.name}</h4>
                                    <p><strong>Категорія:</strong> {procurement.category}</p>
                                    <p><strong>Опис:</strong> {procurement.description || 'Не вказано'}</p>
                                    <p><strong>Кількість/Обсяг:</strong> {procurement.quantityOrVolume}</p>
                                    <p><strong>Орієнтовний бюджет:</strong> ${procurement.estimatedBudget}</p>
                                    <p><strong>Дата завершення:</strong> {new Date(procurement.completionDate).toLocaleDateString()}</p>
                                    {procurement.documentPaths && (
                                        <p>
                                            <strong>Документ:</strong> <a href={procurement.documentPaths} target="_blank" rel="noopener noreferrer">Переглянути</a>
                                        </p>
                                    )}
                                    <button
                                        className={classes.respondButton}
                                        onClick={() => handleRespondClick(procurement.id)}
                                        style={{padding:"0 1em"}}
                                    >
                                        Відгукнутись
                                    </button>
                                    <hr/>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

export default ProcurementSearch;

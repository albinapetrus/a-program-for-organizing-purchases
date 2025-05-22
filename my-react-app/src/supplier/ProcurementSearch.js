import React, { useState, useEffect } from 'react';
import axios from 'axios';
import classes from '../customer/Universal.module.css'; // Припускаємо, що ти використовуєш Universal.module.css для стилізації
import { IoSearchOutline } from "react-icons/io5"; // Іконка для пошуку
import { Link, useNavigate } from 'react-router-dom'; // Import Link and useNavigate

function ProcurementSearch() {
    const navigate = useNavigate(); // Ініціалізуємо useNavigate

    // Стан для полів фільтрації
    const [searchName, setSearchName] = useState('');
    const [searchCategory, setSearchCategory] = useState('');

    // Стан для результатів пошуку
    const [procurements, setProcurements] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState(''); // Для повідомлень про відсутність результатів

    // Список категорій (має збігатися з бекендом)
    const categories = [
        "Будівництво", "Медицина", "Меблі", "Комп'ютерна техніка",
        "Канцелярія та госптовари", "Транспорт та запчастини",
        "Енергетика, нафтопродукти та паливо", "Метали",
        "Комунальне та побутове обслуговування", "Навчання та консалтинг",
        "Нерухомість", "Сільське господарство", "Одяг, взуття та текстиль",
        "Промислове обладнання та прилади", "Харчування", "Поліграфія",
        "Науково-дослідні роботи", "Різні послуги та товари"
    ];

    // Функція для виконання пошуку закупівель
    const handleSearch = async (e) => {
        e.preventDefault(); // Запобігаємо перезавантаженню сторінки при відправці форми
        setLoading(true);
        setError('');
        setMessage('');
        setProcurements([]); // Очищаємо попередні результати

        try {
            // Формуємо параметри запиту
            const params = {};
            if (searchName) {
                params.name = searchName;
            }
            if (searchCategory) {
                params.category = searchCategory;
            }

            // Отримуємо JWT токен з localStorage (якщо ендпоінт захищений)
            const jwtToken = localStorage.getItem('jwtToken');
            const headers = jwtToken ? { 'Authorization': `Bearer ${jwtToken}` } : {};

            // Виконуємо GET запит до бекенду
            const response = await axios.get('/api/procurements/search', {
                params: params, // Передаємо параметри запиту
                headers: headers // Додаємо заголовки, якщо є токен
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
                // Можливо, перенаправити на сторінку логіну
                // navigate('/form');
            }
        } finally {
            setLoading(false);
        }
    };

    // Функція для обробки натискання кнопки "Відгукнутись"
    const handleRespondClick = (procurementId) => {
        // Використовуємо navigate для програмного переходу та передачі стану
        navigate("/offercreate", { state: { procurementId: procurementId } });
    };

    // Можна виконати початковий пошук при завантаженні сторінки (наприклад, показати всі закупівлі)
    useEffect(() => {
        handleSearch({ preventDefault: () => {} }); // Викликаємо пошук при першому рендері
    }, []); // Пустий масив залежностей означає, що ефект запускається один раз

    return (
        <div className={classes.universal}>
            <div className={classes.block}>
                <h1 className={`${classes.label} ${classes.labelBlue}`}>
                    <IoSearchOutline className={classes.icon} />Пошук закупівель
                </h1>

                <form onSubmit={handleSearch} style={{background:"white"}} className={classes.form}>
                    <label htmlFor="searchName">Назва закупівлі:</label>
                    <input
                        type="text"
                        id="searchName"
                        placeholder="Введіть назву..."
                        value={searchName}
                        onChange={(e) => setSearchName(e.target.value)}
                        className={classes.inputField}
                    />

                    <label htmlFor="searchCategory">Категорія:</label>
                    <select
                        id="searchCategory"
                        value={searchCategory}
                        onChange={(e) => setSearchCategory(e.target.value)}
                        className={classes.selectField}
                    >
                        <option value="">Всі категорії</option> {/* Опція для пошуку без категорії */}
                        {categories.map((cat, index) => (
                            <option key={index} value={cat}>{cat}</option>
                        ))}
                    </select>

                    <button type="submit" className={classes.submitButton} disabled={loading}>
                        {loading ? 'Пошук...' : 'Знайти закупівлі'}
                    </button>
                </form>

                {/* Відображення повідомлень */}
                {error && <p style={{ color: 'red', marginTop: '1em' }}>{error}</p>}
                {message && <p style={{ color: 'blue', marginTop: '1em' }}>{message}</p>}

                {/* Відображення результатів пошуку */}
                {procurements.length > 0 && (
                    <div className={classes.resultsContainer}>
                        <h2 className={classes.resultsTitle}>Знайдені закупівлі:</h2>
                        {procurements.map((procurement) => {
                            // --- ДОДАНО ДЛЯ НАЛАГОДЖЕННЯ ---
                            console.log('ProcurementSearch: Current procurement ID:', procurement.id);
                            // --- КІНЕЦЬ НАЛАГОДЖЕННЯ ---
                            return (
                                <div key={procurement.id} className={classes.procurementCard}>
                                    <h3>{procurement.name}</h3>
                                    <p><strong>Категорія:</strong> {procurement.category}</p>
                                    <p><strong>Опис:</strong> {procurement.description || 'Не вказано'}</p>
                                    <p><strong>Кількість/Обсяг:</strong> {procurement.quantityOrVolume}</p>
                                    <p><strong>Орієнтовний бюджет:</strong> ${procurement.estimatedBudget}</p>
                                    <p><strong>Дата завершення:</strong> {new Date(procurement.completionDate).toLocaleDateString()}</p>
                                    {procurement.documentPaths && ( // Використовуємо DocumentPaths як у твоєму бекенді
                                        <p>
                                            <strong>Документ:</strong> <a href={procurement.documentPaths} target="_blank" rel="noopener noreferrer">Переглянути</a>
                                        </p>
                                    )}
                                    {/* Змінено Link на button з onClick, який викликає navigate */}
                                    <button
                                        className={classes.respondButton}
                                        onClick={() => handleRespondClick(procurement.id)}
                                    >
                                        Відгукнутись
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

export default ProcurementSearch;

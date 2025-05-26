import React, { useState, useEffect, useMemo } from 'react'; // Додаємо useMemo
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import classes from '../customer/Universal.module.css';
import { FaBoxes } from "react-icons/fa";

// Допоміжна функція для перекладу статусу пропозиції
const translateOfferStatus = (status) => {
    switch (status) {
        case 'Submitted':
            return 'Розглядається';
        case 'Accepted':
            return 'Прийнято';
        case 'Rejected':
            return 'Відхилено';
        default:
            return status; // Повертаємо оригінальний статус, якщо невідомий
    }
};

function MyOffersPage() {
    const [allMyOffers, setAllMyOffers] = useState([]); // Зберігаємо всі завантажені пропозиції
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [selectedStatusFilter, setSelectedStatusFilter] = useState(''); // Новий стан для вибраного фільтра статусу
    const navigate = useNavigate();

    // Опції для випадаючого списку фільтра статусу
    const statusFilterOptions = [
        { value: '', label: 'Всі  пропозиції' }, // Порожнє значення для відображення всіх пропозицій
        { value: 'Submitted', label: 'Розглядаются' },
        { value: 'Accepted', label: 'Прийняті' },
        { value: 'Rejected', label: 'Відхилені' },
    ];

    useEffect(() => {
        const fetchMyOffers = async () => {
            setLoading(true);
            setError('');
            setMessage('');

            const jwtToken = localStorage.getItem('jwtToken');

            if (!jwtToken) {
                setError('Ви не авторизовані. Будь ласка, увійдіть.');
                setLoading(false);
                navigate('/form');
                return;
            }

            try {
                // Відправляємо GET-запит до ендпоінту /api/Offers/my
                const response = await axios.get('/api/offers/my', {
                    headers: {
                        'Authorization': `Bearer ${jwtToken}`
                    }
                });

                if (response.data && response.data.length > 0) {
                    setAllMyOffers(response.data); // Зберігаємо всі пропозиції
                } else {
                    setAllMyOffers([]); // Забезпечуємо, що масив порожній
                    // Повідомлення буде встановлено окремим useEffect, щоб врахувати фільтрацію
                }
            } catch (err) {
                console.error('Помилка завантаження моїх пропозицій:', err.response ? err.response.data : err.message);
                let errorMessage = 'Не вдалося завантажити ваші пропозиції. Спробуйте пізніше.';

                if (err.response) {
                    if (err.response.status === 401 || err.response.status === 403) {
                        errorMessage = 'У вас немає дозволу на перегляд цієї сторінки або ваша сесія закінчилася. Будь ласка, увійдіть знову.';
                        localStorage.removeItem('jwtToken'); // Очищаємо недійсний токен
                        navigate('/form');
                    } else if (err.response.data && err.response.data.message) {
                        errorMessage = err.response.data.message;
                    }
                }
                setError(errorMessage);
                setAllMyOffers([]); // Очищаємо пропозиції при помилці
            } finally {
                setLoading(false);
            }
        };

        fetchMyOffers();
    }, [navigate]); // Залежність від navigate, щоб уникнути попередження

    // Використовуємо useMemo для ефективної фільтрації пропозицій
    const filteredOffers = useMemo(() => {
        if (!selectedStatusFilter) {
            return allMyOffers; // Якщо фільтр не вибрано, повертаємо всі пропозиції
        }
        // Фільтруємо пропозиції за вибраним статусом
        return allMyOffers.filter(offer => offer.status === selectedStatusFilter);
    }, [allMyOffers, selectedStatusFilter]); // Перерахунок відбувається при зміні allMyOffers або selectedStatusFilter

    // Ефект для керування повідомленнями (про відсутність пропозицій або відсутність з вибраним статусом)
    useEffect(() => {
        if (!loading && !error) { // Оновлюємо повідомлення тільки якщо дані завантажено і немає помилок
            if (allMyOffers.length > 0 && filteredOffers.length === 0) {
                setMessage('Пропозицій з вибраним статусом не знайдено.');
            } else if (allMyOffers.length === 0) {
                setMessage('У вас ще немає надісланих пропозицій.');
            } else {
                setMessage(''); // Очищаємо повідомлення, якщо пропозиції відображаються
            }
        }
    }, [loading, error, allMyOffers, filteredOffers, selectedStatusFilter]); // Залежності для цього ефекту

    const handleStatusFilterChange = (event) => {
        setSelectedStatusFilter(event.target.value);
    };

    return (
        <div className={classes.universal}>
            <div className={classes.block}>
                <h1 className={`${classes.label} ${classes.labelBlue}`}>
                    <FaBoxes className={classes.icon} /> Мої пропозиції
                </h1>

                {/* Випадаючий список для фільтрації за статусом */}
                <div className={classes.filterContainer} style={{ marginBottom: '1em', background:"white" }}>
                    <label htmlFor="statusFilter" style={{ marginRight: '0.5em' }}>Статус:     </label>
                    <select
                        id="statusFilter"
                        value={selectedStatusFilter}
                        onChange={handleStatusFilterChange}
                        className={classes.selectField} 
                        style={{width:"30em"}}
                    >
                        {statusFilterOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Відображення станів завантаження, помилки або повідомлення */}
                {loading ? (
                    <p>Завантаження ваших пропозицій...</p>
                ) : error ? (
                    <p style={{ color: 'red', marginTop: '1em' }}>{error}</p>
                ) : (
                    <>
                        {/* Повідомлення про відсутність пропозицій або відсутність з вибраним статусом */}
                        {message && <p style={{ color: 'blue', marginTop: '1em' }}>{message}</p>}

                        {/* Відображення відфільтрованих пропозицій */}
                        {filteredOffers.length > 0 && ( // Рендеримо результати, тільки якщо є відфільтровані пропозиції
                            <div className={classes.resultsContainer}>
                                {filteredOffers.map((offer) => ( // Використовуємо filteredOffers
                                    <div key={offer.id} className={classes.procurementCard}>
                                        <h4>Пропозиція до закупівлі: "{offer.procurementName}"</h4>
                                        <p><strong>Запропонована ціна:</strong> ${offer.proposedPrice}</p>
                                        <p><strong>Повідомлення:</strong> {offer.message || 'Не вказано'}</p>
                                        {offer.offerDocumentPaths && (
                                            <p>
                                                <strong>Документ:</strong> <a href={offer.offerDocumentPaths} target="_blank" rel="noopener noreferrer">Переглянути</a>
                                            </p>
                                        )}
                                        <p><strong>Дата пропозиції:</strong> {new Date(offer.offerDate).toLocaleDateString()}</p>
                                        <p>
                                            <strong>Статус: </strong>
                                            <span style={{
                                                fontWeight: 'bold',
                                                color:
                                                    offer.status === 'Accepted' ? 'green' :
                                                    offer.status === 'Rejected' ? 'red' : 'orange'
                                            }}>
                                                {translateOfferStatus(offer.status)} {/* Використовуємо функцію перекладу */}
                                            </span>
                                        </p>
                                        <hr/>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default MyOffersPage;

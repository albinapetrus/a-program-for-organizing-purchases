import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import classes from '../customer/Universal.module.css'; // Припускаємо, що ти використовуєш Universal.module.css для стилізації
import { FaBoxes } from "react-icons/fa"; // Іконка для "Моїх заявок"

function MyOffersPage() {
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchMyOffers = async () => {
            setLoading(true);
            setError('');
            setMessage('');

            const jwtToken = localStorage.getItem('jwtToken');

            if (!jwtToken) {
                setError('Ви не авторизовані. Будь ласка, увійдіть.');
                setLoading(false);
                navigate('/form'); // Перенаправлення на сторінку логіну
                return;
            }

            try {
                // Відправляємо GET-запит до нового ендпоінту /api/Offers/my
                const response = await axios.get('/api/offers/my', {
                    headers: {
                        'Authorization': `Bearer ${jwtToken}`
                    }
                });

                if (response.data && response.data.length > 0) {
                    setOffers(response.data);
                } else {
                    setMessage('У вас ще немає надісланих пропозицій.');
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
            } finally {
                setLoading(false);
            }
        };

        fetchMyOffers();
    }, [navigate]); // Залежність від navigate, щоб уникнути попередження

    return (
        <div className={classes.universal}>
            <div className={classes.block}>
                <h1 className={`${classes.label} ${classes.labelBlue}`}>
                    <FaBoxes className={classes.icon} /> Мої пропозиції
                </h1>

                {loading ? (
                    <p>Завантаження ваших пропозицій...</p>
                ) : error ? (
                    <p style={{ color: 'red', marginTop: '1em' }}>{error}</p>
                ) : message ? (
                    <p style={{ color: 'blue', marginTop: '1em' }}>{message}</p>
                ) : (
                    <div className={classes.resultsContainer}>
                        {offers.map((offer) => (
                            <div key={offer.id} className={classes.procurementCard}> {/* Можна використовувати той самий стиль картки */}
                                <h3>Пропозиція до закупівлі: "{offer.procurementName}"</h3>
                                <p><strong>Запропонована ціна:</strong> ${offer.proposedPrice}</p>
                                <p><strong>Повідомлення:</strong> {offer.message || 'Не вказано'}</p>
                                {offer.offerDocumentPaths && (
                                    <p>
                                        <strong>Документ:</strong> <a href={offer.offerDocumentPaths} target="_blank" rel="noopener noreferrer">Переглянути</a>
                                    </p>
                                )}
                                <p><strong>Дата пропозиції:</strong> {new Date(offer.offerDate).toLocaleDateString()}</p>
                                <p><strong>Статус:</strong> <span style={{ fontWeight: 'bold', color: 
                                    offer.status === 'Accepted' ? 'green' : 
                                    offer.status === 'Rejected' ? 'red' : 'orange' 
                                }}>{offer.status}</span></p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default MyOffersPage;
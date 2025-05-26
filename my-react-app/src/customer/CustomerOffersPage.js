import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import classes from './Universal.module.css';
import { FaBoxes } from "react-icons/fa";

// Додано базовий URL бекенду
const BACKEND_BASE_URL = 'https://localhost:7078';

// --- Утилітарна функція для перекладу статусу закупівлі ---
const translateProcurementStatus = (status) => {
    if (!status) return 'Невідомо';
    switch (status.toLowerCase()) {
        case 'open':
            return 'Активна';
        case 'fulfilled':
            return 'Завершена';
        case 'overdue':
            return 'Протермінована';
        case 'closed':
            return 'Закрита';
        default:
            return status;
    }
};
// --- Кінець утилітарної функції для статусу закупівлі ---

// --- НОВА Утилітарна функція для перекладу статусу пропозиції ---
const translateOfferStatus = (status) => {
    if (!status) return 'Невідомо';
    switch (status.toLowerCase()) {
        case 'submitted':
            return 'Подано';
        case 'accepted':
            return 'Прийнято';
        case 'rejected':
            return 'Відхилено';
        default:
            return status;
    }
};
// --- Кінець НОВОЇ утилітарної функції для статусу пропозиції ---

function CustomerOffersPage() {
    const { procurementId: urlProcurementId } = useParams();
    console.log('CustomerOffersPage: urlProcurementId з URL:', urlProcurementId);

    const navigate = useNavigate();

    const [selectedProcurementId, setSelectedProcurementId] = useState(urlProcurementId || '');

    const [allOffers, setAllOffers] = useState([]);
    const [displayedOffers, setDisplayedOffers] = useState([]);
    const [customerProcurements, setCustomerProcurements] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [actionFeedback, setActionFeedback] = useState('');

    const fetchInitialData = async () => {
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
            const procurementsResponse = await axios.get('/api/Procurements/my', {
                headers: { 'Authorization': `Bearer ${jwtToken}` }
            });
            setCustomerProcurements(procurementsResponse.data);

            const offersResponse = await axios.get('/api/customer/offers/my', {
                headers: { 'Authorization': `Bearer ${jwtToken}` }
            });

            if (offersResponse.data && offersResponse.data.length > 0) {
                setAllOffers(offersResponse.data);

                if (urlProcurementId) {
                    const filtered = offersResponse.data.filter(offer => offer.procurementId === urlProcurementId);
                    setDisplayedOffers(filtered);
                    if (filtered.length === 0) {
                        setMessage('Для обраної закупівлі пропозицій не знайдено.');
                    } else {
                        setMessage('');
                    }
                } else {
                    setDisplayedOffers(offersResponse.data);
                    if (offersResponse.data.length === 0) {
                        setMessage('У вас ще немає пропозицій до ваших закупівель.');
                    } else {
                        setMessage('');
                    }
                }
            } else {
                setMessage('У вас ще немає пропозицій до ваших закупівель.');
                setAllOffers([]);
                setDisplayedOffers([]);
            }
        } catch (err) {
            console.error('Помилка завантаження даних:', err.response ? err.response.data : err.message);
            let errorMessage = 'Не вдалося завантажити дані. Спробуйте пізніше.';
            if (err.response) {
                if (err.response.status === 401 || err.response.status === 403) {
                    errorMessage = 'У вас немає дозволу на перегляд цієї сторінки або ваша сесія закінчилася. Будь ласка, увійдіть знову.';
                    localStorage.removeItem('jwtToken');
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

    useEffect(() => {
        fetchInitialData();
    }, [navigate, urlProcurementId]);

    useEffect(() => {
        if (selectedProcurementId === '') {
            setDisplayedOffers(allOffers);
            if (allOffers.length === 0) {
                setMessage('У вас ще немає пропозицій до ваших закупівель.');
            } else {
                setMessage('');
            }
        } else {
            const filtered = allOffers.filter(offer => offer.procurementId === selectedProcurementId);
            setDisplayedOffers(filtered);
            if (filtered.length === 0) {
                setMessage('Для обраної закупівлі пропозицій не знайдено.');
            } else {
                setMessage('');
            }
        }
    }, [selectedProcurementId, allOffers]);

    const handleProcurementSelectChange = (e) => {
        setSelectedProcurementId(e.target.value);
    };

    const handleAcceptOffer = async (offerId) => {
        setActionFeedback('');
        setLoading(true);
        const jwtToken = localStorage.getItem('jwtToken');

        try {
            const response = await axios.put(`${BACKEND_BASE_URL}/api/offers/${offerId}/accept`, {}, {
                headers: { 'Authorization': `Bearer ${jwtToken}` }
            });
            setActionFeedback(response.data.message || 'Пропозицію успішно прийнято!');
            await fetchInitialData();
        } catch (err) {
            console.error('Помилка при прийнятті пропозиції:', err.response ? err.response.data : err.message);
            let errorMessage = 'Не вдалося прийняти пропозицію. Спробуйте пізніше.';
            if (err.response && err.response.data && err.response.data.message) {
                errorMessage = err.response.data.message;
            }
            setActionFeedback(`Помилка: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    const handleRejectOffer = async (offerId) => {
        setActionFeedback('');
        setLoading(true);
        const jwtToken = localStorage.getItem('jwtToken');

        try {
            const response = await axios.put(`${BACKEND_BASE_URL}/api/offers/${offerId}/reject`, {}, {
                headers: { 'Authorization': `Bearer ${jwtToken}` }
            });
            setActionFeedback(response.data.message || 'Пропозицію успішно відхилено!');
            await fetchInitialData();
        } catch (err) {
            console.error('Помилка при відхиленні пропозиції:', err.response ? err.response.data : err.message);
            let errorMessage = 'Не вдалося відхилити пропозицію. Спробуйте пізніше.';
            if (err.response && err.response.data && err.response.data.message) {
                errorMessage = err.response.data.message;
            }
            setActionFeedback(`Помилка: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={classes.universal}>
            <div className={classes.block}>
                <h1 className={`${classes.label} ${classes.labelBlue}`}>
                    <FaBoxes className={classes.icon} /> Пропозиції до моїх закупівель
                </h1>

                <div className={classes.formGroup} style={{ backgroundColor: "white" }}>
                    <label htmlFor="selectProcurement" className={classes.label}>
                        Оберіть закупівлю:
                    </label>
                    <select
                        id="selectProcurement"
                        value={selectedProcurementId}
                        onChange={handleProcurementSelectChange}
                        className={classes.selectField}
                        disabled={loading}
                        style={{ marginTop: "1em" }}
                    >
                        <option value="">Всі мої закупівлі</option>
                        {customerProcurements.map((procurement) => (
                            <option key={procurement.id} value={procurement.id}>
                                {procurement.name} ({translateProcurementStatus(procurement.status)})
                            </option>
                        ))}
                    </select>
                </div>

                {actionFeedback && (
                    <p style={{ color: actionFeedback.includes('Помилка') ? 'red' : 'green', marginTop: '1em' }}>
                        {actionFeedback}
                    </p>
                )}

                {loading ? (
                    <p>Завантаження пропозицій...</p>
                ) : error ? (
                    <p style={{ color: 'red', marginTop: '1em' }}>{error}</p>
                ) : message ? (
                    <p style={{ color: 'blue', marginTop: '1em' }}>{message}</p>
                ) : (
                    <div className={classes.resultsContainer}>
                        {displayedOffers.map((offer) => {
                            const relatedProcurement = customerProcurements.find(p => p.id === offer.procurementId);
                            const procurementStatus = relatedProcurement ? relatedProcurement.status : 'N/A';

                            return (
                                <div key={offer.id} className={classes.procurementCard}>
                                    <h4>Пропозиція до закупівлі: "{offer.procurementName || 'N/A'}"</h4>
                                    <p><strong>Від постачальника:</strong> {offer.supplierCompanyName || 'N/A'}</p>
                                    <p><strong>Запропонована ціна:</strong> ${offer.proposedPrice}</p>
                                    <p><strong>Повідомлення:</strong> {offer.message || 'Не вказано'}</p>
                                    {offer.offerDocumentPaths && (
                                        <p>
                                            <strong>Документ: </strong> <a href={`${BACKEND_BASE_URL}${offer.offerDocumentPaths}`} target="_blank" rel="noopener noreferrer">Переглянути</a>
                                        </p>
                                    )}
                                    <p><strong>Дата пропозиції:</strong> {new Date(offer.offerDate).toLocaleDateString()}</p>
                                    <p>
                                        <strong>Статус пропозиції:</strong> <span style={{ fontWeight: 'bold', color:
                                            offer.status && offer.status.toLowerCase() === 'accepted' ? 'green' :
                                            offer.status && offer.status.toLowerCase() === 'rejected' ? 'red' : 'orange'
                                        }}>
                                            {/* Застосовуємо нову функцію перекладу */}
                                            {translateOfferStatus(offer.status)}
                                        </span>
                                    </p>
                                    <p>
                                        <strong>Статус закупівлі: </strong>
                                        <span style={{ fontWeight: 'bold', color:
                                            (procurementStatus && procurementStatus.toLowerCase() === 'open') ? 'blue' :
                                            (procurementStatus && procurementStatus.toLowerCase() === 'fulfilled') ? 'green' : 'red'
                                        }}>
                                            {translateProcurementStatus(procurementStatus)}
                                        </span>
                                    </p>

                                    {offer.status === 'Submitted' && (
                                        <div className={classes.offerActions}>
                                            <button
                                                className={`${classes.submitButton} ${classes.acceptButton}`}
                                                onClick={() => handleAcceptOffer(offer.id)}
                                                disabled={loading}
                                            >
                                                Прийняти
                                            </button>
                                            <button
                                                className={`${classes.submitButton} ${classes.rejectButton}`}
                                                onClick={() => handleRejectOffer(offer.id)}
                                                disabled={loading}
                                            >
                                                Відхилити
                                            </button>
                                        </div>

                                    )}
                                    <hr/>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

export default CustomerOffersPage;
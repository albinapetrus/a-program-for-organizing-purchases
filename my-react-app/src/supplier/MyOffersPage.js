import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import classes from '../customer/Universal.module.css';
import { FaBoxes } from "react-icons/fa";
import { IoCloseCircleOutline } from "react-icons/io5"; // Для кнопки закриття модального вікна

// Додано базовий URL бекенду
const BACKEND_BASE_URL = 'https://localhost:7078';

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
            return status;
    }
};

function MyOffersPage() {
    const [allMyOffers, setAllMyOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [selectedStatusFilter, setSelectedStatusFilter] = useState('');
    const navigate = useNavigate();

    // --- НОВИЙ СТАН ДЛЯ МОДАЛЬНОГО ВІКНА ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProcurement, setSelectedProcurement] = useState(null);
    const [modalLoading, setModalLoading] = useState(false);
    const [modalError, setModalError] = useState('');
    // --- КІНЕЦЬ НОВОГО СТАНУ ---

    const statusFilterOptions = [
        { value: '', label: 'Всі  пропозиції' },
        { value: 'Submitted', label: 'Розглядаються' },
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
                const response = await axios.get('/api/offers/my', {
                    headers: {
                        'Authorization': `Bearer ${jwtToken}`
                    }
                });

                if (response.data && response.data.length > 0) {
                    setAllMyOffers(response.data);
                } else {
                    setAllMyOffers([]);
                }
            } catch (err) {
                console.error('Помилка завантаження моїх пропозицій:', err.response ? err.response.data : err.message);
                let errorMessage = 'Не вдалося завантажити ваші пропозиції. Спробуйте пізніше.';

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
                setAllMyOffers([]);
            } finally {
                setLoading(false);
            }
        };

        fetchMyOffers();
    }, [navigate]);

    const filteredOffers = useMemo(() => {
        if (!selectedStatusFilter) {
            return allMyOffers;
        }
        return allMyOffers.filter(offer => offer.status === selectedStatusFilter);
    }, [allMyOffers, selectedStatusFilter]);

    useEffect(() => {
        if (!loading && !error) {
            if (allMyOffers.length > 0 && filteredOffers.length === 0) {
                setMessage('Пропозицій з вибраним статусом не знайдено.');
            } else if (allMyOffers.length === 0) {
                setMessage('У вас ще немає надісланих пропозицій.');
            } else {
                setMessage('');
            }
        }
    }, [loading, error, allMyOffers, filteredOffers, selectedStatusFilter]);

    const handleStatusFilterChange = (event) => {
        setSelectedStatusFilter(event.target.value);
    };

    // --- НОВА ФУНКЦІЯ: ВІДКРИТТЯ МОДАЛЬНОГО ВІКНА ТА ЗАВАНТАЖЕННЯ ДАНИХ ЗАКУПІВЛІ ---
    const handleProcurementClick = async (procurementId) => {
        setIsModalOpen(true);
        setModalLoading(true);
        setModalError('');
        setSelectedProcurement(null); // Очищаємо попередні дані

        const jwtToken = localStorage.getItem('jwtToken');
        if (!jwtToken) {
            setModalError('Для перегляду деталей закупівлі потрібна авторизація.');
            setModalLoading(false);
            return;
        }

        try {
            const response = await axios.get(`${BACKEND_BASE_URL}/api/procurements/${procurementId}`, {
                headers: {
                    'Authorization': `Bearer ${jwtToken}`
                }
            });
            setSelectedProcurement(response.data);
        } catch (err) {
            console.error('Помилка завантаження деталей закупівлі:', err.response ? err.response.data : err.message);
            setModalError('Не вдалося завантажити деталі закупівлі. Спробуйте ще раз.');
        } finally {
            setModalLoading(false);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedProcurement(null);
        setModalError('');
    };
    // --- КІНЕЦЬ НОВОЇ ФУНКЦІЇ ---

    return (
        <div className={classes.universal}>
            <div className={classes.block}>
                <h1 className={`${classes.label} ${classes.labelBlue}`}>
                    <FaBoxes className={classes.icon} /> Мої пропозиції
                </h1>

                <div className={classes.filterContainer} style={{ marginBottom: '1em', background:"white" }}>
                    <label htmlFor="statusFilter" style={{ marginRight: '0.5em' }}>Статус:    </label>
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

                {loading ? (
                    <p>Завантаження ваших пропозицій...</p>
                ) : error ? (
                    <p style={{ color: 'red', marginTop: '1em' }}>{error}</p>
                ) : (
                    <>
                        {message && <p style={{ color: 'blue', marginTop: '1em' }}>{message}</p>}

                        {filteredOffers.length > 0 && (
                            <div className={classes.resultsContainer}>
                                {filteredOffers.map((offer) => (
                                    <div key={offer.id} className={classes.procurementCard}>
                                        {/* ЗМІНА ТУТ: Використовуємо div, а не Link, і додаємо onClick */}
                                        <div
                                            onClick={() => handleProcurementClick(offer.procurementId)}
                                            style={{ cursor: 'pointer' }} // Зробимо його клікабельним
                                        >
                                            <h4 style={{background:"white"}}>Пропозиція до закупівлі: "{offer.procurementName}"</h4>
                                        </div>
                                        {/* КІНЕЦЬ ЗМІНИ */}
                                        <p><strong>Запропонована ціна:</strong> ${offer.proposedPrice}</p>
                                        <p><strong>Повідомлення:</strong> {offer.message || 'Не вказано'}</p>
                                        {offer.offerDocumentPaths && (
                                            <p>
                                                <strong>Документ:  </strong>
                                                <a href={`${BACKEND_BASE_URL}${offer.offerDocumentPaths}`} target="_blank" rel="noopener noreferrer">Переглянути</a>
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
                                                {translateOfferStatus(offer.status)}
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

            {/* --- КОМПОНЕНТ МОДАЛЬНОГО ВІКНА --- */}
            {isModalOpen && (
                <div className={classes.modalOverlay} onClick={closeModal}>
                    <div className={classes.modalContent} onClick={e => e.stopPropagation()}>
                        <button className={classes.modalCloseButton} onClick={closeModal}>
                            <IoCloseCircleOutline className={classes.cancelOutline} size={30} />
                        </button>
                        {modalLoading ? (
                            <p>Завантаження деталей закупівлі...</p>
                        ) : modalError ? (
                            <p style={{ color: 'red' }}>{modalError}</p>
                        ) : selectedProcurement ? (
                            <>
                                <h2 className={classes.modalTitle}>{selectedProcurement.name}</h2>
                                <p><strong>Замовник:</strong> {selectedProcurement.customerCompanyName || 'Не вказано'}</p>
                                <p><strong>Опис:</strong> {selectedProcurement.description || 'Не вказано'}</p>
                                <p><strong>Категорія:</strong> {selectedProcurement.category}</p>
                                <p><strong>Кількість/Обсяг:</strong> {selectedProcurement.quantityOrVolume}</p>
                                <p><strong>Орієнтовний бюджет:</strong> ${selectedProcurement.estimatedBudget}</p>
                                <p><strong>Дата завершення:</strong> {new Date(selectedProcurement.completionDate).toLocaleDateString()}</p>
                                {selectedProcurement.documentPaths && (
                                    <p>
                                        <strong>Документ: </strong>
                                        <a href={`${BACKEND_BASE_URL}${selectedProcurement.documentPaths}`} target="_blank" rel="noopener noreferrer">Переглянути</a>
                                    </p>
                                )}
                                <p><strong>Статус закупівлі:</strong> {selectedProcurement.status}</p>
                            </>
                        ) : (
                            <p>Не вдалося завантажити деталі закупівлі.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default MyOffersPage;
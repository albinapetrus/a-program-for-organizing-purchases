import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import classes from './Universal.module.css'; // Переконайся, що шлях правильний
import { FaBoxes } from "react-icons/fa";
import { IoCloseCircleOutline } from "react-icons/io5"; // Для кнопки закриття модального вікна

const BACKEND_BASE_URL = 'https://localhost:7078';

const translateProcurementStatus = (status) => {
    if (!status) return 'Невідомо';
    switch (status.toLowerCase()) {
        case 'open': return 'Активна';
        case 'fulfilled': return 'Завершена';
        case 'overdue': return 'Протермінована';
        case 'closed': return 'Закрита';
        default: return status;
    }
};

const translateOfferStatus = (status) => {
    if (!status) return 'Невідомо';
    switch (status.toLowerCase()) {
        case 'submitted': return 'Подано';
        case 'accepted': return 'Прийнято';
        case 'rejected': return 'Відхилено';
        default: return status;
    }
};

function CustomerOffersPage() {
    const { procurementId: urlProcurementId } = useParams();
    const navigate = useNavigate();

    const [selectedProcurementId, setSelectedProcurementId] = useState(urlProcurementId || '');
    const [allOffers, setAllOffers] = useState([]);
    const [displayedOffers, setDisplayedOffers] = useState([]);
    const [customerProcurements, setCustomerProcurements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [actionFeedback, setActionFeedback] = useState('');

    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedProcurementForDetail, setSelectedProcurementForDetail] = useState(null);
    const [modalDetailLoading, setModalDetailLoading] = useState(false);
    const [modalDetailError, setModalDetailError] = useState('');

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
            const procurementsResponse = await axios.get(`${BACKEND_BASE_URL}/api/Procurements/my`, {
                headers: { 'Authorization': `Bearer ${jwtToken}` }
            });
            setCustomerProcurements(procurementsResponse.data || []);

            const offersResponse = await axios.get(`${BACKEND_BASE_URL}/api/customer/offers/my`, {
                headers: { 'Authorization': `Bearer ${jwtToken}` }
            });

            const offersData = offersResponse.data || [];
            setAllOffers(offersData);

            if (urlProcurementId) {
                const filtered = offersData.filter(offer => offer.procurementId === urlProcurementId);
                setDisplayedOffers(filtered);
                setMessage(filtered.length === 0 ? 'Для обраної закупівлі пропозицій не знайдено.' : '');
            } else {
                setDisplayedOffers(offersData);
                setMessage(offersData.length === 0 ? 'У вас ще немає пропозицій до ваших закупівель.' : '');
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
                } else if (typeof err.response.data === 'string') {
                    errorMessage = err.response.data;
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
        if (!selectedProcurementId) {
            setDisplayedOffers(allOffers);
            setMessage(allOffers.length === 0 && !loading ? 'У вас ще немає пропозицій до ваших закупівель.' : '');
        } else {
            const filtered = allOffers.filter(offer => offer.procurementId === selectedProcurementId);
            setDisplayedOffers(filtered);
            setMessage(filtered.length === 0 && !loading ? 'Для обраної закупівлі пропозицій не знайдено.' : '');
        }
    }, [selectedProcurementId, allOffers, loading]);

    const handleProcurementSelectChange = (e) => {
        const newProcurementId = e.target.value;
        setSelectedProcurementId(newProcurementId);
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
            } else if (typeof err.response?.data === 'string') {
                errorMessage = err.response.data;
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
            } else if (typeof err.response?.data === 'string') {
                errorMessage = err.response.data;
            }
            setActionFeedback(`Помилка: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    const openDetailModal = async (procurementIdToLoad) => {
        if (!procurementIdToLoad) {
            console.warn("Procurement ID is undefined, cannot open modal.");
            return;
        }
        setIsDetailModalOpen(true);
        setModalDetailLoading(true);
        setModalDetailError('');
        setSelectedProcurementForDetail(null);

        const jwtToken = localStorage.getItem('jwtToken');
        if (!jwtToken) {
            setModalDetailError('Для перегляду деталей потрібна авторизація.');
            setModalDetailLoading(false);
            return;
        }

        try {
            const response = await axios.get(`${BACKEND_BASE_URL}/api/procurements/${procurementIdToLoad}`, {
                headers: { 'Authorization': `Bearer ${jwtToken}` }
            });
            setSelectedProcurementForDetail(response.data);
        } catch (err) {
            console.error('Помилка завантаження деталей закупівлі:', err.response ? err.response.data : err.message);
            setModalDetailError('Не вдалося завантажити деталі закупівлі.');
        } finally {
            setModalDetailLoading(false);
        }
    };

    const closeDetailModal = () => {
        setIsDetailModalOpen(false);
        setSelectedProcurementForDetail(null);
        setModalDetailError('');
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

                {loading ? ( <p>Завантаження пропозицій...</p> )
                : error ? ( <p style={{ color: 'red', marginTop: '1em' }}>{error}</p> )
                : message && displayedOffers.length === 0 ? ( // Показуємо message тільки якщо displayedOffers порожній
                    <p style={{ color: 'blue', marginTop: '1em' }}>{message}</p>
                ) : (
                    <div className={classes.resultsContainer}>
                        {displayedOffers.map((offer) => {
                            const relatedProcurement = customerProcurements.find(p => p.id === offer.procurementId);
                            const procurementStatus = relatedProcurement ? relatedProcurement.status : 'N/A';

                            return (
                                <div key={offer.id} className={classes.procurementCard}>
                                    <h4 
                                        onClick={() => openDetailModal(offer.procurementId)} 
                                        style={{ cursor: 'pointer', color: '#007bff' }} 
                                        title="Натисніть, щоб переглянути деталі закупівлі"
                                    >
                                        Пропозиція до закупівлі: "{offer.procurementName || 'N/A'}"
                                    </h4>
                                    <p><strong>Від постачальника:</strong> {offer.supplierCompanyName || 'N/A'}</p>
                                    <p><strong>Запропонована ціна:</strong> ${offer.proposedPrice}</p>
                                    {/* ----- ВІДОБРАЖЕННЯ ПРОПОНОВАНОЇ ДАТИ ДОСТАВКИ ----- */}
                                    {offer.proposedDeliveryDate && (
                                        <p><strong>Пропонована дата доставки:</strong> {new Date(offer.proposedDeliveryDate).toLocaleDateString()}</p>
                                    )}
                                    {/* ---------------------------------------------------- */}
                                    <p><strong>Повідомлення:</strong> {offer.message || 'Не вказано'}</p>
                                    {offer.offerDocumentPaths && (
                                        <p><strong>Документ: </strong> <a href={`${BACKEND_BASE_URL}${offer.offerDocumentPaths}`} target="_blank" rel="noopener noreferrer">Переглянути</a></p>
                                    )}
                                    <p><strong>Дата пропозиції:</strong> {new Date(offer.offerDate).toLocaleDateString()}</p>
                                    <p><strong>Статус пропозиції:</strong> <span style={{ fontWeight: 'bold', color: offer.status && offer.status.toLowerCase() === 'accepted' ? 'green' : offer.status && offer.status.toLowerCase() === 'rejected' ? 'red' : 'orange' }}>
                                        {translateOfferStatus(offer.status)}</span>
                                    </p>
                                    <p><strong>Статус закупівлі: </strong> <span style={{ fontWeight: 'bold', color: (procurementStatus && procurementStatus.toLowerCase() === 'open') ? 'blue' : (procurementStatus && procurementStatus.toLowerCase() === 'fulfilled') ? 'green' : 'red' }}>
                                        {translateProcurementStatus(procurementStatus)}</span>
                                    </p>
                                    {offer.status === 'Submitted' && (
                                        <div className={classes.offerActions}>
                                            <button className={`${classes.submitButton} ${classes.acceptButton}`} onClick={() => handleAcceptOffer(offer.id)} disabled={loading}>Прийняти</button>
                                            <button className={`${classes.submitButton} ${classes.rejectButton}`} onClick={() => handleRejectOffer(offer.id)} disabled={loading}>Відхилити</button>
                                        </div>
                                    )}
                                    <hr/>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {isDetailModalOpen && (
                <div className={classes.modalOverlay} onClick={closeDetailModal}> 
                    <div className={classes.modalContent} onClick={e => e.stopPropagation()}> 
                        <button className={classes.modalCloseButton} onClick={closeDetailModal}>
                            <IoCloseCircleOutline className={classes.cancelOutline} size={30} /> 
                        </button>
                        {modalDetailLoading ? (
                            <p>Завантаження деталей закупівлі...</p>
                        ) : modalDetailError ? (
                            <p style={{ color: 'red' }}>{modalDetailError}</p>
                        ) : selectedProcurementForDetail ? (
                            <>
                                <h2 className={classes.modalTitle}>{selectedProcurementForDetail.name}</h2>
                                {selectedProcurementForDetail.customerCompanyName && (
                                     <p><strong>Замовник:</strong> {selectedProcurementForDetail.customerCompanyName}</p>
                                )}
                                <p><strong>Категорія:</strong> {selectedProcurementForDetail.category}</p>
                                <p><strong>Опис:</strong> {selectedProcurementForDetail.description || 'Не вказано'}</p>
                                <p><strong>Кількість/Обсяг:</strong> {selectedProcurementForDetail.quantityOrVolume}</p>
                                <p><strong>Орієнтовний бюджет:</strong> ${selectedProcurementForDetail.estimatedBudget}</p>
                                <p><strong>Дата завершення:</strong> {new Date(selectedProcurementForDetail.completionDate).toLocaleDateString()}</p>
                                {selectedProcurementForDetail.deliveryAddress && ( 
                                    <p><strong>Адреса доставки:</strong> {selectedProcurementForDetail.deliveryAddress}</p>
                                )}
                                {selectedProcurementForDetail.contactPhone && ( 
                                    <p><strong>Контактний телефон:</strong> {selectedProcurementForDetail.contactPhone}</p>
                                )}
                                {selectedProcurementForDetail.documentPaths && (
                                    <p><strong>Документ закупівлі: </strong> <a href={`${BACKEND_BASE_URL}${selectedProcurementForDetail.documentPaths}`} target="_blank" rel="noopener noreferrer">Переглянути</a></p>
                                )}
                                <p><strong>Створено:</strong> {new Date(selectedProcurementForDetail.createdAt).toLocaleDateString()}</p>
                                <p><strong>Статус закупівлі:</strong> {translateProcurementStatus(selectedProcurementForDetail.status)}</p>
                            </>
                        ) : (
                            <p>Немає даних для відображення деталей закупівлі.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default CustomerOffersPage;
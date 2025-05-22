import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import classes from './Universal.module.css'; // Assuming Universal.module.css for styling
import { FaBoxes } from "react-icons/fa"; // Icon for offers

function CustomerOffersPage() {
    const navigate = useNavigate();

    // State for all offers for the customer's procurements
    const [allOffers, setAllOffers] = useState([]);
    // State for the currently displayed offers (filtered or all)
    const [displayedOffers, setDisplayedOffers] = useState([]);

    // State for the list of customer's procurements (for the dropdown)
    const [customerProcurements, setCustomerProcurements] = useState([]);
    // State for the selected procurement in the dropdown
    const [selectedProcurementId, setSelectedProcurementId] = useState(''); // Empty string for "All Procurements"

    // UI feedback states
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [actionFeedback, setActionFeedback] = useState(''); // For feedback on accept/reject actions

    // Function to fetch initial data (procurements and all offers)
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
            // 1. Fetch customer's own procurements for the dropdown
            const procurementsResponse = await axios.get('/api/Procurements/my', {
                headers: { 'Authorization': `Bearer ${jwtToken}` }
            });
            setCustomerProcurements(procurementsResponse.data);

            // 2. Fetch all offers for all of customer's procurements
            const offersResponse = await axios.get('/api/customer/offers/my', {
                headers: { 'Authorization': `Bearer ${jwtToken}` }
            });

            if (offersResponse.data && offersResponse.data.length > 0) {
                setAllOffers(offersResponse.data);
                setDisplayedOffers(offersResponse.data); // Initially display all
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

    // Effect to fetch data on component mount
    useEffect(() => {
        fetchInitialData();
    }, [navigate]);

    // Effect to filter offers when selectedProcurementId changes
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

    // Handler for dropdown change
    const handleProcurementSelectChange = (e) => {
        setSelectedProcurementId(e.target.value);
    };

    // Function to handle accepting an offer
    const handleAcceptOffer = async (offerId) => {
        setActionFeedback('');
        setLoading(true);
        const jwtToken = localStorage.getItem('jwtToken');

        try {
            const response = await axios.put(`/api/offers/${offerId}/accept`, {}, {
                headers: { 'Authorization': `Bearer ${jwtToken}` }
            });
            setActionFeedback(response.data.message || 'Пропозицію успішно прийнято!');
            await fetchInitialData(); // Re-fetch all data to update statuses
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

    // Function to handle rejecting an offer
    const handleRejectOffer = async (offerId) => {
        setActionFeedback('');
        setLoading(true);
        const jwtToken = localStorage.getItem('jwtToken');

        try {
            const response = await axios.put(`/api/offers/${offerId}/reject`, {}, {
                headers: { 'Authorization': `Bearer ${jwtToken}` }
            });
            setActionFeedback(response.data.message || 'Пропозицію успішно відхилено!');
            await fetchInitialData(); // Re-fetch all data to update statuses
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

                {/* Dropdown for selecting a specific procurement */}
                <div className={classes.formGroup} style={{ marginBottom: '1.5em', backgroundColor:"white" }}>
                    <label htmlFor="selectProcurement" className={classes.label}>
                        Оберіть закупівлю:
                    </label>
                    <select
                        id="selectProcurement"
                        value={selectedProcurementId}
                        onChange={handleProcurementSelectChange}
                        className={classes.selectField}
                        disabled={loading}
                    >
                        <option value="">Всі мої закупівлі</option>
                        {customerProcurements.map((procurement) => (
                            <option key={procurement.id} value={procurement.id}>
                                {procurement.name} ({procurement.status}) {/* Display procurement status */}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Action feedback message */}
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
                        {displayedOffers.map((offer) => (
                            <div key={offer.id} className={classes.procurementCard}>
                                <h3>Пропозиція до закупівлі: "{offer.procurementName || 'N/A'}"</h3>
                                <p><strong>Від постачальника:</strong> {offer.supplierCompanyName || 'N/A'}</p>
                                <p><strong>Запропонована ціна:</strong> ${offer.proposedPrice}</p>
                                <p><strong>Повідомлення:</strong> {offer.message || 'Не вказано'}</p>
                                {offer.offerDocumentPaths && (
                                    <p>
                                        <strong>Документ:</strong> <a href={offer.offerDocumentPaths} target="_blank" rel="noopener noreferrer">Переглянути</a>
                                    </p>
                                )}
                                <p><strong>Дата пропозиції:</strong> {new Date(offer.offerDate).toLocaleDateString()}</p>
                                <p><strong>Статус пропозиції:</strong> <span style={{ fontWeight: 'bold', color:
                                    offer.status === 'Accepted' ? 'green' :
                                    offer.status === 'Rejected' ? 'red' : 'orange'
                                }}>{offer.status}</span></p>
                                {/* Display Procurement Status for clarity */}
                                <p>
                                    <strong>Статус закупівлі:</strong>
                                    <span style={{ fontWeight: 'bold', color:
                                        (customerProcurements.find(p => p.id === offer.procurementId)?.status === 'Open') ? 'green' :
                                        (customerProcurements.find(p => p.id === offer.procurementId)?.status === 'Fulfilled') ? 'blue' : 'red'
                                    }}>
                                        {customerProcurements.find(p => p.id === offer.procurementId)?.status || 'N/A'}
                                    </span>
                                </p>

                                {/* Buttons for Accept/Reject */}
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
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default CustomerOffersPage;

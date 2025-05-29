import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // useParams тут не використовується, видалив
import classes from '../customer/Universal.module.css';
import { FaBoxes, FaInfoCircle } from "react-icons/fa"; 
import { IoCloseCircleOutline } from "react-icons/io5";

const BACKEND_BASE_URL = 'https://localhost:7078';

const translateOfferStatus = (status) => {
    switch (status) {
        case 'Submitted': return 'Розглядається';
        case 'Accepted': return 'Прийнято';
        case 'Rejected': return 'Відхилено';
        default: return status || 'Невідомо';
    }
};

const translateProcurementStatus = (status) => {
    if (!status) return 'Невідомо';
    switch (status.toLowerCase()) {
        case 'open': return 'Активна';
        case 'fulfilled': return 'Завершена';
        case 'closed': return 'Закрита';
        case 'overdue': return 'Протермінована';
        default: return status;
    }
};


function MyOffersPage() {
    const [allMyOffers, setAllMyOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [selectedStatusFilter, setSelectedStatusFilter] = useState('');
    const navigate = useNavigate();

    const [isProcurementModalOpen, setIsProcurementModalOpen] = useState(false);
    const [selectedProcurement, setSelectedProcurement] = useState(null);
    const [procurementModalLoading, setProcurementModalLoading] = useState(false);
    const [procurementModalError, setProcurementModalError] = useState('');

    const [isAcceptedOfferDetailsModalOpen, setIsAcceptedOfferDetailsModalOpen] = useState(false);
    const [selectedAcceptedOffer, setSelectedAcceptedOffer] = useState(null);
    
    // --- ВИПРАВЛЕНО ОГОЛОШЕННЯ СТАНУ ---
    const [acceptedOfferLoading, setAcceptedOfferLoading] = useState(false); // Тепер оголошено правильно
    const [acceptedOfferError, setAcceptedOfferError] = useState(''); // Додав для консистентності, якщо буде потрібно
    // -----------------------------------

    const statusFilterOptions = [
        { value: '', label: 'Всі пропозиції' },
        { value: 'Submitted', label: 'Розглядаються' },
        { value: 'Accepted', label: 'Прийняті' },
        { value: 'Rejected', label: 'Відхилені' },
    ];

    useEffect(() => {
        const fetchMyOffers = async () => {
            setLoading(true);
            setError('');
            // setMessage(''); // Краще скидати message в useEffect, що відповідає за фільтрацію
            const jwtToken = localStorage.getItem('jwtToken');

            if (!jwtToken) {
                setError('Ви не авторизовані. Будь ласка, увійдіть.');
                setLoading(false);
                navigate('/form');
                return;
            }

            try {
                const response = await axios.get(`${BACKEND_BASE_URL}/api/offers/my`, {
                    headers: { 'Authorization': `Bearer ${jwtToken}` }
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
                    } else if (typeof err.response.data === 'string') {
                        errorMessage = err.response.data;
                    }
                }
                setError(errorMessage);
                setAllMyOffers([]); // При помилці краще скинути
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
        // Цей useEffect відповідає за встановлення повідомлення на основі відфільтрованих даних
        if (!loading && !error) { 
            if (allMyOffers.length === 0) { // Якщо взагалі немає пропозицій
                setMessage('У вас ще немає надісланих пропозицій.');
            } else if (filteredOffers.length === 0 && selectedStatusFilter) { // Якщо фільтр активний і нічого не знайдено
                setMessage('Пропозицій з вибраним статусом не знайдено.');
            } else if (filteredOffers.length > 0) { // Якщо є відфільтровані пропозиції, повідомлення не потрібне
                 setMessage('');
            }
        } else if (error) { // Якщо є помилка, повідомлення не показуємо, бо є error
            setMessage('');
        }
    }, [loading, error, allMyOffers, filteredOffers, selectedStatusFilter]);


    const handleStatusFilterChange = (event) => {
        setSelectedStatusFilter(event.target.value);
    };

    const handleProcurementClick = async (procurementId) => {
        setIsProcurementModalOpen(true);
        setProcurementModalLoading(true);
        setProcurementModalError('');
        setSelectedProcurement(null);

        const jwtToken = localStorage.getItem('jwtToken');
        if (!jwtToken) {
            setProcurementModalError('Для перегляду деталей закупівлі потрібна авторизація.');
            setProcurementModalLoading(false);
            return;
        }
        try {
            const response = await axios.get(`${BACKEND_BASE_URL}/api/procurements/${procurementId}`, {
                headers: { 'Authorization': `Bearer ${jwtToken}` }
            });
            setSelectedProcurement(response.data);
        } catch (err) {
            console.error('Помилка завантаження деталей закупівлі:', err.response ? err.response.data : err.message);
            setProcurementModalError('Не вдалося завантажити деталі закупівлі. Спробуйте ще раз.');
        } finally {
            setProcurementModalLoading(false);
        }
    };

    const closeProcurementModal = () => {
        setIsProcurementModalOpen(false);
        setSelectedProcurement(null);
        setProcurementModalError('');
    };

    const openAcceptedOfferModal = async (offer) => {
        setAcceptedOfferLoading(true); // Встановлюємо перед запитом
        setIsAcceptedOfferDetailsModalOpen(true);
        setSelectedAcceptedOffer(null); 
        setAcceptedOfferError(''); // Скидаємо помилку, якщо була
        
        // Логіка для збагачення `offer` даними закупівлі, якщо їх немає
        let enrichedOfferData = { ...offer }; // Копіюємо поточну пропозицію

        // Перевіряємо, чи потрібні дані закупівлі вже є в об'єкті пропозиції.
        // Ти маєш вирішити, як ці дані називаються в об'єкті offer, що приходить з /api/offers/my.
        // Припустимо, що якщо їх немає, то вони називаються customerContactPhone та deliveryAddress в enrichedOfferData
        const needsProcurementDetails = !offer.customerContactPhone || !offer.deliveryAddress;

        if (needsProcurementDetails && offer.procurementId) {
            const jwtToken = localStorage.getItem('jwtToken');
            if (!jwtToken) {
                setAcceptedOfferError('Потрібна авторизація для завантаження деталей закупівлі.');
                setAcceptedOfferLoading(false);
                setSelectedAcceptedOffer(enrichedOfferData); // Показуємо те, що є
                return;
            }
            try {
                console.log(`Завантаження деталей для закупівлі ID: ${offer.procurementId} для деталей прийнятої пропозиції`);
                const procDetailsResponse = await axios.get(`${BACKEND_BASE_URL}/api/procurements/${offer.procurementId}`, {
                     headers: { 'Authorization': `Bearer ${jwtToken}` }
                });
                enrichedOfferData.customerContactPhone = procDetailsResponse.data?.contactPhone; 
                enrichedOfferData.deliveryAddress = procDetailsResponse.data?.deliveryAddress;
            } catch (err) {
                console.error("Помилка завантаження деталей закупівлі для прийнятої пропозиції:", err);
                setAcceptedOfferError("Не вдалося завантажити повні деталі закупівлі.");
                // Незважаючи на помилку, все одно показуємо дані пропозиції, які є
            }
        }
        setSelectedAcceptedOffer(enrichedOfferData);
        setAcceptedOfferLoading(false); // Вимикаємо лоадер після всіх операцій
    };

    const closeAcceptedOfferDetailsModal = () => {
        setIsAcceptedOfferDetailsModalOpen(false);
        setSelectedAcceptedOffer(null);
        setAcceptedOfferError(''); // Також скидаємо помилку
    };

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
                        disabled={loading}
                    >
                        {statusFilterOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>

                {loading ? ( <p>Завантаження ваших пропозицій...</p> )
                : error ? ( <p style={{ color: 'red', marginTop: '1em' }}>{error}</p> )
                : ( // Тепер ця частина буде рендеритися, якщо не loading і не error
                    <>
                        {/* Показуємо message, якщо він є і немає відфільтрованих пропозицій або взагалі немає пропозицій */}
                        {message && filteredOffers.length === 0 && <p style={{ color: 'blue', marginTop: '1em' }}>{message}</p>}

                        {filteredOffers.length > 0 && (
                            <div className={classes.resultsContainer}>
                                {filteredOffers.map((offer) => (
                                    <div key={offer.id} className={classes.procurementCard}>
                                        <div onClick={() => handleProcurementClick(offer.procurementId)} style={{ cursor: 'pointer' }}>
                                            <h4 style={{background:"white", color: "#007bff"}} title="Натисніть, щоб переглянути деталі закупівлі">
                                                Пропозиція до закупівлі: "{offer.procurementName || 'N/A'}"
                                            </h4>
                                        </div>
                                        <p><strong>Запропонована ціна:</strong> ${offer.proposedPrice}</p>
                                        {offer.proposedDeliveryDate && (
                                            <p><strong>Пропонована дата доставки:</strong> {new Date(offer.proposedDeliveryDate).toLocaleDateString()}</p>
                                        )}
                                        <p><strong>Повідомлення:</strong> {offer.message || 'Не вказано'}</p>
                                        {offer.offerDocumentPaths && (
                                            <p><strong>Документ:  </strong><a href={`${BACKEND_BASE_URL}${offer.offerDocumentPaths}`} target="_blank" rel="noopener noreferrer">Переглянути</a></p>
                                        )}
                                        <p><strong>Дата пропозиції:</strong> {new Date(offer.offerDate).toLocaleDateString()}</p>
                                        <p><strong>Статус: </strong>
                                            <span style={{ fontWeight: 'bold', color: offer.status === 'Accepted' ? 'green' : offer.status === 'Rejected' ? 'red' : 'orange' }}>
                                                {translateOfferStatus(offer.status)}
                                            </span>
                                        </p>
                                        {offer.status === 'Accepted' && (
                                            <div style={{marginTop: '10px', background:"white"}}>
                                                <button 
                                                    className={classes.detailsButton} 
                                                    onClick={() => openAcceptedOfferModal(offer)}
                                                    disabled={acceptedOfferLoading} // Деактивуємо під час завантаження деталей для модалки
                                                     style={{ paddingLeft:"0.5em", paddingRight:"0.5em" , width:"40em"}}
                                                >
                                                   <FaInfoCircle style={{marginRight: '5px', background:"#2070d1"}} /> 
                                                   {acceptedOfferLoading && selectedAcceptedOffer?.id === offer.id ? 'Завантаження деталей...' : 'Реквізити та інформація'}
                                                </button>
                                            </div>
                                        )}
                                        <hr/>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Модальне вікно ДЕТАЛЕЙ ЗАКУПІВЛІ */}
            {isProcurementModalOpen && (
                <div className={classes.modalOverlay} onClick={closeProcurementModal}>
                    <div className={classes.modalContent} onClick={e => e.stopPropagation()}>
                        <button className={classes.modalCloseButton} onClick={closeProcurementModal}>
                            <IoCloseCircleOutline className={classes.cancelOutline} size={30} />
                        </button>
                        {procurementModalLoading ? ( <p>Завантаження деталей закупівлі...</p> )
                        : procurementModalError ? ( <p style={{ color: 'red' }}>{procurementModalError}</p> )
                        : selectedProcurement ? (
                            <>
                                <h2 className={classes.modalTitle}>{selectedProcurement.name}</h2>
                                <p><strong>Замовник:</strong> {selectedProcurement.customerName || 'Не вказано'}</p>
                                <p><strong>Опис:</strong> {selectedProcurement.description || 'Не вказано'}</p>
                                <p><strong>Категорія:</strong> {selectedProcurement.category}</p>
                                <p><strong>Кількість/Обсяг:</strong> {selectedProcurement.quantityOrVolume}</p>
                                <p><strong>Орієнтовний бюджет:</strong> ${selectedProcurement.estimatedBudget}</p>
                                <p><strong>Дата завершення:</strong> {new Date(selectedProcurement.completionDate).toLocaleDateString()}</p>
                                {selectedProcurement.deliveryAddress && (<p><strong>Адреса доставки:</strong> {selectedProcurement.deliveryAddress}</p>)}
                                {selectedProcurement.contactPhone && (<p><strong>Контактний телефон:</strong> {selectedProcurement.contactPhone}</p>)}
                                {selectedProcurement.documentPaths && (
                                    <p><strong>Документ: </strong><a href={`${BACKEND_BASE_URL}${selectedProcurement.documentPaths}`} target="_blank" rel="noopener noreferrer">Переглянути</a></p>
                                )}
                                <p><strong>Статус закупівлі: </strong>
                                    <span style={{ fontWeight: 'bold', color: selectedProcurement.status && selectedProcurement.status.toLowerCase() === 'open' ? 'blue' : selectedProcurement.status && selectedProcurement.status.toLowerCase() === 'fulfilled' ? 'green' : 'red' }}>
                                        {translateProcurementStatus(selectedProcurement.status)}
                                    </span>
                                </p>
                            </>
                        ) : ( <p>Не вдалося завантажити деталі закупівлі.</p> )}
                    </div>
                </div>
            )}

            {/* Модальне вікно ДЕТАЛЕЙ ПРИЙНЯТОЇ ПРОПОЗИЦІЇ */}
            {isAcceptedOfferDetailsModalOpen && selectedAcceptedOffer && (
                 <div className={classes.modalOverlay} onClick={closeAcceptedOfferDetailsModal}>
                    <div className={classes.modalContent} style={{maxWidth: '600px'}} onClick={e => e.stopPropagation()}>
                        <button className={classes.modalCloseButton} onClick={closeAcceptedOfferDetailsModal}>
                            <IoCloseCircleOutline className={classes.cancelOutline} size={30} />
                        </button>
                        <h3 className={classes.modalTitle}>Деталі по прийнятій пропозиції</h3>
                        {acceptedOfferLoading ? (<p>Завантаження додаткових деталей...</p>) : 
                         acceptedOfferError ? (<p style={{color: 'red'}}>{acceptedOfferError}</p>) :
                        (<>
                            <p><strong>Закупівля:</strong> {selectedAcceptedOffer.procurementName || 'N/A'}</p>
                            <h4 style={{marginTop: '1em'}}>Інформація від Замовника (з деталей закупівлі):</h4>
                            <p><strong>Контактний телефон Замовника:</strong> {selectedAcceptedOffer.customerContactPhone || 'Не вказано'}</p>
                            <p><strong>Адреса доставки Замовника:</strong> {selectedAcceptedOffer.deliveryAddress || 'Не вказано'}</p>
                            
                            <h4 style={{marginTop: '1em'}}>Ваша пропозиція:</h4>
                            <p><strong>Запропонована дата доставки:</strong> {selectedAcceptedOffer.proposedDeliveryDate ? new Date(selectedAcceptedOffer.proposedDeliveryDate).toLocaleDateString() : 'Не вказано'}</p>
                            <p><strong>Запропонована сума:</strong> ${selectedAcceptedOffer.proposedPrice}</p>
                            
                            {selectedAcceptedOffer.supplierFullName && ( // Показуємо реквізити, якщо вони є
                                <>
                                    <h4 style={{marginTop: '1em'}}>Ваші реквізити (як постачальника):</h4>
                                    <p><strong>Повне найменування:</strong> {selectedAcceptedOffer.supplierFullName}</p>
                                    <p><strong>Телефон:</strong> {selectedAcceptedOffer.supplierContactPhone}</p> {/* Це телефон постачальника з пропозиції */}
                                    <p><strong>ЄДРПОУ/РНОКПП:</strong> {selectedAcceptedOffer.paymentEdrpou}</p>
                                    {selectedAcceptedOffer.paymentIpn && <p><strong>ІПН:</strong> {selectedAcceptedOffer.paymentIpn}</p>}
                                    <p><strong>IBAN:</strong> {selectedAcceptedOffer.supplierIban}</p>
                                    <p><strong>Банк:</strong> {selectedAcceptedOffer.supplierBankName}</p>
                                </>
                            )}
                        </>)}
                    </div>
                </div>
            )}
        </div>
    );
}

export default MyOffersPage;
import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // useParams тут не використовується
import classes from '../customer/Universal.module.css';
import { FaBoxes, FaInfoCircle, FaFilePdf } from "react-icons/fa"; // Додав FaFilePdf
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
    const [selectedProcurement, setSelectedProcurement] = useState(null); // Для деталей закупівлі
    const [procurementModalLoading, setProcurementModalLoading] = useState(false);
    const [procurementModalError, setProcurementModalError] = useState('');

    const [isAcceptedOfferDetailsModalOpen, setIsAcceptedOfferDetailsModalOpen] = useState(false);
    const [selectedAcceptedOffer, setSelectedAcceptedOffer] = useState(null); // Для деталей прийнятої пропозиції (реквізити замовника)
    const [acceptedOfferLoading, setAcceptedOfferLoading] = useState(false);
    const [acceptedOfferError, setAcceptedOfferError] = useState('');


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
                setAllMyOffers(response.data || []);
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
            if (allMyOffers.length === 0) {
                setMessage('У вас ще немає надісланих пропозицій.');
            } else if (filteredOffers.length === 0 && selectedStatusFilter) {
                setMessage('Пропозицій з вибраним статусом не знайдено.');
            } else {
                 setMessage('');
            }
        } else if (error) {
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
            // Цей запит має повертати ProcurementDto з CustomerName, DeliveryAddress, ContactPhone замовника
            const response = await axios.get(`${BACKEND_BASE_URL}/api/procurements/${procurementId}`, {
                headers: { 'Authorization': `Bearer ${jwtToken}` }
            });
            setSelectedProcurement(response.data);
        } catch (err) {
            console.error('Помилка завантаження деталей закупівлі:', err.response ? err.response.data : err.message);
            setProcurementModalError('Не вдалося завантажити деталі закупівлі.');
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
        setAcceptedOfferLoading(true);
        setIsAcceptedOfferDetailsModalOpen(true);
        setSelectedAcceptedOffer(null); 
        setAcceptedOfferError('');
        
        let enrichedOfferData = { ...offer };
        const needsProcurementDetails = !offer.customerContactPhone || !offer.deliveryAddress || !offer.customerName; // Додав customerName

        if (needsProcurementDetails && offer.procurementId) {
            const jwtToken = localStorage.getItem('jwtToken');
            if (!jwtToken) {
                setAcceptedOfferError('Потрібна авторизація для завантаження деталей закупівлі.');
                setAcceptedOfferLoading(false);
                setSelectedAcceptedOffer(enrichedOfferData);
                return;
            }
            try {
                const procDetailsResponse = await axios.get(`${BACKEND_BASE_URL}/api/procurements/${offer.procurementId}`, {
                     headers: { 'Authorization': `Bearer ${jwtToken}` }
                });
                // Збагачуємо даними з закупівлі (деталі замовника)
                enrichedOfferData.customerContactPhone = procDetailsResponse.data?.contactPhone; 
                enrichedOfferData.deliveryAddress = procDetailsResponse.data?.deliveryAddress;
                enrichedOfferData.customerName = procDetailsResponse.data?.customerName; // Назва компанії замовника
                enrichedOfferData.procurementDetails = procDetailsResponse.data; // Зберігаємо всі деталі закупівлі, якщо потрібні для договору
            } catch (err) {
                console.error("Помилка завантаження деталей закупівлі для прийнятої пропозиції:", err);
                setAcceptedOfferError("Не вдалося завантажити повні деталі закупівлі.");
            }
        }
        setSelectedAcceptedOffer(enrichedOfferData);
        setAcceptedOfferLoading(false);
    };

    const closeAcceptedOfferDetailsModal = () => {
        setIsAcceptedOfferDetailsModalOpen(false);
        setSelectedAcceptedOffer(null);
        setAcceptedOfferError('');
    };

    // --- ФУНКЦІЯ ГЕНЕРАЦІЇ ТЕКСТУ ДОГОВОРУ ДЛЯ ПОСТАЧАЛЬНИКА ---
    // Вона приймає об'єкт пропозиції (який вже може містити деталі закупівлі)
    // та окремо об'єкт деталей закупівлі (якщо вони завантажувалися окремо).
    const generateContractTextForSupplier = (offerWithDetails, procurementDetails) => {
        // Дані Замовника беремо з procurementDetails (які мають бути завантажені)
        const customerName = procurementDetails?.customerName || "ЗАМОВНИК (Назва не вказана)";
       
        const customerRepresentative = procurementDetails?.customerRepresentativeName || customerName; 
        const customerBasis = procurementDetails?.customerBasisOfActivity || "Статуту"; 
       
        
        const customerPhone = procurementDetails?.contactPhone || "не вказано"; // Телефон замовника з закупівлі
        const customerEmail = procurementDetails?.customerEmail || "не вказано";

        // Дані Постачальника (тобто поточного користувача) беремо з `offerWithDetails`
        const supplierFullName = offerWithDetails?.supplierFullName || "Постачальник (ПІБ не вказано)";
        const supplierPaymentEdrpou = offerWithDetails?.paymentEdrpou || "не вказано";
        const supplierPaymentIpn = offerWithDetails?.paymentIpn || "не є платником ПДВ";
        const supplierIban = offerWithDetails?.supplierIban || "не вказано";
        const supplierBankName = offerWithDetails?.supplierBankName || "не вказано";
        const supplierContactPhone = offerWithDetails?.supplierContactPhone || "не вказано";
        const supplierRepresentative = offerWithDetails?.supplierRepresentativeName || supplierFullName; 
        const supplierBasis = offerWithDetails?.supplierBasisOfActivity || "Статуту"; 
        const supplierLegalAddress = offerWithDetails?.supplierLegalAddress || "не вказано"; 
        const supplierEmail = offerWithDetails?.supplierEmail || "не вказано"; 
        const customerContactPhone = procurementDetails?.contactPhone || "xzxz";
        const today = new Date().toLocaleDateString('uk-UA');
        const deliveryDate = offerWithDetails?.proposedDeliveryDate ? new Date(offerWithDetails.proposedDeliveryDate).toLocaleDateString('uk-UA') : 'не вказано';
        const paymentDueDate = offerWithDetails?.proposedDeliveryDate ? new Date(new Date(offerWithDetails.proposedDeliveryDate).setDate(new Date(offerWithDetails.proposedDeliveryDate).getDate() + 3)).toLocaleDateString('uk-UA') : 'не вказано';
        const offerDate = offerWithDetails?.offerDate ? new Date(offerWithDetails.offerDate).toLocaleDateString('uk-UA') : 'не вказано';
        const offerIdShort = offerWithDetails?.id?.substring(0, 6) || 'XXXXXX';
        const procurementIdShort = procurementDetails?.id?.substring(0, 6) || 'YYYYYY';
        
        const numberToWordsUSD = (num) => {
            if (num === undefined || num === null) return "сума не вказана";
            return `${num.toFixed(2)} доларів США`; 
        };
        const priceInWords = numberToWordsUSD(offerWithDetails?.proposedPrice);

    return `ДОГОВІР ПОСТАВКИ № ${offerIdShort}-${procurementIdShort}
м. Київ                                                                                                   "${today}"

ЗАМОВНИК: ${customerName}, надалі іменується «Замовник», в особі ${customerRepresentative}, що діє на підставі ${customerBasis}, з однієї сторони,
ТА
ПОСТАЧАЛЬНИК: ${supplierFullName}, (ЄДРПОУ/РНОКПП: ${supplierPaymentEdrpou}, ІПН: ${supplierPaymentIpn}), надалі іменується «Постачальник», в особі ${supplierRepresentative}, що діє на підставі ${supplierBasis}, з іншої сторони,
разом іменовані «Сторони», а кожна окремо – «Сторона», уклали цей Договір (надалі – «Договір») про наступне:

1. ПРЕДМЕТ ДОГОВОРУ
1.1. Постачальник зобов'язується поставити та передати у власність Замовника, а Замовник зобов'язується прийняти та оплатити Товар: "${procurementDetails?.name || 'Назва товару не вказана'}" (надалі – «Товар»), відповідно до Пропозиції Постачальника № ${offerWithDetails?.id || 'Номер пропозиції не вказаний'} від ${offerDate} (надалі – «Пропозиція»).
1.2. Асортимент, кількість (${procurementDetails?.quantityOrVolume || 'не вказано'}), одиниця виміру, ціна за одиницю та загальна вартість Товару визначаються у Пропозиції, яка є невід'ємною частиною цього Договору.
   - Опис Товару: ${procurementDetails?.description || 'Згідно Пропозиції'}
   - Категорія Товару: ${procurementDetails?.category || 'не вказано'}.

2. ЦІНА ДОГОВОРУ ТА ПОРЯДОК РОЗРАХУНКІВ
2.1. Загальна ціна Договору становить ${offerWithDetails?.proposedPrice || 0} USD (${priceInWords}).
2.2. Оплата здійснюється Замовником на поточний банківський рахунок Постачальника, вказаний у розділі 7 Договору, протягом 3 (трьох) банківських днів з моменту підписання цього Договору, але не пізніше ${paymentDueDate}.

3. УМОВИ ТА СТРОКИ ПОСТАВКИ
3.1. Постачальник зобов'язується здійснити поставку Товару Замовнику в строк до ${deliveryDate} включно.
3.2. Місце поставки Товару: ${procurementDetails?.deliveryAddress || 'Адреса доставки не вказана в закупівлі'}.
3.3. Передача Товару оформлюється видатковою накладною. Право власності на Товар переходить до Замовника в момент підписання видаткової накладної.

4. ЯКІСТЬ ТОВАРУ ТА ГАРАНТІЙНІ ЗОБОВ'ЯЗАННЯ
4.1. Якість Товару повинна відповідати стандартам та технічним умовам, що діють для даного виду Товару.

5. ВІДПОВІДАЛЬНІСТЬ СТОРІН ТА ВИРІШЕННЯ СПОРІВ
5.1. За невиконання або неналежне виконання зобов'язань за цим Договором Сторони несуть відповідальність згідно з чинним законодавством України та цим Договором.
5.2. Усі спори, що виникають з цього Договору, вирішуються шляхом переговорів. У разі недосягнення згоди, спір передається на розгляд до Господарського суду за місцем знаходження Відповідача.

6. ФОРС-МАЖОР
6.1. Сторони звільняються від відповідальності за невиконання зобов'язань, якщо це стало наслідком обставин непереборної сили, що підтверджується сертифікатом Торгово-промислової палати України.

7. РЕКВІЗИТИ ТА ПІДПИСИ СТОРІН

ЗАМОВНИК:                                            ПОСТАЧАЛЬНИК:
${customerName}                                      ${supplierFullName}
Тел: ${customerContactPhone}                         ЄДРПОУ/РНОКПП: ${supplierPaymentEdrpou}
                                                     ІПН: ${supplierPaymentIpn}
                                                     IBAN: ${supplierIban}
                                                     Банк: ${supplierBankName}
                                                     Тел: ${supplierContactPhone}
                                                     Email: ${supplierEmail} 
                                                     



`;
    };
    
    // --- ОНОВЛЕНА ФУНКЦІЯ ВІДОБРАЖЕННЯ ДОГОВОРУ ДЛЯ ПОСТАЧАЛЬНИКА ---
    const handleViewSupplierContract = async (offer) => {
        if (!offer || !offer.procurementId) {
            alert("Недостатньо даних пропозиції для формування договору.");
            return;
        }

        let procurementDetailsForContract = null;

        // Спробувати знайти деталі закупівлі в selectedProcurement (якщо модалка була відкрита)
        if (selectedProcurement && selectedProcurement.id === offer.procurementId) {
            procurementDetailsForContract = selectedProcurement;
        } else {
            // Якщо не знайдено, завантажуємо деталі закупівлі
            const jwtToken = localStorage.getItem('jwtToken');
            if (!jwtToken) {
                alert("Потрібна авторизація для завантаження деталей закупівлі.");
                return;
            }
            try {
                setProcurementModalLoading(true); // Індикатор завантаження для цього запиту
                const response = await axios.get(`${BACKEND_BASE_URL}/api/procurements/${offer.procurementId}`, {
                    headers: { 'Authorization': `Bearer ${jwtToken}` }
                });
                procurementDetailsForContract = response.data;
                setProcurementModalLoading(false);
            } catch (err) {
                setProcurementModalLoading(false);
                alert("Не вдалося завантажити деталі закупівлі для формування договору.");
                console.error("Помилка завантаження деталей закупівлі для договору:", err);
                return;
            }
        }
        
        if (!procurementDetailsForContract) {
             alert("Не вдалося отримати деталі закупівлі для договору.");
             return;
        }

        // Дані замовника (customer) для generateContractTextForSupplier беруться з procurementDetailsForContract
        // Дані постачальника (offer) - це переданий об'єкт offer.
        const contractText = generateContractTextForSupplier(offer, procurementDetailsForContract);
        
        const contractWindow = window.open('', '_blank', 'width=900,height=700,scrollbars=yes,resizable=yes');
        if (contractWindow) {
            contractWindow.document.write('<html><head><title>Договір Поставки</title>');
            contractWindow.document.write(`
                <style>
                    body { font-family: 'Times New Roman', Times, serif; font-size: 12pt; line-height: 1.5; margin: 0; padding: 0; background-color: #EAEAEA; display: flex; justify-content: center; align-items: flex-start; min-height: 100vh; overflow-y: auto; }
                    .contract-page-container { padding: 20px 0; width: 100%; display: flex; justify-content: center; }
                    .contract-a4-sheet { width: 210mm; min-height: 290mm; padding: 20mm 15mm 20mm 25mm; margin: 0; border: 1px solid #B0B0B0; background-color: white; box-shadow: 0 0 10px rgba(0,0,0,0.15); box-sizing: border-box; }
                    pre.contract-text { white-space: pre-wrap; word-wrap: break-word; font-family: 'Times New Roman', Times, serif; font-size: 12pt; line-height: 1.5; margin: 0; text-align: justify; }
                    .print-button-container { position: fixed; top: 15px; right: 20px; z-index: 10000; background: rgba(255,255,255,0.95); padding: 8px; border-radius: 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.2); }
                    .print-button { padding: 10px 18px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px; font-weight: bold; display: flex; align-items: center; }
                    .print-button:hover { background-color: #0056b3; }
                    .print-button svg { margin-right: 8px; }
                    @media print {
                        body { background-color: white; margin: 0; padding: 0; display: block; }
                        .contract-page-container { padding: 0; }
                        .contract-a4-sheet { margin: 0; border: none; box-shadow: none; width: auto; min-height: auto; padding: 10mm; }
                        .print-button-container { display: none !important; }
                    }
                </style>
            `);
            contractWindow.document.write('</head><body>');
            contractWindow.document.write('<div class="contract-page-container"><div class="contract-a4-sheet">');
            const actualContractText = contractText.includes("Use code with caution.") ? contractText.substring(contractText.indexOf("ДОГОВІР ПОСТАВКИ")) : contractText;
            contractWindow.document.write(`<pre class="contract-text">${actualContractText}</pre>`);
            contractWindow.document.write('</div></div>');
            contractWindow.document.write(`
                <div class="print-button-container">
                    <button class="print-button" onclick="window.print()">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-printer-fill" viewBox="0 0 16 16">
                            <path d="M5 1a2 2 0 0 0-2 2v2H2a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h1v1a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-1h1a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-1V3a2 2 0 0 0-2-2H5zm2 12H5.5a.5.5 0 0 1 0-1H12a.5.5 0 0 1 0 1H9.5a.5.5 0 0 1-.5-.5V8.5h-2v4a.5.5 0 0 1-.5.5zM6 7a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm4 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
                        </svg>
                        Друк / Зберегти як PDF
                    </button>
                </div>
            `);
            contractWindow.document.write('</body></html>');
            contractWindow.document.close();
        } else {
            alert("Не вдалося відкрити нове вікно. Можливо, блокувальник спливаючих вікон увімкнений.");
        }
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
                : ( 
                    <>
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
                                            <div style={{marginTop: '10px', background:"white", display: 'flex', justifyContent: 'start', gap:"2em"/* Змінив для кращого розташування кнопок */}}>
                                                <button 
                                                    className={classes.detailsButton} 
                                                    onClick={() => openAcceptedOfferModal(offer)}
                                                    disabled={acceptedOfferLoading && selectedAcceptedOffer?.id === offer.id}
                                                    style={{ paddingLeft:"0.5em", paddingRight:"0.5em" , width:"20em"}}
                                                >
                                                   <FaInfoCircle style={{marginRight: '5px',  background:"#2070d1"}} /> 
                                                   {acceptedOfferLoading && selectedAcceptedOffer?.id === offer.id ? 'Завантаження...' : 'Реквізити та інфо'}
                                                </button>
                                                {/* НОВА КНОПКА ДЛЯ ДОГОВОРУ ПОСТАЧАЛЬНИКА */}
                                                <button
                                                    className={classes.detailsButton} 
                                                    onClick={() => handleViewSupplierContract(offer)}
                                                    disabled={procurementModalLoading} // Деактивуємо, якщо деталі закупівлі ще завантажуються
                                                    title="Переглянути договір для цієї пропозиції"
                                                     style={{ paddingLeft:"0.5em", paddingRight:"0.5em" , width:"20em"}} // Додав flexGrow
                                                >
                                                    <FaFilePdf style={{marginRight: '5px',  background:"#2070d1"}} /> Договір
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

            {/* Модальне вікно ДЕТАЛЕЙ ПРИЙНЯТОЇ ПРОПОЗИЦІЇ (реквізити замовника, пропозиція постачальника) */}
            {isAcceptedOfferDetailsModalOpen && selectedAcceptedOffer && (
                 <div className={classes.modalOverlay} onClick={closeAcceptedOfferDetailsModal}>
                    <div className={classes.modalContent} style={{maxWidth: '600px'}} onClick={e => e.stopPropagation()}>
                        <button className={classes.modalCloseButton} onClick={closeAcceptedOfferDetailsModal}>
                            <IoCloseCircleOutline className={classes.cancelOutline} size={30} />
                        </button>
                        <h3 className={classes.modalTitle}>Деталі по прийнятій пропозиції</h3>
                        {acceptedOfferLoading ? (<p>Завантаження...</p>) : 
                         acceptedOfferError ? (<p style={{color: 'red'}}>{acceptedOfferError}</p>) :
                        (<>
                            <p><strong>Закупівля:</strong> {selectedAcceptedOffer.procurementName || 'N/A'}</p>
                            <h4 style={{marginTop: '1em'}}>Інформація від Замовника:</h4>
                            <p><strong>Контактний телефон Замовника:</strong> {selectedAcceptedOffer.customerContactPhone || 'Не вказано'}</p>
                            <p><strong>Адреса доставки Замовника:</strong> {selectedAcceptedOffer.deliveryAddress || 'Не вказано'}</p>
                            
                            <h4 style={{marginTop: '1em'}}>Ваша пропозиція (Постачальника):</h4>
                            <p><strong>Запропонована дата доставки:</strong> {selectedAcceptedOffer.proposedDeliveryDate ? new Date(selectedAcceptedOffer.proposedDeliveryDate).toLocaleDateString() : 'Не вказано'}</p>
                            <p><strong>Запропонована сума:</strong> ${selectedAcceptedOffer.proposedPrice}</p>
                            
                            {selectedAcceptedOffer.supplierFullName && (
                                <>
                                    <h4 style={{marginTop: '1em'}}>Ваші реквізити (як постачальника):</h4>
                                    <p><strong>Повне найменування:</strong> {selectedAcceptedOffer.supplierFullName}</p>
                                    <p><strong>Телефон:</strong> {selectedAcceptedOffer.supplierContactPhone}</p> 
                                    <p><strong>ЄДРПОУ/РНОКПП:</strong> {selectedAcceptedOffer.paymentEdrpou}</p>
                                    {selectedAcceptedOffer.paymentIpn && <p><strong>ІПН:</strong> {selectedAcceptedOffer.paymentIpn}</p>}
                                    <p><strong>IBAN:</strong> {selectedAcceptedOffer.supplierIban}</p>
                                    <p><strong>Банк:</strong> {selectedAcceptedOffer.supplierBankName}</p>
                                </>
                                
                                
                                
                            )}
                            <p style={{color:"red"}}>Ви зобов'язані доставити товар у вкзанаому замовником обсязі на адресу: {selectedAcceptedOffer.deliveryAddress || 'Не вказано'} до зазначеного дедлайну: {selectedAcceptedOffer.proposedDeliveryDate ? new Date(selectedAcceptedOffer.proposedDeliveryDate).toLocaleDateString() : 'Не вказано'} </p>
                        </>)}
                    </div>
                </div>
            )}
        </div>
    );
}

export default MyOffersPage;
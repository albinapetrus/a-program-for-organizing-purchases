import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import classes from './Universal.module.css'; // Переконайся, що шлях правильний
import { FaBoxes, FaFilePdf, FaPrint, FaInfoCircle } from "react-icons/fa"; // Додали іконки
import { IoCloseCircleOutline } from "react-icons/io5";
// import jsPDF from 'jspdf'; // Розкоментуй, якщо будеш використовувати jspdf
const BACKEND_BASE_URL = 'https://localhost:7078';
// ... (translateProcurementStatus, translateOfferStatus - без змін) ...
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
const [actionLoading, setActionLoading] = useState(false);
const [error, setError] = useState('');
const [message, setMessage] = useState('');
const [actionFeedback, setActionFeedback] = useState('');

const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
const [selectedProcurementForDetail, setSelectedProcurementForDetail] = useState(null);
const [modalDetailLoading, setModalDetailLoading] = useState(false);
const [modalDetailError, setModalDetailError] = useState('');

const [isConfirmAcceptModalOpen, setIsConfirmAcceptModalOpen] = useState(false);
const [offerToConfirm, setOfferToConfirm] = useState(null);
const [confirmAcceptCheckbox, setConfirmAcceptCheckbox] = useState(false);

// --- НОВИЙ СТАН ДЛЯ МОДАЛЬНОГО ВІКНА З ДЕТАЛЯМИ ПРИЙНЯТОЇ ПРОПОЗИЦІЇ ---
const [acceptedOfferDetails, setAcceptedOfferDetails] = useState(null); // Тут будуть дані з /api/offers/{id}
const [isAcceptedOfferModalOpen, setIsAcceptedOfferModalOpen] = useState(false);
const [acceptedOfferLoading, setAcceptedOfferLoading] = useState(false); // Окремий лоадер
const [acceptedOfferError, setAcceptedOfferError] = useState('');
// ------------------------------------------------------------------------

const fetchInitialData = async () => {
    // ... (без змін) ...
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
    // ... (без змін) ...
    if (!selectedProcurementId) {
        setDisplayedOffers(allOffers);
        setMessage(allOffers.length === 0 && !loading && !error ? 'У вас ще немає пропозицій до ваших закупівель.' : '');
    } else {
        const filtered = allOffers.filter(offer => offer.procurementId === selectedProcurementId);
        setDisplayedOffers(filtered);
        setMessage(filtered.length === 0 && !loading && !error ? 'Для обраної закупівлі пропозицій не знайдено.' : '');
    }
}, [selectedProcurementId, allOffers, loading, error]);

const handleProcurementSelectChange = (e) => {
    // ... (без змін) ...
    const newProcurementId = e.target.value;
    setSelectedProcurementId(newProcurementId);
};

const openConfirmAcceptModal = (offer) => {
    // ... (без змін) ...
    setOfferToConfirm(offer);
    setConfirmAcceptCheckbox(false);
    setIsConfirmAcceptModalOpen(true);
};

const closeConfirmAcceptModal = () => {
    // ... (без змін) ...
    setIsConfirmAcceptModalOpen(false);
    setOfferToConfirm(null);
};

// --- НОВА ФУНКЦІЯ ДЛЯ ВІДКРИТТЯ МОДАЛЬНОГО ВІКНА З ДЕТАЛЯМИ ПРИЙНЯТОЇ ПРОПОЗИЦІЇ ---
const openAcceptedOfferDetailsModal = async (offerId) => {
    setIsAcceptedOfferModalOpen(true);
    setAcceptedOfferLoading(true);
    setAcceptedOfferError('');
    setAcceptedOfferDetails(null);

    const jwtToken = localStorage.getItem('jwtToken');
    if (!jwtToken) {
        setAcceptedOfferError('Потрібна авторизація.');
        setAcceptedOfferLoading(false);
        return;
    }
    try {
        // Запит на отримання повних деталей пропозиції, включаючи реквізити
        const response = await axios.get(`${BACKEND_BASE_URL}/api/offers/${offerId}`, {
            headers: { 'Authorization': `Bearer ${jwtToken}` }
        });
        setAcceptedOfferDetails(response.data);
    } catch (err) {
        console.error('Помилка завантаження деталей прийнятої пропозиції:', err.response ? err.response.data : err.message);
        setAcceptedOfferError('Не вдалося завантажити деталі пропозиції.');
    } finally {
        setAcceptedOfferLoading(false);
    }
};

const closeAcceptedOfferModal = () => {
    setIsAcceptedOfferModalOpen(false);
    setAcceptedOfferDetails(null);
    setAcceptedOfferError('');
};
// ----------------------------------------------------------------------------

const handleAcceptOfferConfirmed = async () => {
    if (!confirmAcceptCheckbox || !offerToConfirm) {
        alert("Будь ласка, підтвердіть вашу згоду, поставивши галочку.");
        return;
    }
    
    const offerIdToAccept = offerToConfirm.id; // Зберігаємо ID перед закриттям модалки
    closeConfirmAcceptModal(); 
    
    setActionFeedback('');
    setActionLoading(true);
    const jwtToken = localStorage.getItem('jwtToken');

    try {
        const response = await axios.put(`${BACKEND_BASE_URL}/api/offers/${offerIdToAccept}/accept`, {}, {
            headers: { 'Authorization': `Bearer ${jwtToken}` }
        });
        setActionFeedback(response.data.message || 'Пропозицію успішно прийнято!');
        await fetchInitialData(); // Оновлюємо списки на сторінці
        
        // Відкриваємо модальне вікно з деталями прийнятої пропозиції (реквізити)
        openAcceptedOfferDetailsModal(offerIdToAccept);

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
        setActionLoading(false);
    }
};

const handleAcceptOfferClick = (offerId) => {
    // ... (без змін) ...
    const offer = displayedOffers.find(o => o.id === offerId);
    if (offer) {
        openConfirmAcceptModal(offer);
    }
};

const handleRejectOffer = async (offerId) => {
    // ... (без змін) ...
    setActionFeedback('');
    setActionLoading(true);
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
        setActionLoading(false);
    }
};

const openDetailModal = async (procurementIdToLoad) => {
    // ... (без змін) ...
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
    // ... (без змін) ...
    setIsDetailModalOpen(false);
    setSelectedProcurementForDetail(null);
    setModalDetailError('');
};

// --- Функції для договору (поки що заглушки) ---
 const generateContractText = (offer, procurement, customer /* Доданий customer для гнучкості */) => {
        // Якщо currentCustomerDetails передано і має дані, використовуємо їх, інакше - дані з procurement або заглушки
        const customerName = customer?.companyName || customer?.fullName || procurement?.customerName || "ЗАМОВНИК (Назва не вказана)";
        const customerEdrpou = customer?.edrpou || "ЄДРПОУ ЗАМОВНИКА (не вказано)";
        const customerRepresentative = customer?.representativeName || customerName; 
        const customerBasis = customer?.basisOfActivity || "Статуту"; 
        const customerLegalAddress = customer?.legalAddress || "не вказано";
        const customerIpn = customer?.ipn || "не є платником ПДВ";
        const customerIban = customer?.iban || "не вказано";
        const customerBankName = customer?.bankName || "не вказано";
        const customerPhone = customer?.phoneNumber || procurement?.contactPhone || "не вказано";
        const customerEmail = customer?.email || "не вказано";

        // Дані Постачальника беруться з `offer`
        const supplierFullName = offer?.supplierFullName || "Постачальник (ПІБ не вказано)";
        const supplierPaymentEdrpou = offer?.paymentEdrpou || "не вказано";
        const supplierPaymentIpn = offer?.paymentIpn || "не є платником ПДВ";
        const supplierIban = offer?.supplierIban || "не вказано";
        const supplierBankName = offer?.supplierBankName || "не вказано";
        const supplierContactPhone = offer?.supplierContactPhone || "не вказано";
        // Ці поля мають бути в `offer` (тобто `acceptedOfferDetails`), якщо ти їх хочеш бачити
        const supplierRepresentative = offer?.supplierRepresentativeName || supplierFullName; 
        const supplierBasis = offer?.supplierBasisOfActivity || "Статуту"; 
        const supplierLegalAddress = offer?.supplierLegalAddress || "не вказано"; 
        const supplierEmail = offer?.supplierEmail || "не вказано"; 

        const today = new Date().toLocaleDateString('uk-UA');
        const deliveryDate = offer?.proposedDeliveryDate ? new Date(offer.proposedDeliveryDate).toLocaleDateString('uk-UA') : 'не вказано';
        const paymentDueDate = offer?.proposedDeliveryDate ? new Date(new Date(offer.proposedDeliveryDate).setDate(new Date(offer.proposedDeliveryDate).getDate() + 3)).toLocaleDateString('uk-UA') : 'не вказано';
        const offerDate = offer?.offerDate ? new Date(offer.offerDate).toLocaleDateString('uk-UA') : 'не вказано';
        const offerIdShort = offer?.id?.substring(0, 6) || 'XXXXXX';
        const procurementIdShort = procurement?.id?.substring(0, 6) || 'YYYYYY';
        
        const numberToWordsUSD = (num) => {
            if (num === undefined || num === null) return "сума не вказана";
            return `${num.toFixed(2)} доларів США`; 
        };
        const priceInWords = numberToWordsUSD(offer?.proposedPrice);

    // Твій шаблон договору
    return `ДОГОВІР ПОСТАВКИ № ${offerIdShort}-${procurementIdShort}
м. Київ                                                                                                   "${today}"

${customerName}, надалі іменується «Замовник», в особі ${customerRepresentative}, що діє на підставі ${customerBasis}, з однієї сторони,
ТА
${supplierFullName}, (ЄДРПОУ/РНОКПП: ${supplierPaymentEdrpou}, ІПН: ${supplierPaymentIpn}), надалі іменується «Постачальник», в особі ${supplierRepresentative}, з іншої сторони,
разом іменовані «Сторони», а кожна окремо – «Сторона», уклали цей Договір (надалі – «Договір») про наступне:

1. ПРЕДМЕТ ДОГОВОРУ
1.1. Постачальник зобов'язується поставити та передати у власність Замовника, а Замовник зобов'язується прийняти та оплатити Товар: "${procurement?.name || 'Назва товару не вказана'}" (надалі – «Товар»), відповідно до Пропозиції Постачальника № ${offer?.id || 'Номер пропозиції не вказаний'} від ${offerDate} (надалі – «Пропозиція»).
1.2. Асортимент, кількість (${procurement?.quantityOrVolume || 'не вказано'}), одиниця виміру, ціна за одиницю та загальна вартість Товару визначаються у Пропозиції, яка є невід'ємною частиною цього Договору.
   - Опис Товару: ${procurement?.description || 'Згідно Пропозиції'}
   - Категорія Товару: ${procurement?.category || 'не вказано'}.

2. ЦІНА ДОГОВОРУ ТА ПОРЯДОК РОЗРАХУНКІВ
2.1. Загальна ціна Договору становить ${offer?.proposedPrice || 0} USD (${priceInWords}). Оплата здійснюється в гривнях за курсом НБУ на день оплати.
2.2. Оплата здійснюється Замовником на поточний банківський рахунок Постачальника, вказаний у розділі 7 Договору, протягом 3 (трьох) банківських днів з моменту підписання цього Договору, але не пізніше ${paymentDueDate}.

3. УМОВИ ТА СТРОКИ ПОСТАВКИ
3.1. Постачальник зобов'язується здійснити поставку Товару Замовнику в строк до ${deliveryDate} включно.
3.2. Місце поставки Товару: ${procurement?.deliveryAddress || 'Буде узгоджено додатково'}.
3.3. Передача Товару оформлюється видатковою накладною. Право власності на Товар переходить до Замовника в момент підписання видаткової накладної.

4. ЯКІСТЬ ТОВАРУ ТА ГАРАНТІЙНІ ЗОБОВ'ЯЗАННЯ
4.1. Якість Товару повинна відповідати стандартам та технічним умовам, що діють в Україні для даного виду Товару.

5. ВІДПОВІДАЛЬНІСТЬ СТОРІН ТА ВИРІШЕННЯ СПОРІВ
5.1. За невиконання або неналежне виконання зобов'язань за цим Договором Сторони несуть відповідальність згідно з чинним законодавством України.
5.2. Усі спори, що виникають з цього Договору, вирішуються шляхом переговорів. У разі недосягнення згоди, спір передається на розгляд до відповідного суду згідно з чинним законодавством України.

6. ФОРС-МАЖОР
6.1. Сторони звільняються від відповідальності за невиконання зобов'язань, якщо це стало наслідком обставин непереборної сили.

7. РЕКВІЗИТИ ТА ПІДПИСИ СТОРІН

ЗАМОВНИК:                                     ПОСТАЧАЛЬНИК:
${customerName}                                ${supplierFullName}
Тел: ${customerPhone}                          Юр. адреса: ${supplierLegalAddress}
                                               ЄДРПОУ/РНОКПП: ${supplierPaymentEdrpou}
                                               ІПН: ${supplierPaymentIpn}
                                               IBAN: ${supplierIban}
                                               Банк: ${supplierBankName}
                                               Тел: ${supplierContactPhone}
                                             

                                        
`;
    };

    // --- ОНОВЛЕНА ФУНКЦІЯ ВІДОБРАЖЕННЯ ДОГОВОРУ ---
    const handleViewContract = () => {
        // Перевірка, чи завантажені деталі прийнятої пропозиції
        if (!acceptedOfferDetails) {
            alert("Деталі пропозиції не завантажені. Будь ласка, відкрийте спочатку 'Реквізити та Інформація'.");
            return;
        }
        
        // Знаходимо відповідну закупівлю для договору
        const relatedProcurement = 
            customerProcurements.find(p => p.id === acceptedOfferDetails.procurementId) || 
            (selectedProcurementForDetail && selectedProcurementForDetail.id === acceptedOfferDetails.procurementId ? selectedProcurementForDetail : null);

        if (!relatedProcurement) {
            alert("Не вдалося знайти деталі закупівлі для договору. Спробуйте спочатку відкрити деталі закупівлі (клік на назву пропозиції).");
            // Якщо потрібно, тут можна додати логіку асинхронного завантаження деталей закупівлі
            // await openDetailModal(acceptedOfferDetails.procurementId);
            // і потім викликати handleViewContract знову, але це ускладнить потік.
            return;
        }
        
        // Оскільки ти просив НЕ змінювати логіку отримання даних Замовника,
        // ми передаємо `relatedProcurement` (який може містити `customerName` та інші поля з бекенду)
        // та `currentCustomerDetails` (який може бути null, якщо fetchCurrentCustomerDetails не реалізовано/не працює).
        // Функція generateContractText сама вирішить, які дані використовувати.
        const contractText = generateContractText(acceptedOfferDetails, relatedProcurement);
        
        const contractWindow = window.open('', '_blank', 'width=900,height=700,scrollbars=yes,resizable=yes');
        if (contractWindow) {
            contractWindow.document.write('<html><head><title>Договір Поставки</title>');
            contractWindow.document.write(`
                <style>
                    body { 
                        font-family: 'Times New Roman', Times, serif; 
                        font-size: 12pt; 
                        line-height: 1.5;
                        margin: 0; 
                        padding: 0;
                        background-color: #EAEAEA; /* Фон поза аркушем */
                        display: flex;
                        justify-content: center;
                        align-items: flex-start; /* Аркуш притиснутий до верху */
                        min-height: 100vh;
                        overflow-y: auto; /* Дозволяємо скрол для всього тіла */
                    }
                    .contract-page-container { /* Контейнер для відступів і центрування аркуша */
                        padding: 20px 0; /* Відступи зверху/знизу для скролу */
                        width: 100%;
                        display: flex;
                        justify-content: center;
                    }
                    .contract-a4-sheet { /* Стилізація самого аркуша */
                        width: 210mm; /* Ширина A4 */
                        min-height: 290mm; /* Мінімальна висота A4 */
                        padding: 20mm 15mm 20mm 25mm; /* Поля: верх, право, низ, ліво */
                        margin: 0; 
                        border: 1px solid #B0B0B0; 
                        background-color: white;
                        box-shadow: 0 0 10px rgba(0,0,0,0.15);
                        box-sizing: border-box;
                    }
                    pre.contract-text { /* Стилізація для тексту договору */
                        white-space: pre-wrap; 
                        word-wrap: break-word; 
                        font-family: 'Times New Roman', Times, serif;
                        font-size: 12pt;
                        line-height: 1.5;
                        margin: 0;
                        text-align: justify; /* Вирівнювання по ширині */
                    }
                    .print-button-container { /* Контейнер для кнопки друку */
                        position: fixed; 
                        top: 15px;
                        right: 20px;
                        z-index: 10000; 
                        background: rgba(255,255,255,0.95);
                        padding: 8px;
                        border-radius: 5px;
                        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
                    }
                    .print-button { /* Стиль кнопки друку */
                        padding: 10px 18px;
                        background-color: #007bff;
                        color: white;
                        border: none;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 14px;
                        font-weight: bold;
                        display: flex;
                        align-items: center;
                    }
                    .print-button:hover {
                        background-color: #0056b3;
                    }
                    .print-button svg { 
                        margin-right: 8px;
                    }

                    @media print { /* Стилі для друку */
                        body { 
                            background-color: white; 
                            margin: 0; 
                            padding: 0; 
                            display: block;
                        }
                        .contract-page-container { padding: 0; }
                        .contract-a4-sheet {
                            margin: 0;
                            border: none;
                            box-shadow: none;
                            width: auto; 
                            min-height: auto;
                            padding: 10mm; /* Поля для друку */
                        }
                        .print-button-container { display: none !important; } 
                    }
                </style>
            `);
            contractWindow.document.write('</head><body>');
            contractWindow.document.write('<div class="contract-page-container"><div class="contract-a4-sheet">');
            // Видаляємо рядок "Use code with caution." якщо він є на початку
            // та "ЗАМОВНИК:" якщо він йде одразу після шапки, бо ЗАМОВНИК вже є в тексті
            let actualContractText = contractText;
            if (actualContractText.trim().startsWith("Use code with caution.")) {
                 actualContractText = actualContractText.substring(actualContractText.indexOf("ДОГОВІР ПОСТАВКИ"));
            }
            // Ця частина для видалення дублюючого "ЗАМОВНИК:" може бути не ідеальною,
            // краще виправити шаблон generateContractText, щоб він не генерував його двічі
            const contractBodyStartIndex = actualContractText.indexOf("м. Київ");
            if (contractBodyStartIndex !== -1) {
                const header = actualContractText.substring(0, contractBodyStartIndex);
                let body = actualContractText.substring(contractBodyStartIndex);
                if (body.trim().startsWith("ЗАМОВНИК:")) {
                    body = body.substring(body.indexOf("ЗАМОВНИК:") + "ЗАМОВНИК:".length).trimStart();
                    body = `ЗАМОВНИК:${body}`; // Повертаємо один раз
                }
                 // Видаляємо повторювані заголовки, якщо вони є
                const mainHeader = "ДОГОВІР ПОСТАВКИ №";
                const firstOccurrence = actualContractText.indexOf(mainHeader);
                if (firstOccurrence !== -1) {
                    const secondOccurrence = actualContractText.indexOf(mainHeader, firstOccurrence + mainHeader.length);
                    if (secondOccurrence !== -1) {
                        actualContractText = actualContractText.substring(0, secondOccurrence) + actualContractText.substring(actualContractText.indexOf("м. Київ", secondOccurrence));
                    }
                }
            }


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

// ---------------------------------------------

return (
    <div className={classes.universal}>
        <div className={classes.block}>
            {/* ... (Заголовок та фільтр без змін) ... */}
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
                    disabled={loading || actionLoading}
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
                <p style={{ color: actionFeedback.includes('Помилка') ? 'red' : 'green', marginTop: '1em', fontWeight: 'bold' }}>
                    {actionFeedback}
                </p>
            )}

            {loading ? ( <p>Завантаження пропозицій...</p> )
            : error ? ( <p style={{ color: 'red', marginTop: '1em' }}>{error}</p> )
            : message && displayedOffers.length === 0 ? ( 
                <p style={{ color: 'blue', marginTop: '1em' }}>{message}</p>
            ) : (
                <div className={classes.resultsContainer}>
                    {displayedOffers.map((offer) => {
                        const relatedProcurement = customerProcurements.find(p => p.id === offer.procurementId);
                        const procurementStatus = relatedProcurement ? relatedProcurement.status : 'N/A';

                        return (
                            <div key={offer.id} className={classes.procurementCard}>
                                <h4 onClick={() => openDetailModal(offer.procurementId)} style={{ cursor: 'pointer', color: '#007bff' }} title="Натисніть, щоб переглянути деталі закупівлі">
                                    Пропозиція до закупівлі: "{offer.procurementName || 'N/A'}"
                                </h4>
                                <p><strong>Від постачальника:</strong> {offer.supplierCompanyName || 'N/A'}</p>
                                <p><strong>Запропонована ціна:</strong> ${offer.proposedPrice}</p>
                                {offer.proposedDeliveryDate && (<p><strong>Пропонована дата доставки:</strong> {new Date(offer.proposedDeliveryDate).toLocaleDateString()}</p>)}
                                <p><strong>Повідомлення:</strong> {offer.message || 'Не вказано'}</p>
                                {offer.offerDocumentPaths && (<p><strong>Документ: </strong> <a href={`${BACKEND_BASE_URL}${offer.offerDocumentPaths}`} target="_blank" rel="noopener noreferrer">Переглянути</a></p>)}
                                <p><strong>Дата пропозиції:</strong> {new Date(offer.offerDate).toLocaleDateString()}</p>
                                <p><strong>Статус пропозиції:</strong> <span style={{ fontWeight: 'bold', color: offer.status && offer.status.toLowerCase() === 'accepted' ? 'green' : offer.status && offer.status.toLowerCase() === 'rejected' ? 'red' : 'orange' }}>
                                    {translateOfferStatus(offer.status)}</span>
                                </p>
                                <p><strong>Статус закупівлі: </strong> <span style={{ fontWeight: 'bold', color: (procurementStatus && procurementStatus.toLowerCase() === 'open') ? 'blue' : (procurementStatus && procurementStatus.toLowerCase() === 'fulfilled') ? 'green' : 'red' }}>
                                    {translateProcurementStatus(procurementStatus)}</span>
                                </p>
                                
                                {/* КНОПКИ ДІЙ */}
                                {offer.status === 'Submitted' && (
                                    <div className={classes.offerActions}>
                                        <button className={`${classes.submitButton} ${classes.acceptButton}`} onClick={() => handleAcceptOfferClick(offer.id)} disabled={actionLoading || loading}>Прийняти</button>
                                        <button className={`${classes.submitButton} ${classes.rejectButton}`} onClick={() => handleRejectOffer(offer.id)} disabled={actionLoading || loading}>Відхилити</button>
                                    </div>
                                )}
                                {/* КНОПКИ ДЛЯ ПРИЙНЯТОЇ ПРОПОЗИЦІЇ */}
                                {offer.status === 'Accepted' && (
                                    <div className={classes.offerActions} style={{marginTop: '10px'}}>
                                        <button 
                                            className={classes.detailsButton} // Використовуй або створи схожий стиль
                                            onClick={() => openAcceptedOfferDetailsModal(offer.id)}
                                            style={{ paddingLeft:"0.5em", paddingRight:"0.5em" , width:"40em"}}
                                        >
                                           <FaInfoCircle style={{marginRight: '5px', background:"#2070d1" }} /> Реквізити та Інформація
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

        {/* Модальне вікно ДЕТАЛЕЙ ЗАКУПІВЛІ (яке вже було) */}
        {isDetailModalOpen && ( /* ... без змін ... */ 
            <div className={classes.modalOverlay} onClick={closeDetailModal}> 
                <div className={classes.modalContent} onClick={e => e.stopPropagation()}> 
                    <button className={classes.modalCloseButton} onClick={closeDetailModal}>
                        <IoCloseCircleOutline className={classes.cancelOutline} size={30} /> 
                    </button>
                    {modalDetailLoading ? ( <p>Завантаження деталей закупівлі...</p> )
                    : modalDetailError ? ( <p style={{ color: 'red' }}>{modalDetailError}</p> )
                    : selectedProcurementForDetail ? (
                        <>
                            <h2 className={classes.modalTitle}>{selectedProcurementForDetail.name}</h2>
                            {selectedProcurementForDetail.customerCompanyName && (<p><strong>Замовник:</strong> {selectedProcurementForDetail.customerCompanyName}</p>)}
                            <p><strong>Категорія:</strong> {selectedProcurementForDetail.category}</p>
                            <p><strong>Опис:</strong> {selectedProcurementForDetail.description || 'Не вказано'}</p>
                            <p><strong>Кількість/Обсяг:</strong> {selectedProcurementForDetail.quantityOrVolume}</p>
                            <p><strong>Орієнтовний бюджет:</strong> ${selectedProcurementForDetail.estimatedBudget}</p>
                            <p><strong>Дата завершення:</strong> {new Date(selectedProcurementForDetail.completionDate).toLocaleDateString()}</p>
                            {selectedProcurementForDetail.deliveryAddress && (<p><strong>Адреса доставки:</strong> {selectedProcurementForDetail.deliveryAddress}</p>)}
                            {selectedProcurementForDetail.contactPhone && (<p><strong>Контактний телефон:</strong> {selectedProcurementForDetail.contactPhone}</p>)}
                            {selectedProcurementForDetail.documentPaths && (<p><strong>Документ закупівлі: </strong> <a href={`${BACKEND_BASE_URL}${selectedProcurementForDetail.documentPaths}`} target="_blank" rel="noopener noreferrer">Переглянути</a></p>)}
                            <p><strong>Створено:</strong> {new Date(selectedProcurementForDetail.createdAt).toLocaleDateString()}</p>
                            <p><strong>Статус закупівлі:</strong> {translateProcurementStatus(selectedProcurementForDetail.status)}</p>
                        </>
                    ) : ( <p>Немає даних для відображення деталей закупівлі.</p> )}
                </div>
            </div>
        )}

        {/* Модальне вікно ПІДТВЕРДЖЕННЯ прийняття пропозиції (без змін) */}
        {isConfirmAcceptModalOpen && offerToConfirm && ( /* ... без змін ... */ 
             <div className={classes.modalOverlay} onClick={closeConfirmAcceptModal}>
                <div className={classes.modalContent} onClick={e => e.stopPropagation()}>
                    <button className={classes.modalCloseButton} onClick={closeConfirmAcceptModal}>
                        <IoCloseCircleOutline className={classes.cancelOutline} size={30} />
                    </button>
                    <h3 className={classes.modalTitle}>Підтвердження прийняття пропозиції</h3>
                    <p>
                        Натискаючи "Підтвердити прийняття", ви погоджуєтесь перевести суму 
                        <strong> ${offerToConfirm.proposedPrice} </strong> 
                        постачальнику <strong>"{offerToConfirm.supplierCompanyName || offerToConfirm.supplierFullName || 'N/A'}"</strong> (за закупівлею "{offerToConfirm.procurementName || 'N/A'}") 
                        до дати 
                        <strong> {new Date(new Date(offerToConfirm.proposedDeliveryDate).setDate(new Date(offerToConfirm.proposedDeliveryDate).getDate() + 3)).toLocaleDateString()} </strong>
                        (пропонована дата доставки: {new Date(offerToConfirm.proposedDeliveryDate).toLocaleDateString()} ), 
                        за виключенням випадку неотримання товару/послуги належної якості.
                    </p>
                    <div style={{ marginTop: '1em', marginBottom: '1em', background:"white" }}>
                        <input 
                            type="checkbox" 
                            id="confirmAcceptOfferCheckbox" 
                            checked={confirmAcceptCheckbox}
                            onChange={(e) => setConfirmAcceptCheckbox(e.target.checked)}
                            style={{ all: 'revert' }}
                        />
                        <label htmlFor="confirmAcceptOfferCheckbox" style={{ marginLeft: '0.5em' }}>
                            Я підтверджую свою згоду з вищезазначеними умовами.
                        </label>
                    </div>
                    <button 
                        className={`${classes.submitButton} ${classes.acceptButton}`}
                        onClick={handleAcceptOfferConfirmed}
                        disabled={!confirmAcceptCheckbox || actionLoading}
                        style={{marginRight: '10px'}}
                    >
                        {actionLoading ? 'Обробка...' : 'Підтвердити прийняття'}
                    </button>
                    <button 
                        className={`${classes.submitButton} ${classes.rejectButton}`}
                        onClick={closeConfirmAcceptModal}
                        disabled={actionLoading}
                    >
                        Скасувати
                    </button>
                </div>
            </div>
        )}

        {/* --- НОВЕ МОДАЛЬНЕ ВІКНО З ДЕТАЛЯМИ ПРИЙНЯТОЇ ПРОПОЗИЦІЇ (РЕКВІЗИТИ І ДОГОВІР) --- */}
        {isAcceptedOfferModalOpen && acceptedOfferDetails && (
            <div className={classes.modalOverlay} onClick={closeAcceptedOfferModal}>
                <div className={classes.modalContent} style={{maxWidth: '750px', maxHeight: '80vh', overflowY: 'auto'}} onClick={e => e.stopPropagation()}>
                    <button className={classes.modalCloseButton} onClick={closeAcceptedOfferModal}>
                        <IoCloseCircleOutline className={classes.cancelOutline} size={30} />
                    </button>
                    <h3 className={classes.modalTitle}>Деталі прийнятої пропозиції та оплата</h3>
                    
                    <h4>Інформація про постачальника:</h4>
                    <p><strong>Постачальник (ФОП/ТОВ):</strong> {acceptedOfferDetails.supplierFullName || acceptedOfferDetails.supplierCompanyName || 'N/A'}</p>
                    <p><strong>Контактний телефон:</strong> {acceptedOfferDetails.supplierContactPhone}</p>
                    {/* Потрібно додати Email постачальника в OfferDetailsDto та отримати його з User на бекенді */}
                    {/* <p><strong>Email:</strong> {acceptedOfferDetails.supplierEmail || 'Не вказано'}</p> */}

                    <h4 style={{marginTop: '1em'}}>Платіжні реквізити:</h4>
                    <p><strong>ЄДРПОУ/РНОКПП:</strong> {acceptedOfferDetails.paymentEdrpou}</p>
                    {acceptedOfferDetails.paymentIpn && <p><strong>ІПН:</strong> {acceptedOfferDetails.paymentIpn}</p>}
                    <p><strong>IBAN:</strong> {acceptedOfferDetails.supplierIban}</p>
                    <p><strong>Назва банку:</strong> {acceptedOfferDetails.supplierBankName}</p>
                    
                    <h4 style={{marginTop: '1em'}}>Деталі оплати:</h4>
                    <p><strong>Закупівля:</strong> {acceptedOfferDetails.procurementName}</p>
                    <p><strong>Сума до сплати:</strong> ${acceptedOfferDetails.proposedPrice}</p>
                    <p><strong>Сплатити до:</strong> {new Date(new Date(acceptedOfferDetails.proposedDeliveryDate).setDate(new Date(acceptedOfferDetails.proposedDeliveryDate).getDate() + 3)).toLocaleDateString()} (включно)</p>
                    <p><strong>Пропонована дата доставки товару/послуги:</strong> {new Date(acceptedOfferDetails.proposedDeliveryDate).toLocaleDateString()}</p>
                    <p style={{color:"red"}}>Увага! Ви зобов'язані сплатити суму: ${acceptedOfferDetails.proposedPrice},  до зазначнего дедлайну: {new Date(new Date(acceptedOfferDetails.proposedDeliveryDate).setDate(new Date(acceptedOfferDetails.proposedDeliveryDate).getDate() + 3)).toLocaleDateString()} (включно) </p>
                    <div className={classes.offerActions} style={{ marginTop: '1.5em', justifyContent: 'center' }}>
                       
                        <button 
                            className={classes.detailsButton} // Використовуй або створи схожий стиль
                            onClick={handleViewContract}
                            title="Сформувати та переглянути договір"
                            style={{ paddingLeft:"0.5em", paddingRight:"0.5em"}}
                        >
                           <FaFilePdf style={{marginRight: '5px', background:"#2070d1"}} /> Переглянути Договір
                        </button>
                    </div>
                </div>
            </div>
        )}
        {/* --------------------------------------------------------------------------- */}

    </div>
);

}
export default CustomerOffersPage;
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import classes from '../customer/Universal.module.css';
import { GoPaperclip } from "react-icons/go";
import { IoCloseCircleOutline } from "react-icons/io5"; // Для кнопки закриття модального вікна

const BACKEND_BASE_URL = 'https://localhost:7078'; 

function OfferCreationPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const procurementId = location.state?.procurementId;

    const [proposedPrice, setProposedPrice] = useState('');
    const [message, setMessage] = useState('');
    const [offerDocument, setOfferDocument] = useState(null);
    
    const [supplierContactPhone, setSupplierContactPhone] = useState('');
    const [proposedDeliveryDate, setProposedDeliveryDate] = useState('');
    const [paymentEdrpou, setPaymentEdrpou] = useState(''); 
    const [paymentIpn, setPaymentIpn] = useState('');      
    const [supplierFullName, setSupplierFullName] = useState('');
    const [supplierIban, setSupplierIban] = useState('');
    const [supplierBankName, setSupplierBankName] = useState('');
    
    const [loading, setLoading] = useState(false); // Використовується для надсилання форми
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    
    const [procurementDetails, setProcurementDetails] = useState(null);
    const [procurementDetailsLoading, setProcurementDetailsLoading] = useState(true);
    const [procurementDetailsError, setProcurementDetailsError] = useState('');
    const [isProcurementOpen, setIsProcurementOpen] = useState(false);

    // --- СТАН ДЛЯ МОДАЛЬНОГО ВІКНА ПІДТВЕРДЖЕННЯ НАДСИЛАННЯ ПРОПОЗИЦІЇ ---
    const [isSubmitConfirmModalOpen, setIsSubmitConfirmModalOpen] = useState(false);
    const [submitConfirmCheckbox, setSubmitConfirmCheckbox] = useState(false);
    // -----------------------------------------------------------------

    const translateStatus = (status) => {
        if (!status) return 'Невідомо';
        switch (status.toLowerCase()) {
            case 'open': return 'Активна';
            case 'fulfilled': return 'Завершена';
            case 'closed': return 'Закрита';
            case 'overdue': return 'Протермінована';
            default: return status;
        }
    };

    const fetchProcurementDetails = async () => {
        if (!procurementId) {
            setError('ID закупівлі не знайдено. Будь ласка, перейдіть зі списку закупівель.');
            setProcurementDetailsLoading(false);
            setProcurementDetailsError('N/A (ID Missing)');
            setIsProcurementOpen(false);
            return;
        }
        setProcurementDetailsLoading(true); // Встановлюємо перед запитом
        try {
            const jwtToken = localStorage.getItem('jwtToken');
            const headers = jwtToken ? { 'Authorization': `Bearer ${jwtToken}` } : {};
            const response = await axios.get(`${BACKEND_BASE_URL}/api/procurements/${procurementId}`, { headers });
            setProcurementDetails(response.data);
            setIsProcurementOpen(response.data.status && response.data.status.toLowerCase() === 'open');
        } catch (err) {
            console.error('Помилка завантаження деталей закупівлі:', err.response ? err.response.data : err.message);
            setError('Не вдалося завантажити деталі закупівлі. Перевірте ID.');
            setProcurementDetailsError(`ID закупівлі: ${procurementId} (Помилка завантаження)`);
            setIsProcurementOpen(false);
        } finally {
            setProcurementDetailsLoading(false);
        }
    };

    useEffect(() => {
        fetchProcurementDetails();
    }, [procurementId]);

    const handleChange = (e) => {
        const { name, value, type, files } = e.target;
        setError(''); // Скидаємо помилки при будь-якій зміні
        setSuccessMessage('');

        if (type === 'file') {
            setOfferDocument(files[0]);
        } else if (name === 'proposedPrice') {
            setProposedPrice(value);
        } else if (name === 'message') {
            setMessage(value);
        } else if (name === 'supplierContactPhone') {
            setSupplierContactPhone(value);
        } else if (name === 'proposedDeliveryDate') {
            setProposedDeliveryDate(value);
        } else if (name === 'paymentEdrpou') {
            setPaymentEdrpou(value);
        } else if (name === 'paymentIpn') {
            setPaymentIpn(value);
        } else if (name === 'supplierFullName') {
            setSupplierFullName(value);
        } else if (name === 'supplierIban') {
            setSupplierIban(value.toUpperCase());
        } else if (name === 'supplierBankName') {
            setSupplierBankName(value);
        }
    };

    // --- ФУНКЦІЯ, ЯКА ВИКЛИКАЄТЬСЯ ПРИ НАТИСКАННІ КНОПКИ "Надіслати пропозицію" ---
    const handleOpenSubmitConfirmModal = (e) => {
        e.preventDefault(); // Запобігаємо стандартній відправці форми
        setError('');
        setSuccessMessage('');

        // Валідація перед відкриттям модального вікна
        if (!isProcurementOpen) {
            setError(`Ви не можете подати пропозицію на цю закупівлю, оскільки вона має статус "${procurementDetails ? translateStatus(procurementDetails.status) : 'Неактивна'}".`);
            return;
        }
        if (!proposedPrice || parseFloat(proposedPrice) <= 0) {
            setError('Будь ласка, введіть дійсну запропоновану ціну (більше 0).');
            return;
        }
        if (!supplierContactPhone) {
            setError('Будь ласка, вкажіть ваш контактний номер телефону.');
            return;
        }
        if (!proposedDeliveryDate) {
             setError('Будь ласка, вкажіть бажану дату доставки.');
             return;
        }
        if (!supplierFullName) {
            setError('Будь ласка, вкажіть повне найменування вашого ФОП або юридичної особи.');
            return;
        }
        if (!supplierIban) {
            setError('Будь ласка, вкажіть номер рахунку в форматі IBAN.');
            return;
        }
        if (!supplierBankName) {
            setError('Будь ласка, вкажіть назву вашого банку.');
            return;
        }
        if (!paymentEdrpou) {
            setError('Будь ласка, вкажіть ваш ЄДРПОУ або РНОКПП.');
            return;
        }
        if (!procurementId) {
            setError('ID закупівлі відсутній. Неможливо створити пропозицію.');
            return;
        }
        // Якщо вся валідація пройшла, відкриваємо модальне вікно
        setSubmitConfirmCheckbox(false); // Скидаємо чекбокс
        setIsSubmitConfirmModalOpen(true);
    };

    const closeSubmitConfirmModal = () => {
        setIsSubmitConfirmModalOpen(false);
    };

    // --- ФУНКЦІЯ, ЯКА ВИКОНУЄ ФАКТИЧНЕ НАДСИЛАННЯ ПРОПОЗИЦІЇ ПІСЛЯ ПІДТВЕРДЖЕННЯ В МОДАЛЦІ ---
    const handleSubmitOfferConfirmed = async () => {
        if (!submitConfirmCheckbox) {
            alert("Будь ласка, підтвердіть вашу згоду, поставивши галочку.");
            return;
        }
        closeSubmitConfirmModal(); // Закриваємо модалку підтвердження

        setLoading(true); // Вмикаємо індикатор завантаження для надсилання
        setError('');
        setSuccessMessage('');

        const formData = new FormData();
        formData.append('ProcurementId', procurementId);
        formData.append('ProposedPrice', proposedPrice);
        if (message) formData.append('Message', message);
        if (offerDocument) formData.append('OfferDocument', offerDocument);
        formData.append('SupplierContactPhone', supplierContactPhone);
        formData.append('ProposedDeliveryDate', proposedDeliveryDate);
        if (paymentEdrpou) formData.append('PaymentEdrpou', paymentEdrpou);
        if (paymentIpn) formData.append('PaymentIpn', paymentIpn);
        formData.append('SupplierFullName', supplierFullName);
        formData.append('SupplierIban', supplierIban);
        formData.append('SupplierBankName', supplierBankName);

        const jwtToken = localStorage.getItem('jwtToken');
        if (!jwtToken) {
            setError('Ви не авторизовані. Будь ласка, увійдіть.');
            setLoading(false);
            navigate('/form');
            return;
        }

        try {
            const response = await axios.post(`${BACKEND_BASE_URL}/api/offers`, formData, {
                headers: { 'Authorization': `Bearer ${jwtToken}` }
            });

            setSuccessMessage(response.data.message || 'Пропозицію успішно надіслано!');
            // Скидаємо всі поля форми
            setProposedPrice('');
            setMessage('');
            setOfferDocument(null);
            setSupplierContactPhone('');
            setProposedDeliveryDate('');
            setPaymentEdrpou('');
            setPaymentIpn('');
            setSupplierFullName('');
            setSupplierIban('');
            setSupplierBankName('');
            if(document.getElementById('offerDocumentFile')) { // Перевірка наявності елемента
                document.getElementById('offerDocumentFile').value = null;
            }
            // Можна додати перенаправлення або оновлення деталей закупівлі, якщо потрібно
            // await fetchProcurementDetails(); // Якщо потрібно оновити статус закупівлі, наприклад
        } catch (err) {
            console.error('Помилка при подачі пропозиції:', err.response ? err.response.data : err.message);
            let errorMessage = 'Не вдалося подати пропозицію. Спробуйте пізніше.';
            if (err.response) {
                if (err.response.status === 401) {
                    errorMessage = 'Ви не авторизовані або ваша сесія закінчилася. Будь ласка, увійдіть знову.';
                    localStorage.removeItem('jwtToken');
                    navigate('/form');
                } else if (err.response.data && err.response.data.errors) {
                    errorMessage = Object.values(err.response.data.errors).flat().join('<br/>');
                } else if (err.response.data && err.response.data.message) {
                    errorMessage = err.response.data.message;
                } else if (err.response.status === 403) {
                    errorMessage = 'У вас немає дозволу на створення пропозицій. Це можуть робити лише постачальники.';
                } else if (typeof err.response.data === 'string') {
                    errorMessage = err.response.data;
                }
            }
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className={classes.universal}>
            {/* Блок деталей закупівлі */}
            <div className={classes.block}>
                <h1 className={`${classes.label} ${classes.labelBlue}`}>
                    Створити пропозицію для закупівлі: <br/> "{procurementDetails ? procurementDetails.name : 'Завантаження...'}"
                </h1>
            </div>
            <div className={classes.block}>
                {procurementDetailsLoading ? ( <p>Завантаження деталей закупівлі...</p> )
                : procurementDetailsError ? ( <p style={{ color: 'red' }}>{procurementDetailsError}</p> )
                : procurementDetails ? (
                    <div className={classes.procurementDetailsCard}>
                        <h2>Деталі закупівлі:</h2>
                        <p><strong>Назва:</strong> {procurementDetails.name}</p>
                        <p><strong>Категорія:</strong> {procurementDetails.category}</p>
                        <p><strong>Опис:</strong> {procurementDetails.description || 'Не вказано'}</p>
                        <p><strong>Кількість/Обсяг:</strong> {procurementDetails.quantityOrVolume}</p>
                        <p><strong>Орієнтовний бюджет:</strong> ${procurementDetails.estimatedBudget}</p>
                        <p><strong>Дата завершення:</strong> {new Date(procurementDetails.completionDate).toLocaleDateString()}</p>
                        {procurementDetails.deliveryAddress && <p><strong>Адреса доставки замовника:</strong> {procurementDetails.deliveryAddress}</p>}
                        {procurementDetails.contactPhone && <p><strong>Телефон замовника:</strong> {procurementDetails.contactPhone}</p>}
                        {procurementDetails.documentPaths && (
                            <p><strong>Документ:  </strong> <a href={`${BACKEND_BASE_URL}${procurementDetails.documentPaths}`} target="_blank" rel="noopener noreferrer">Переглянути</a></p>
                        )}
                        <p><strong>Створено:</strong> {new Date(procurementDetails.createdAt).toLocaleDateString()}</p>
                        <p><strong>Статус закупівлі:  </strong>
                            <span style={{ fontWeight: 'bold', color: procurementDetails.status && procurementDetails.status.toLowerCase() === 'open' ? 'green' : procurementDetails.status && procurementDetails.status.toLowerCase() === 'fulfilled' ? 'blue' : 'red' }}>
                                {translateStatus(procurementDetails.status)}
                            </span>
                        </p>
                    </div>
                ) : null}
                {!isProcurementOpen && !procurementDetailsLoading && procurementDetails && ( // Показуємо тільки якщо деталі завантажені, але закупівля не відкрита
                    <p style={{ color: 'red', fontWeight: 'bold', marginTop: '1.5em' }}>
                        Ця закупівля має статус "{translateStatus(procurementDetails.status)}", тому пропозиції на неї не приймаються.
                    </p>
                )}
            </div>

            {/* Форма створення пропозиції */}
            <div className={classes.block}>
                {/* Змінено onSubmit форми на handleOpenSubmitConfirmModal */}
                <form onSubmit={handleOpenSubmitConfirmModal} className={classes.form} style={{background:"white"}}>
                    <h2 style={{background:"white", marginBottom:"0.8em"}}>Заповніть форму пропозиції:</h2>
                    
                    <label htmlFor="proposedPrice">Запропонована ціна ($): </label>
                    <input type="number" id="proposedPrice" name="proposedPrice" value={proposedPrice} onChange={handleChange} placeholder="Введіть ціну" min="0.01" step="0.01" required className={classes.inputField} disabled={loading || !isProcurementOpen} />
                    <br/>

                    <label htmlFor="supplierContactPhone">Ваш контактний телефон: </label>
                    <input type="tel" id="supplierContactPhone" name="supplierContactPhone" value={supplierContactPhone} onChange={handleChange} placeholder="+380 XX XXX XX XX" required className={classes.inputField} disabled={loading || !isProcurementOpen} />
                    <br/>

                    <label htmlFor="proposedDeliveryDate">Пропонована дата доставки: </label>
                    <input type="date" id="proposedDeliveryDate" name="proposedDeliveryDate" value={proposedDeliveryDate} onChange={handleChange} required className={classes.inputField} disabled={loading || !isProcurementOpen} min={new Date().toISOString().split('T')[0]} />
                    <br/>

                    <h3 style={{background:"white", marginTop:"1.5em", marginBottom:"0.5em"}}>Реквізити для оплати:</h3>
                    
                    <label htmlFor="supplierFullName">Повне найменування (ФОП/ТОВ): </label>
                    <input type="text" id="supplierFullName"  style={{width:"63%"}} name="supplierFullName" value={supplierFullName} onChange={handleChange} placeholder="Наприклад, ФОП Іванов Іван Іванович" required className={classes.inputField} disabled={loading || !isProcurementOpen} />
                    <br/>

                    <label htmlFor="paymentEdrpou">ЄДРПОУ/РНОКПП: </label>
                    <input type="text" id="paymentEdrpou" name="paymentEdrpou" value={paymentEdrpou} onChange={handleChange} placeholder="Ваш ЄДРПОУ або РНОКПП" required className={classes.inputField} disabled={loading || !isProcurementOpen} style={{width:"78%"}}/>
                    <br/>

                    <label htmlFor="supplierIban">Номер рахунку (IBAN): </label>
                    <input type="text" style={{width:"74%"}} id="supplierIban" name="supplierIban" value={supplierIban} onChange={handleChange} placeholder="UAXXXXXXXXXXXXXXXXXXXXXXXXX" required className={classes.inputField} disabled={loading || !isProcurementOpen} />
                    <br/>

                    <label htmlFor="supplierBankName">Назва банку: </label>
                    <input type="text" style={{width:"83.5%"}} id="supplierBankName" name="supplierBankName" value={supplierBankName} onChange={handleChange} placeholder="Наприклад, АТ КБ «ПриватБанк»" required className={classes.inputField} disabled={loading || !isProcurementOpen} />
                    <br/>

                    <label htmlFor="paymentIpn">ІПН : </label>
                    <input type="text" id="paymentIpn" name="paymentIpn" value={paymentIpn} onChange={handleChange} placeholder="Ваш ІПН (для платників ПДВ)" className={classes.inputField} disabled={loading || !isProcurementOpen} style={{width:"91%"}} required />
                    <br/>
                    
                    <label htmlFor="message">Ваше повідомлення: </label>
                    <textarea id="message" name="message" value={message} onChange={handleChange} placeholder="Додайте деталі до вашої пропозиції..." rows="5" className={classes.textareaField} disabled={loading || !isProcurementOpen}></textarea>
                    <br/>

                    <label>Допоміжний документ: </label>
                    <label htmlFor="offerDocumentFile" className={classes.styledFile} style={{ opacity: (loading || !isProcurementOpen) ? 0.6 : 1, cursor: (loading || !isProcurementOpen) ? 'not-allowed' : 'pointer' , display:"inline-block"}}>
                        <GoPaperclip className={classes.icon} /> 
                    </label>
                    <input type="file" id="offerDocumentFile" name="offerDocument" onChange={handleChange} style={{ display: "none" }} disabled={loading || !isProcurementOpen} />
                    
                    {/* Кнопка тепер викликає handleOpenSubmitConfirmModal */}
                    <button type="submit" style={{width:"33em", marginLeft:"10em"}} className={classes.submitButton} disabled={loading || !isProcurementOpen} >
                        {loading ? 'Обробка...' : 'Надіслати пропозицію'}
                    </button>
                    {offerDocument && <p>Обраний файл: {offerDocument.name}</p>}
                </form>

                {error && <p style={{ color: 'red', marginTop: '1em' }} dangerouslySetInnerHTML={{ __html: error }}></p>}
                {successMessage && <p style={{ color: 'green', marginTop: '1em' }}>{successMessage}</p>}
            </div>

            {/* --- МОДАЛЬНЕ ВІКНО ПІДТВЕРДЖЕННЯ НАДСИЛАННЯ ПРОПОЗИЦІЇ --- */}
            {isSubmitConfirmModalOpen && (
                <div className={classes.modalOverlay} onClick={closeSubmitConfirmModal}>
                    <div className={classes.modalContent} onClick={e => e.stopPropagation()}>
                        <button className={classes.modalCloseButton} onClick={closeSubmitConfirmModal}>
                            <IoCloseCircleOutline className={classes.cancelOutline} size={30} />
                        </button>
                        <h3 className={classes.modalTitle}>Підтвердження пропозиції</h3>
                        <p>
                            Підтверджуючи, ви зобов'язуєтесь доставити товар (або надати послугу) 
                            в зазначеному замовником обсязі "{procurementDetails?.name || 'обраної закупівлі'}" 
                            до <strong>{proposedDeliveryDate ? new Date(proposedDeliveryDate).toLocaleDateString() : 'вказаної дати'}</strong> включно, 
                            у належній якості, в разі якщо замовник прийме вашу пропозицію.
                        </p>
                        <div style={{ marginTop: '1em', marginBottom: '1em', background:"white" }}>
                            <input 
                                type="checkbox" 
                                id="submitOfferConfirmCheckbox" 
                                checked={submitConfirmCheckbox}
                                onChange={(e) => setSubmitConfirmCheckbox(e.target.checked)}
                                style={{ all: 'revert', marginRight: '5px' }} // Повертаємо стандартний вигляд чекбокса
                            />
                            <label htmlFor="submitOfferConfirmCheckbox">
                                Я підтверджую свої зобов'язання.
                            </label>
                        </div>
                        <button 
                            className={`${classes.submitButton} ${classes.acceptButton}`} // Можна використовувати ті ж стилі, що і для прийняття
                            onClick={handleSubmitOfferConfirmed}
                            disabled={!submitConfirmCheckbox || loading} // Використовуємо loading
                            style={{marginRight: '10px'}}
                        >
                            {loading ? 'Надсилання...' : 'Надіслати '}
                        </button>
                        <button 
                            className={`${classes.submitButton} ${classes.rejectButton}`} // Можна використовувати ті ж стилі, що і для відхилення
                            onClick={closeSubmitConfirmModal}
                            disabled={loading}
                        >
                            Скасувати
                        </button>
                    </div>
                </div>
            )}
            {/* --------------------------------------------------------------------- */}
        </div>
    );
}

export default OfferCreationPage;
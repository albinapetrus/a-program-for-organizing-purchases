import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import classes from '../customer/Universal.module.css'; // Припускаємо, що шлях правильний
import { GoPaperclip } from "react-icons/go";

const BACKEND_BASE_URL = 'https://localhost:7078'; 

function OfferCreationPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const procurementId = location.state?.procurementId;

    // --- ІСНУЮЧІ СТАНИ ---
    const [proposedPrice, setProposedPrice] = useState('');
    const [message, setMessage] = useState('');
    const [offerDocument, setOfferDocument] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [procurementDetails, setProcurementDetails] = useState(null);
    const [procurementDetailsLoading, setProcurementDetailsLoading] = useState(true);
    const [procurementDetailsError, setProcurementDetailsError] = useState('');
    const [isProcurementOpen, setIsProcurementOpen] = useState(false);

    // --- ПОПЕРЕДНІ НОВІ СТАНИ ---
    const [supplierContactPhone, setSupplierContactPhone] = useState('');
    const [proposedDeliveryDate, setProposedDeliveryDate] = useState('');
    const [paymentEdrpou, setPaymentEdrpou] = useState(''); 
    const [paymentIpn, setPaymentIpn] = useState('');      
    
    // --- ДОДАЄМО ЩЕ НОВІ СТАНИ ДЛЯ РЕКВІЗИТІВ ---
    const [supplierFullName, setSupplierFullName] = useState(''); // Повне найменування ФОП/ТОВ
    const [supplierIban, setSupplierIban] = useState('');         // Номер рахунку в форматі IBAN
    const [supplierBankName, setSupplierBankName] = useState(''); // Назва банку
    // ---------------------------------------------

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
            setError('Procurement ID not found. Please navigate from a procurement listing.');
            setProcurementDetailsLoading(false);
            setProcurementDetailsError('N/A (ID Missing)');
            setIsProcurementOpen(false);
            return;
        }
        try {
            const jwtToken = localStorage.getItem('jwtToken');
            const headers = jwtToken ? { 'Authorization': `Bearer ${jwtToken}` } : {};
            const response = await axios.get(`${BACKEND_BASE_URL}/api/procurements/${procurementId}`, { headers });
            setProcurementDetails(response.data);
            setIsProcurementOpen(response.data.status && response.data.status.toLowerCase() === 'open');
            setProcurementDetailsLoading(false);
        } catch (err) {
            console.error('Error loading procurement details:', err.response ? err.response.data : err.message);
            setError('Failed to load procurement details. Please check the ID.');
            setProcurementDetailsError(`Procurement ID: ${procurementId} (Error loading)`);
            setIsProcurementOpen(false);
            setProcurementDetailsLoading(false);
        }
    };

    useEffect(() => {
        fetchProcurementDetails();
    }, [procurementId]);

    const handleChange = (e) => {
        const { name, value, type, files } = e.target;
        setError('');
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
        }
        // --- ОБРОБКА ЗМІН ДЛЯ ДОДАТКОВИХ РЕКВІЗИТІВ ---
        else if (name === 'supplierFullName') {
            setSupplierFullName(value);
        } else if (name === 'supplierIban') {
            setSupplierIban(value.toUpperCase()); // IBAN зазвичай у верхньому регістрі
        } else if (name === 'supplierBankName') {
            setSupplierBankName(value);
        }
        // ---------------------------------------------
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccessMessage('');

        if (!isProcurementOpen) {
            setError(`Ви не можете подати пропозицію на цю закупівлю, оскільки вона має статус "${procurementDetails ? translateStatus(procurementDetails.status) : 'Неактивна'}".`);
            setLoading(false);
            return;
        }
        if (!proposedPrice || parseFloat(proposedPrice) <= 0) {
            setError('Будь ласка, введіть дійсну запропоновану ціну (більше 0).');
            setLoading(false);
            return;
        }
        if (!supplierContactPhone) {
            setError('Будь ласка, вкажіть ваш контактний номер телефону.');
            setLoading(false);
            return;
        }
        if (!proposedDeliveryDate) {
             setError('Будь ласка, вкажіть бажану дату доставки.');
             setLoading(false);
             return;
        }
        // --- ВАЛІДАЦІЯ ДЛЯ ДОДАТКОВИХ РЕКВІЗИТІВ (зробимо їх обов'язковими для прикладу) ---
        if (!supplierFullName) {
            setError('Будь ласка, вкажіть повне найменування вашого ФОП або юридичної особи.');
            setLoading(false);
            return;
        }
        if (!supplierIban) {
            setError('Будь ласка, вкажіть номер рахунку в форматі IBAN.');
            setLoading(false);
            return;
        }
        if (!supplierBankName) {
            setError('Будь ласка, вкажіть назву вашого банку.');
            setLoading(false);
            return;
        }
        if (!paymentEdrpou) { // Зробимо ЄДРПОУ/РНОКПП також обов'язковим
            setError('Будь ласка, вкажіть ваш ЄДРПОУ або РНОКПП.');
            setLoading(false);
            return;
        }
        // ІПН може бути необов'язковим
        // ---------------------------------------------------------------------------

        if (!procurementId) {
            setError('ID закупівлі відсутній. Неможливо створити пропозицію. Будь ласка, поверніться до списку закупівель.');
            setLoading(false);
            return;
        }

        const formData = new FormData();
        formData.append('ProcurementId', procurementId);
        formData.append('ProposedPrice', proposedPrice);
        if (message) formData.append('Message', message);
        if (offerDocument) formData.append('OfferDocument', offerDocument);
        formData.append('SupplierContactPhone', supplierContactPhone);
        formData.append('ProposedDeliveryDate', proposedDeliveryDate);
        if (paymentEdrpou) formData.append('PaymentEdrpou', paymentEdrpou);
        if (paymentIpn) formData.append('PaymentIpn', paymentIpn);

        // --- ДОДАЄМО ДОДАТКОВІ РЕКВІЗИТИ ДО FORMDATA ---
        formData.append('SupplierFullName', supplierFullName);
        formData.append('SupplierIban', supplierIban);
        formData.append('SupplierBankName', supplierBankName);
        // -----------------------------------------------

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
            setProposedPrice('');
            setMessage('');
            setOfferDocument(null);
            setSupplierContactPhone('');
            setProposedDeliveryDate('');
            setPaymentEdrpou('');
            setPaymentIpn('');
            setSupplierFullName(''); // Скидаємо нові поля
            setSupplierIban('');
            setSupplierBankName('');
            document.getElementById('offerDocumentFile').value = null;

            await fetchProcurementDetails();
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
                {!isProcurementOpen && !procurementDetailsLoading && !procurementDetailsError && (
                    <p style={{ color: 'red', fontWeight: 'bold', marginTop: '1.5em' }}>
                        Ця закупівля {procurementDetails ? `має статус "${translateStatus(procurementDetails.status)}"` : 'більше не активна'}, тому пропозиції на неї не приймаються.
                    </p>
                )}
            </div>

            <div className={classes.block}>
                <form onSubmit={handleSubmit} className={classes.form} style={{background:"white"}}>
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

                    {/* --- РОЗДІЛ РЕКВІЗИТІВ ДЛЯ ОПЛАТИ --- */}
                    <h3 style={{background:"white", marginTop:"1.5em", marginBottom:"0.5em"}}>Реквізити для оплати:</h3>
                    
                    <label htmlFor="supplierFullName">Повне найменування (ФОП/ТОВ): </label>
                    <input type="text" id="supplierFullName"  style={{width:"63%"}} name="supplierFullName" value={supplierFullName} onChange={handleChange} placeholder="Наприклад, ФОП Іванов Іван Іванович" required className={classes.inputField} disabled={loading || !isProcurementOpen} />
                    <br/>

                    <label htmlFor="paymentEdrpou">ЄДРПОУ/РНОКПП: </label>
                    <input type="text" id="paymentEdrpou" name="paymentEdrpou" value={paymentEdrpou} onChange={handleChange} placeholder="Ваш ЄДРПОУ або РНОКПП" required className={classes.inputField} disabled={loading || !isProcurementOpen} 
                        style={{width:"78%"}} // Закоментував, щоб інпут був на всю ширину
                    />
                    <br/>

                    <label htmlFor="supplierIban">Номер рахунку (IBAN): </label>
                    <input type="text" style={{width:"74%"}} id="supplierIban" name="supplierIban" value={supplierIban} onChange={handleChange} placeholder="UAXXXXXXXXXXXXXXXXXXXXXXXXX" required className={classes.inputField} disabled={loading || !isProcurementOpen} />
                    <br/>

                    <label htmlFor="supplierBankName">Назва банку: </label>
                    <input type="text" style={{width:"83.5%"}} id="supplierBankName" name="supplierBankName" value={supplierBankName} onChange={handleChange} placeholder="Наприклад, АТ КБ «ПриватБанк»" required className={classes.inputField} disabled={loading || !isProcurementOpen} />
                    <br/>

                    <label htmlFor="paymentIpn">ІПН : </label>
                    <input type="text" id="paymentIpn" name="paymentIpn" value={paymentIpn} onChange={handleChange} placeholder="Ваш ІПН (для платників ПДВ)" className={classes.inputField} disabled={loading || !isProcurementOpen} 
                        style={{width:"91%"}} required
                    />
                    <br/>
                    {/* --------------------------------------- */}

                    <label htmlFor="message">Ваше повідомлення: </label>
                    <textarea id="message" name="message" value={message} onChange={handleChange} placeholder="Додайте деталі до вашої пропозиції..." rows="5" className={classes.textareaField} disabled={loading || !isProcurementOpen}></textarea>
                    <br/>

                    <label>Допоміжний документ: </label>
                    <label htmlFor="offerDocumentFile" className={classes.styledFile} style={{ opacity: (loading || !isProcurementOpen) ? 0.6 : 1, cursor: (loading || !isProcurementOpen) ? 'not-allowed' : 'pointer' , display:"inline-block"}}>
                        <GoPaperclip className={classes.icon} /> 
                    </label>
                    <input type="file" id="offerDocumentFile" name="offerDocument" onChange={handleChange} style={{ display: "none" }} disabled={loading || !isProcurementOpen} />
                    
                    <button type="submit" style={{width:"33em", marginLeft:"10em"}} className={classes.submitButton} disabled={loading || !isProcurementOpen} >
                        {loading ? 'Надсилання...' : 'Надіслати пропозицію'}
                    </button>
                    {offerDocument && <p>Обраний файл: {offerDocument.name}</p>}
                </form>

                {error && <p style={{ color: 'red', marginTop: '1em' }} dangerouslySetInnerHTML={{ __html: error }}></p>}
                {successMessage && <p style={{ color: 'green', marginTop: '1em' }}>{successMessage}</p>}
            </div>
        </div>
    );
}

export default OfferCreationPage;
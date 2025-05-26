import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import classes from '../customer/Universal.module.css'; // Assuming Universal.module.css for styling
import { GoPaperclip } from "react-icons/go"; // Icon for file attachment

function OfferCreationPage() {
    const location = useLocation();
    const navigate = useNavigate();

    const procurementId = location.state?.procurementId;

    console.log('OfferCreationPage: location.state', location.state);
    console.log('OfferCreationPage: procurementId received', procurementId);

    const [proposedPrice, setProposedPrice] = useState('');
    const [message, setMessage] = useState('');
    const [offerDocument, setOfferDocument] = useState(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const [procurementDetails, setProcurementDetails] = useState(null);
    const [procurementDetailsLoading, setProcurementDetailsLoading] = useState(true);
    const [procurementDetailsError, setProcurementDetailsError] = useState('');
    const [isProcurementOpen, setIsProcurementOpen] = useState(false); // New state for procurement status

    // Функція для перекладу статусу на українську (нова функція)
    const translateStatus = (status) => {
        if (!status) return 'Невідомо';
        switch (status.toLowerCase()) {
            case 'open':
                return 'Активна';
            case 'fulfilled':
                return 'Завершена';
            case 'closed':
                return 'Закрита';
            case 'overdue': // Додано для повноти, хоча тут може і не зустрічатись
                return 'Протермінована';
            default:
                return status; // Повертаємо оригінал, якщо немає відповідного перекладу
        }
    };

    // Function to fetch procurement details
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

            const response = await axios.get(`/api/procurements/${procurementId}`, { headers });
            setProcurementDetails(response.data);
            // Check if the procurement status is 'Open'
            setIsProcurementOpen(response.data.status === 'Open');
            setProcurementDetailsLoading(false);
        } catch (err) {
            console.error('Error loading procurement details:', err.response ? err.response.data : err.message);
            setError('Failed to load procurement details. Please check the ID.');
            setProcurementDetailsError(`Procurement ID: ${procurementId} (Error loading)`);
            setIsProcurementOpen(false);
            setProcurementDetailsLoading(false);
        }
    };

    // Effect to fetch procurement details on component mount or procurementId change
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
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccessMessage('');

        if (!isProcurementOpen) {
            // Використовуємо перекладений статус тут
            setError(`Ви не можете подати пропозицію на цю закупівлю, оскільки вона має статус "${procurementDetails ? translateStatus(procurementDetails.status) : 'Неактивна'}".`);
            setLoading(false);
            return;
        }

        if (!proposedPrice || parseFloat(proposedPrice) <= 0) {
            setError('Будь ласка, введіть дійсну запропоновану ціну (більше 0).');
            setLoading(false);
            return;
        }

        if (!procurementId) {
            setError('ID закупівлі відсутній. Неможливо створити пропозицію. Будь ласка, поверніться до списку закупівель.');
            setLoading(false);
            return;
        }

        const formData = new FormData();
        formData.append('ProcurementId', procurementId);
        formData.append('ProposedPrice', proposedPrice);
        if (message) {
            formData.append('Message', message);
        }
        if (offerDocument) {
            formData.append('OfferDocument', offerDocument);
        }

        const jwtToken = localStorage.getItem('jwtToken');
        if (!jwtToken) {
            setError('Ви не авторизовані. Будь ласка, увійдіть.');
            setLoading(false);
            navigate('/form');
            return;
        }

        try {
            const response = await axios.post('/api/offers', formData, {
                headers: {
                    'Authorization': `Bearer ${jwtToken}`,
                }
            });

            setSuccessMessage(response.data.message || 'Пропозицію успішно надіслано!');
            setProposedPrice('');
            setMessage('');
            setOfferDocument(null);
            await fetchProcurementDetails(); // This will re-evaluate isProcurementOpen
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
                {/* Display procurement details */}
                {procurementDetailsLoading ? (
                    <p>Завантаження деталей закупівлі...</p>
                ) : procurementDetailsError ? (
                    <p style={{ color: 'red' }}>{procurementDetailsError}</p>
                ) : procurementDetails ? (
                    <div className={classes.procurementDetailsCard}>
                        <h2>Деталі закупівлі:</h2>
                        <p><strong>Назва:</strong> {procurementDetails.name}</p>
                        <p><strong>Категорія:</strong> {procurementDetails.category}</p>
                        <p><strong>Опис:</strong> {procurementDetails.description || 'Не вказано'}</p>
                        <p><strong>Кількість/Обсяг:</strong> {procurementDetails.quantityOrVolume}</p>
                        <p><strong>Орієнтовний бюджет:</strong> ${procurementDetails.estimatedBudget}</p>
                        <p><strong>Дата завершення:</strong> {new Date(procurementDetails.completionDate).toLocaleDateString()}</p>
                        {procurementDetails.documentPaths && (
                            <p>
                                <strong>Документ:</strong> <a href={procurementDetails.documentPaths} target="_blank" rel="noopener noreferrer">Переглянути</a>
                            </p>
                        )}
                        <p><strong>Створено:</strong> {new Date(procurementDetails.createdAt).toLocaleDateString()}</p>
                        <p>
                            <strong>Статус закупівлі:  </strong>
                            <span style={{ fontWeight: 'bold', color:
                                procurementDetails.status === 'Open' ? 'green' :
                                procurementDetails.status === 'Fulfilled' ? 'blue' : 'red' // Assuming 'Fulfilled' or 'Closed'
                            }}>
                                {/* Застосовуємо функцію перекладу тут */}
                                {translateStatus(procurementDetails.status)}
                            </span>
                        </p>
                    </div>
                ) : null}

                {/* Offer submission form */}
                {!isProcurementOpen && !procurementDetailsLoading && !procurementDetailsError && (
                    <p style={{ color: 'red', fontWeight: 'bold', marginTop: '1.5em' }}>
                        {/* Використовуємо перекладений статус у повідомленні про неактивну закупівлю */}
                        Ця закупівля {procurementDetails ? `має статус "${translateStatus(procurementDetails.status)}"` : 'більше не активна'}, тому пропозиції на неї не приймаються.
                    </p>
                )}
            </div>
            <div className={classes.block}>
                <form onSubmit={handleSubmit} className={classes.form} style={{background:"white"}}>
                    <h2 style={{background:"white", marginBottom:"0.8em"}}>Заповніть форму:</h2>
                    <label htmlFor="proposedPrice">Запропонована ціна ($): </label>
                    <input
                        type="number"
                        id="proposedPrice"
                        name="proposedPrice"
                        value={proposedPrice}
                        onChange={handleChange}
                        placeholder="Введіть ціну"
                        min="0.01"
                        step="0.01"
                        required
                        className={classes.inputField}
                        disabled={loading || !isProcurementOpen} // Disable if loading or not open
                    />
                    <br/>
                    <label htmlFor="message">Ваше повідомлення: </label>
                    <textarea
                        id="message"
                        name="message"
                        value={message}
                        onChange={handleChange}
                        placeholder="Додайте деталі до вашої пропозиції..."
                        rows="5"
                        className={classes.textareaField}
                        disabled={loading || !isProcurementOpen} // Disable if loading or not open
                    ></textarea>
                    <br/>
                    <label>Допоміжний документ: </label>
                    <label htmlFor="offerDocumentFile" className={classes.styledFile} style={{ opacity: (loading || !isProcurementOpen) ? 0.6 : 1, cursor: (loading || !isProcurementOpen) ? 'not-allowed' : 'pointer' , display:"inline-block"}}>
                        <GoPaperclip className={classes.icon} /> 
                    </label>
                    <input
                        type="file"
                        id="offerDocumentFile"
                        name="offerDocument"
                        onChange={handleChange}
                        style={{ display: "none" }}
                        disabled={loading || !isProcurementOpen} // Disable if loading or not open
                    />
                    
                    <button type="submit" style={{width:"33em", marginLeft:"10em"}} className={classes.submitButton} disabled={loading || !isProcurementOpen} >
                        {loading ? 'Надсилання...' : 'Надіслати пропозицію'}
                    </button>
                    {offerDocument && <p>Обраний файл: {offerDocument.name}</p>}
                </form>

                {/* Display messages (error or success) */}
                {error && <p style={{ color: 'red', marginTop: '1em' }} dangerouslySetInnerHTML={{ __html: error }}></p>}
                {successMessage && <p style={{ color: 'green', marginTop: '1em' }}>{successMessage}</p>}
            </div>
        </div>
    );
}

export default OfferCreationPage;
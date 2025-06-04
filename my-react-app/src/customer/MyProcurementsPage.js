import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import classes from '../customer/Universal.module.css'; 
import { MdOutlineEventNote } from "react-icons/md";

function MyProcurementsPage() {
    const BACKEND_BASE_URL = 'https://localhost:7078'; 
    const [procurements, setProcurements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');
    const navigate = useNavigate();

    const translateStatus = (status) => {
        if (!status) return 'Невідомо';
        switch (status.toLowerCase()) {
            case 'open': return 'Активна';
            case 'fulfilled': return 'Завершена';
            case 'closed': return 'Закрита';
            case 'overdue': return 'Протермінована';
            case 'cancelled': return 'Скасована';
            default: return status;
        }
    };

    const fetchMyProcurements = async () => {
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
            const response = await axios.get(`${BACKEND_BASE_URL}/api/Procurements/my`, {
                headers: { 'Authorization': `Bearer ${jwtToken}` }
            });

            if (response.data && response.data.length > 0) {
                console.log('Перший об\'єкт закупівлі з бекенду:', response.data[0]);
                setProcurements(response.data);
            } else {
                setMessage('Ви ще не створили жодної закупівлі.');
            }
        } catch (err) {
            console.error('Помилка завантаження моїх закупівель:', err.response ? err.response.data : err.message);
            let errorMessage = 'Не вдалося завантажити ваші закупівлі. Спробуйте пізніше.';
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
        fetchMyProcurements();
    }, [navigate]); 

    const handleStatusFilterChange = (event) => {
        setSelectedStatusFilter(event.target.value);
    };

    const handleDeleteProcurement = async (procurementId, procurementName) => {
        console.log('Спроба видалення закупівлі. ID:', procurementId, 'Тип ID:', typeof procurementId, 'Назва:', procurementName);

        if (!procurementId || typeof procurementId !== 'string' || procurementId.length < 30) {
            const errorMsg = `Некоректний або відсутній ID для видалення: '${procurementId}'. Оновіть сторінку та спробуйте знову.`;
            console.error(errorMsg);
            setError(errorMsg);
            setLoading(false); 
            return;
        }

        if (!window.confirm(`Ви впевнені, що хочете видалити закупівлю "${procurementName}"? Це скасує всі пов'язані пропозиції.`)) {
            return;
        }

        setLoading(true);
        setError('');
        setMessage('');
        const jwtToken = localStorage.getItem('jwtToken');

        try {

            const response = await axios.delete(`${BACKEND_BASE_URL}/api/Procurements/${procurementId}`, {
                headers: {
                    'Authorization': `Bearer ${jwtToken}`
                }
            });

            setMessage(response.data.message || 'Закупівлю успішно видалено.');
            fetchMyProcurements(); 
        } catch (err) {
            console.error('Помилка видалення закупівлі:', err.response ? err.response.data : err.message);
            let errorMessage = 'Не вдалося видалити закупівлю. Спробуйте пізніше.';
            if (err.response) {
                if (err.response.status === 401 || err.response.status === 403) {
                    errorMessage = 'У вас немає дозволу на видалення цієї закупівлі або ваша сесія закінчилася.';
                } else if (err.response.status === 404) {
                     errorMessage = `Закупівлю з ID '${procurementId}' не знайдено на сервері. Можливо, її вже видалено або ID передано некоректно.`;
                } else if (err.response.data && err.response.data.message) {
                    errorMessage = err.response.data.message;
                } else if (typeof err.response.data === 'string') {
                    errorMessage = err.response.data;
                }
            }
            setError(errorMessage);
        }

        if (!error && !message) { 
        }
    };

    const filteredProcurements = useMemo(() => {
        if (selectedStatusFilter === 'all') {
            return procurements;
        }
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        return procurements.filter(p => {
            const statusLower = p.status ? p.status.toLowerCase() : ''; 
            const completionDateObj = p.completionDate ? new Date(p.completionDate) : null; 
            const procurementCompletionDate = completionDateObj ? new Date(completionDateObj.getFullYear(), completionDateObj.getMonth(), completionDateObj.getDate()) : null;

            if (selectedStatusFilter === 'overdue') {
                return procurementCompletionDate && procurementCompletionDate < today && statusLower !== 'fulfilled' && statusLower !== 'closed';
            }
            return statusLower === selectedStatusFilter;
        });
    }, [procurements, selectedStatusFilter]);

    const displayMessage = !loading && !error && filteredProcurements.length === 0 && !message
        ? 'Немає закупівель для вибраного статусу.'
        : message;

    return (
        <div className={classes.universal}>
            <div className={classes.block}>
                <h1 className={`${classes.label} ${classes.labelBlue}`}>
                    <MdOutlineEventNote className={classes.icon} /> Мої закупівлі
                </h1>

                <div className={classes.formGroup} style={{ backgroundColor: "white" }}>
                    <label htmlFor="statusFilter" className={classes.label}>Фільтрувати за статусом:</label>
                    <select
                        style={{ marginTop: "1em" }}
                        id="statusFilter"
                        value={selectedStatusFilter}
                        onChange={handleStatusFilterChange}
                        className={classes.selectField}
                        disabled={loading}
                    >
                        <option value="all">Усі мої закупівлі</option>
                        <option value="open">Активні закупівлі</option>
                        <option value="fulfilled">Завершені закупівлі</option>
                        <option value="overdue">Протерміновані закупівлі</option>
                    </select>
                </div>

                {loading ? (
                    <p>Завантаження ваших закупівель...</p>
                ) : error ? (
                    <p style={{ color: 'red', marginTop: '1em' }}>{error}</p>
                ) : displayMessage ? (
                    <p style={{ color: 'blue', marginTop: '1em' }}>{displayMessage}</p>
                ) : (
                    <div className={classes.resultsContainer}>
                        {filteredProcurements.map((procurement) => {
                            const currentProcurementId = procurement.id; 
                            const currentProcurementName = procurement.name; 

                            return (
                                <div key={currentProcurementId || Math.random()} className={classes.procurementCard}> 
                                    <h4>{currentProcurementName}</h4>
                                    <p><strong>Категорія:</strong> {procurement.category}</p>
                                    <p><strong>Опис:</strong> {procurement.description || 'Не вказано'}</p>
                                    <p><strong>Кількість/Обсяг:</strong> {procurement.quantityOrVolume}</p>
                                    <p><strong>Орієнтовний бюджет:</strong> ${procurement.estimatedBudget}</p>
                                    <p><strong>Дата завершення:</strong> {new Date(procurement.completionDate).toLocaleDateString()}</p>
                                    {procurement.deliveryAddress && (<p><strong>Адреса доставки:</strong> {procurement.deliveryAddress}</p>)}
                                    {procurement.contactPhone && (<p><strong>Контактний телефон:</strong> {procurement.contactPhone}</p>)}
                                    {procurement.documentPaths && (<p><strong>Документ: </strong> <a href={`${BACKEND_BASE_URL}${procurement.documentPaths}`} target="_blank" rel="noopener noreferrer">Переглянути</a></p>)}
                                    <p><strong>Створено:</strong> {new Date(procurement.createdAt).toLocaleDateString()}</p>
                                    <p>
                                        <strong>Статус: </strong>
                                        <span style={{
                                            fontWeight: 'bold',
                                            color: procurement.status && procurement.status.toLowerCase() === 'open' ? 'blue' :
                                                   procurement.status && procurement.status.toLowerCase() === 'fulfilled' ? 'green' : 'red'
                                        }}>
                                            {translateStatus(procurement.status)}
                                        </span>
                                    </p>
                                    <div  style={{background: "white", display: 'flex', justifyContent: 'start', gap: "1em", flexWrap: 'wrap'}}>
                                    <Link
                                        to={`/my-procurements/${currentProcurementId}/offers`}
                                        className={classes.respondButtonLink}
                                        style={{ textDecoration: "none", display: "block" }}
                                    >
                                        <button className={classes.respondButton} style={{ padding: "0 0.5em", maxWidth: "30em", display: "block", margin: "0.5em 0" }}>
                                            Переглянути пропозиції
                                        </button>
                                    </Link>

                                    {procurement.status && procurement.status.toLowerCase() !== 'fulfilled' && (
                                        <button
                                            onClick={() => handleDeleteProcurement(currentProcurementId, currentProcurementName)}
                                            className={classes.deleteButton}
                                            style={{
                                                backgroundColor: '#dc3545', color: 'white', padding:"0 0.5em",
                                                border: 'none', borderRadius: '5px', cursor: 'pointer',
                                                marginTop: '0.5em', transition: 'background-color 0.3s ease',
                                            }}
                                        >
                                            Видалити закупівлю
                                        </button>
                                    )}
                                    </div>
                                    <hr />
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

export default MyProcurementsPage;
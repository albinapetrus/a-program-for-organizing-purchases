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

    // Функція для перекладу статусу на українську
    const translateStatus = (status) => {
        if (!status) return 'Невідомо';
        switch (status.toLowerCase()) {
            case 'open':
                return 'Активна';
            case 'fulfilled':
                return 'Завершена';
            case 'closed':
                return 'Закрита';
            case 'overdue':
                return 'Протермінована';
            default:
                return status;
        }
    };

    useEffect(() => {
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
                const response = await axios.get('/api/Procurements/my', {
                    headers: {
                        'Authorization': `Bearer ${jwtToken}`
                    }
                });

                if (response.data && response.data.length > 0) {
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
                    }
                }
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        fetchMyProcurements();
    }, [navigate]);

    const handleStatusFilterChange = (event) => {
        setSelectedStatusFilter(event.target.value);
    };

    const filteredProcurements = useMemo(() => {
        if (selectedStatusFilter === 'all') {
            return procurements;
        }

        const now = new Date();

        return procurements.filter(p => {
            const statusLower = p.status ? p.status.toLowerCase() : '';
            const completionDate = p.completionDate ? new Date(p.completionDate) : null;

            if (selectedStatusFilter === 'overdue') {
                return completionDate && completionDate < now && statusLower !== 'fulfilled' && statusLower !== 'closed';
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

                {/* DROPDOWN FILTER */}
                <div className={classes.formGroup} style={{ backgroundColor: "white" }}>
                    <label htmlFor="statusFilter" className={classes.label}>
                        Фільтрувати за статусом:
                    </label>
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
                        {filteredProcurements.map((procurement) => (
                            <div key={procurement.id} className={classes.procurementCard}>
                                <h4>{procurement.name}</h4>
                                <p><strong>Категорія:</strong> {procurement.category}</p>
                                <p><strong>Опис:</strong> {procurement.description || 'Не вказано'}</p>
                                <p><strong>Кількість/Обсяг:</strong> {procurement.quantityOrVolume}</p>
                                <p><strong>Орієнтовний бюджет:</strong> ${procurement.estimatedBudget}</p>
                                <p><strong>Дата завершення:</strong> {new Date(procurement.completionDate).toLocaleDateString()}</p>
                                {procurement.documentPaths && (
                                    <p>
                                        <strong>Документ: </strong> <a href={`${BACKEND_BASE_URL}${procurement.documentPaths}`} target="_blank" rel="noopener noreferrer">Переглянути</a>
                                    </p>
                                )}
                                <p><strong>Створено:</strong> {new Date(procurement.createdAt).toLocaleDateString()}</p>
                                <p>
                                    <strong>Статус: </strong>
                                    <span style={{ 
                                        fontWeight: 'bold', 
                                        color:
                                            procurement.status && procurement.status.toLowerCase() === 'open' ? 'blue' :
                                            procurement.status && procurement.status.toLowerCase() === 'fulfilled' ? 'green' :
                                            'red'
                                    }}>
                                        {translateStatus(procurement.status)}
                                    </span>
                                </p>
                                {/* The Link component correctly passes the procurement.id to the URL */}
                                <Link
                                    to={`/my-procurements/${procurement.id}/offers`}
                                    className={classes.respondButtonLink}
                                    style={{ 
                                        textDecoration: "none", 
                                        display: "block", // Link тепер є блочним елементом
                                        // width: "30em" // Забрано ширину з Link, щоб кнопка контролювала свою ширину
                                    }}
                                >
                                    <button 
                                        className={classes.respondButton} 
                                        style={{
                                            padding: "0 0.5em", // Додано трохи вертикального padding для кращого вигляду
                                           // Кнопка займатиме всю доступну ширину батьківського Link
                                            maxWidth: "30em", // Обмеження максимальної ширини кнопки
                                            display: "block", // Кнопка є блочним елементом
                                            margin: "0.5em 0" // Центрування кнопки
                                        }}
                                    >
                                        Переглянути пропозиції
                                    </button>
                                </Link>
                                <hr></hr>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default MyProcurementsPage;
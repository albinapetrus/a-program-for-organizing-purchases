import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import classes from '../customer/Universal.module.css'; // Assuming Universal.module.css for styling
import { MdOutlineEventNote } from "react-icons/md"; // Icon for "My Procurements"

function MyProcurementsPage() {
    const [procurements, setProcurements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

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

    return (
        <div className={classes.universal}>
            <div className={classes.block}>
                <h1 className={`${classes.label} ${classes.labelBlue}`}>
                    <MdOutlineEventNote className={classes.icon} /> Мої закупівлі
                </h1>

                {loading ? (
                    <p>Завантаження ваших закупівель...</p>
                ) : error ? (
                    <p style={{ color: 'red', marginTop: '1em' }}>{error}</p>
                ) : message ? (
                    <p style={{ color: 'blue', marginTop: '1em' }}>{message}</p>
                ) : (
                    <div className={classes.resultsContainer}>
                        {procurements.map((procurement) => (
                            <div key={procurement.id} className={classes.procurementCard}>
                                <h3>{procurement.name}</h3>
                                <p><strong>Категорія:</strong> {procurement.category}</p>
                                <p><strong>Опис:</strong> {procurement.description || 'Не вказано'}</p>
                                <p><strong>Кількість/Обсяг:</strong> {procurement.quantityOrVolume}</p>
                                <p><strong>Орієнтовний бюджет:</strong> ${procurement.estimatedBudget}</p>
                                <p><strong>Дата завершення:</strong> {new Date(procurement.completionDate).toLocaleDateString()}</p>
                                {procurement.documentPaths && (
                                    <p>
                                        <strong>Документ:</strong> <a href={procurement.documentPaths} target="_blank" rel="noopener noreferrer">Переглянути</a>
                                    </p>
                                )}
                                <p><strong>Створено:</strong> {new Date(procurement.createdAt).toLocaleDateString()}</p>
                                <p>
                                    <strong>Статус: </strong>
                                    <span style={{ fontWeight: 'bold', color:
                                        procurement.status === 'Open' ? 'green' :
                                        procurement.status === 'Fulfilled' ? 'blue' : 'red'
                                    }}>
                                        {procurement.status}
                                    </span>
                                </p>
                                {/* Link to view offers for this specific procurement */}
                                <Link
                                    to={`/my-procurements/${procurement.id}/offers`}
                                    className={classes.respondButtonLink}
                                >
                                    <button className={classes.respondButton}>Переглянути пропозиції</button>
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

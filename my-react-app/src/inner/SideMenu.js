import { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { IoMdMenu } from 'react-icons/io';
import classes from './SideMenu.module.css';
import { IoHomeOutline } from 'react-icons/io5';
import { CiBookmarkPlus } from 'react-icons/ci';
import { IoIosSearch } from 'react-icons/io';
import { MdOutlineNotifications } from 'react-icons/md';
import { RxExit } from 'react-icons/rx';
import { MdOutlineEventNote } from 'react-icons/md';
import { LuBriefcaseBusiness } from 'react-icons/lu';
import { LuNotebookPen } from 'react-icons/lu';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

import { useAuth } from '../context/AuthContext';

function SideMenu() {
  const [show, setShow] = useState(false);
  const navigate = useNavigate();

  const { logout, user, isAuthenticated, loading } = useAuth();
  const [localUserRole, setLocalUserRole] = useState(user?.role || null);
  const [localCompanyName, setLocalCompanyName] = useState(
    user?.companyName || null
  );
  const [profileLoading, setProfileLoading] = useState(false);

  const toggleMenu = () => setShow(!show);

  const fetchUserProfile = async () => {
    if (!isAuthenticated) {
      setLocalUserRole(null);
      setLocalCompanyName(null);
      return;
    }

    setProfileLoading(true);
    const jwtToken = localStorage.getItem('jwtToken');

    if (!jwtToken) {
      setProfileLoading(false);
      return;
    }

    try {
      const response = await axios.get('/api/users/profile', {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      });

      const userData = response.data;
      setLocalUserRole(userData.role);
      setLocalCompanyName(userData.companyName);
    } catch (error) {
      console.error(
        'Помилка завантаження профілю в SideMenu:',
        error.response ? error.response.data : error.message
      );
      setLocalUserRole(null);
      setLocalCompanyName(null);
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && !loading) {
      fetchUserProfile();
    } else if (!isAuthenticated && !loading) {
      setLocalUserRole(null);
      setLocalCompanyName(null);
    }

    const handleStorageChange = () => {
      if (!loading) {
        fetchUserProfile();
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [isAuthenticated, loading]);

  const handleLogout = () => {
    console.log(
      "Кнопка 'Вийти' натиснута в SideMenu. Викликаю logout з AuthContext."
    );
    logout();
    navigate('/');

    setShow(false);
  };
  if (loading || !isAuthenticated || profileLoading) {
    return null;
  }

  return (
    <>
      <button className={classes.menu_button} onClick={toggleMenu}>
        {show ? '' : <IoMdMenu />}
      </button>

      <div
        className={`offcanvas offcanvas-start ${show ? 'show' : ''}`}
        tabIndex="-1"
        style={{
          visibility: show ? 'visible' : 'hidden',
          backgroundColor: '#fff',
          maxWidth: '260px',
        }}
      >
        <div className="offcanvas-header" style={{ backgroundColor: '#fff' }}>
          <h4
            className="label10"
            style={{
              color: 'orange',
              padding: '0.5em',
              fontWeight: 'bold',
              fontSize: '1.5em',
              background: 'white',
            }}
          >
            UkrainianTrading
          </h4>
          <button
            type="button"
            className="btn-close"
            style={{ fontSize: '0.5em', margin: '0.5em' }}
            onClick={toggleMenu}
          ></button>
        </div>
        <div className="offcanvas-body" style={{ backgroundColor: '#fff' }}>
          {localUserRole === 'supplier' ? (
            <>
              <ul style={{ backgroundColor: '#fff' }} className={classes.list}>
                <li style={{ backgroundColor: '#fff' }}>
                  <p style={{ backgroundColor: '#fff', fontWeight: 'bold' }}>
                    {' '}
                    Назва моєї компанії:{' '}
                    <span style={{ color: '#2070d1', background: ' white' }}>
                      {localCompanyName || 'Не вказано'}
                    </span>
                  </p>
                </li>
                <li style={{ backgroundColor: '#fff' }} className={classes.li}>
                  <Link to="/cabinetCust" style={{ backgroundColor: '#fff' }}>
                    <IoHomeOutline className={classes.icon} />
                    Кабінет
                  </Link>
                </li>
                <li style={{ backgroundColor: '#fff' }} className={classes.li}>
                  <Link to="/myoffers" style={{ backgroundColor: '#fff' }}>
                    <CiBookmarkPlus className={classes.icon} /> Мої заявки
                  </Link>
                </li>
                <li style={{ backgroundColor: '#fff' }} className={classes.li}>
                  <Link
                    to="/ProcurementSearch"
                    style={{ backgroundColor: '#fff' }}
                  >
                    <IoIosSearch className={classes.icon} />
                    Знайти закупівлю
                  </Link>
                </li>
              </ul>
            </>
          ) : localUserRole === 'customer' ? (
            <>
              <ul style={{ backgroundColor: '#fff' }} className={classes.list}>
                <li style={{ backgroundColor: '#fff' }}>
                  <p style={{ backgroundColor: '#fff', fontWeight: 'bold' }}>
                    {' '}
                    Назва моєї компанії:{' '}
                    <span style={{ color: '#2070d1', background: ' white' }}>
                      {localCompanyName || 'Не вказано'}
                    </span>
                  </p>
                </li>
                <li style={{ backgroundColor: '#fff' }} className={classes.li}>
                  <Link to="/cabinetCust" style={{ backgroundColor: '#fff' }}>
                    <IoHomeOutline className={classes.icon} />
                    Кабінет
                  </Link>
                </li>
                <li style={{ backgroundColor: '#fff' }} className={classes.li}>
                  <Link to="/newOne" style={{ backgroundColor: '#fff' }}>
                    <LuNotebookPen className={classes.icon} />
                    Зареєструвати за...
                  </Link>
                </li>
                <li style={{ backgroundColor: '#fff' }} className={classes.li}>
                  <Link
                    to="/myprocurements"
                    style={{ backgroundColor: '#fff' }}
                  >
                    <MdOutlineEventNote className={classes.icon} />
                    Мої закупівлі
                  </Link>
                </li>
                <li style={{ backgroundColor: '#fff' }} className={classes.li}>
                  <Link to="customeroffers" style={{ backgroundColor: '#fff' }}>
                    <LuBriefcaseBusiness className={classes.icon} />
                    Пропозиції
                  </Link>
                </li>
              </ul>
            </>
          ) : null}

          <a
            href="tel:+380800503400 "
            style={{
              backgroundColor: '#fff',
              cursor: 'pointer',
              textDecoration: 'none',
              color: 'inherit',
              display: 'block',
              marginBottom: '0.5em',
            }}
            className={classes.help}
          >
            Служба підтримки
            <br />
            0-800-503-400
          </a>
          <button
            style={{ backgroundColor: '#fff' }}
            className={classes.exit}
            onClick={handleLogout}
          >
            <RxExit className={classes.icon} />
            <span style={{ backgroundColor: '#fff' }}>Вихід</span>
          </button>
        </div>
      </div>
    </>
  );
}

export default SideMenu;

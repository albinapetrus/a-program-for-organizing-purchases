import React, { Component } from 'react';
import classes from './footer.module.css';
import { FaTelegramPlane } from 'react-icons/fa';
import { FaYoutube } from 'react-icons/fa';
import { FaFacebook } from 'react-icons/fa';
import { Link } from 'react-router-dom';

export class footer extends Component {
  render() {
    return (
      <footer className={classes.footer}>
        <div className={classes.rows}>
          <div>
            <h4>UkrainianTrading</h4>
            <Link to="/for-participants">Про нас</Link>

            <Link to="/principle-of-work">Принцип роботи</Link>
          </div>

          <div>
            <h4>Учасникам</h4>
            <Link to="/CustomerInfo">Для Замовників</Link>

            <Link to="/ProcurementInfo">Для Постачальників</Link>
          </div>

          <div>
            <h4>РЕСУРСИ</h4>
            <Link to="/for-developers">Розробникам</Link>

            <Link to="/participant-protection">Захист учасників</Link>
          </div>

          <div className={classes.cont}>
            <h4>Контакти</h4>
            <a href="tel:+380442814287">+38 (044) 281-42-87</a>
            <a href="tel:+380800503400">0-800-503-400</a>
            <a href="mailto:feedback@ukraniantrading.ua">
              feedback@ukraniantrading.ua
            </a>
            <a href="mailto:feedback@ukraniantrading.ua">
              Подати офіційний лист
            </a>
            <p>вул. Бульварно-Кудрявська, 22, м. Київ, 01601</p>
            <FaTelegramPlane className={classes.icon3} />
            <FaYoutube className={classes.icon3} />
            <FaFacebook className={classes.icon3} />
          </div>
        </div>
      </footer>
    );
  }
}

export default footer;

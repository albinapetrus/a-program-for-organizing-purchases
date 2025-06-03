import React, { Component } from 'react';
import classes from './categories/categories.module.css'; 

export class ForParticipantsInfo extends Component {
  render() {
    return (
      <div className={classes.container}>
        <div className={classes.title}>Інформація для Учасників</div>
        
        <div className={classes.sectionTitle}>Переваги для Замовників</div>
        <p className={classes.text}>
          Реєструючись на нашій платформі, ви отримуєте доступ до широкого кола потенційних постачальників, що дозволяє знайти найкращі товари та послуги за оптимальними цінами. Наш інструментарій спрощує процес створення та управління закупівлями, економить ваш час та ресурси.
        </p>
        <ul className={classes.list}>
          <li className={classes.listItem}>Збільшення конкуренції серед постачальників.</li>
          <li className={classes.listItem}>Можливість отримати більш вигідні цінові пропозиції.</li>
          <li className={classes.listItem}>Економія часу на пошук та комунікацію з постачальниками.</li>
          <li className={classes.listItem}>Прозорий процес відбору та укладання угод.</li>
          <li className={classes.listItem}>Зручне зберігання всієї документації по закупівлях.</li>
        </ul>

        <div className={classes.sectionTitle}>Переваги для Постачальників</div>
        <p className={classes.text}>
          Наша платформа відкриває для вашого бізнесу нові горизонти. Отримуйте доступ до актуальних закупівель від різних замовників по всій країні (або регіону, якщо є обмеження), беріть участь у тендерах та розширюйте свою клієнтську базу.
        </p>
        <ul className={classes.list}>
          <li className={classes.listItem}>Доступ до широкого ринку закупівель.</li>
          <li className={classes.listItem}>Рівні умови для всіх учасників.</li>
          <li className={classes.listItem}>Можливість продемонструвати свої переваги та конкурентоспроможність.</li>
          <li className={classes.listItem}>Спрощений процес подання пропозицій.</li>
          <li className={classes.listItem}>Збільшення шансів на отримання нових замовлень.</li>
        </ul>

        <div className={classes.sectionTitle}>Як почати?</div>
        <p className={classes.text}>
          1. <strong>Зареєструйтесь:</strong> Створіть обліковий запис, вказавши тип вашої організації (Замовник або Постачальник) та необхідні дані.
        </p>
        <p className={classes.text}>
          2. <strong>Заповніть профіль:</strong> Надайте детальну інформацію про вашу компанію для підвищення довіри з боку інших учасників.
        </p>
        <p className={classes.text}>
          3. <strong>Починайте працювати:</strong> Якщо ви Замовник – публікуйте свої закупівлі. Якщо Постачальник – шукайте актуальні тендери та надсилайте свої пропозиції!
        </p>
      </div>
    );
  }
}

export default ForParticipantsInfo;
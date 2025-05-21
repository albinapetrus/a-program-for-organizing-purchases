// VariousInfo.js
import React, { Component } from 'react';
import classes from './categories.module.css'; // !!! ІМПОРТУЄМО CSS MODULE !!!

export class VariousInfo extends Component {
  render() {
    return (
      <div className={classes.container}>
        <div className={classes.title}>Закупівлі: Різні послуги та товари</div>
        <div className={classes.sectionTitle}>Особливості закупівель іншого</div>
        <p className={classes.text}>
          Ця категорія охоплює закупівлі, які не потрапляють до інших специфічних категорій. Це може бути широкий спектр товарів або послуг. Важливо детально описувати предмет закупівлі.
        </p>
        <div className={classes.sectionTitle}>Для Замовників (Різні)</div>
        <p className={classes.text}>
          Максимально детально описуйте предмет закупівлі, його характеристики, обсяг та вимоги. Чим чіткіше сформульовано оголошення, тим точніші пропозиції ви отримаєте.
        </p>
        <div className={classes.sectionTitle}>Для Постачальників (Різні)</div>
        <p className={classes.text}>
          Постачальники мають уважно читати оголошення та, якщо предмет закупівлі не зовсім типовий, надавати детальний опис своєї пропозиції та її відповідності вимогам замовника.
        </p>
        <div className={classes.sectionTitle}>Прозорість у різних закупівлях</div>
        <p className={classes.text}>
          Навіть для нестандартних закупівель важлива прозорість процесу для забезпечення чесної конкуренції та ефективного використання коштів. Громадський моніторинг застосовний до всіх категорій закупівель.
        </p>
      </div>
    );
  }
}

export default VariousInfo;
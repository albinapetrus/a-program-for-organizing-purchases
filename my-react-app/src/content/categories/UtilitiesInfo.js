// UtilitiesInfo.js
import React, { Component } from 'react';
import classes from './categories.module.css'; // !!! ІМПОРТУЄМО CSS MODULE !!!

export class UtilitiesInfo extends Component {
  render() {
    return (
      <div className={classes.container}>
        <div className={classes.title}>Закупівлі Комунального та побутового обслуговування</div>
        <div className={classes.sectionTitle}>Особливості закупівель послуг</div>
        <p className={classes.text}>
          Ці закупівлі стосуються послуг, пов'язаних з утриманням будівель, територій, вивезенням сміття, водопостачанням, опаленням тощо. Важливі обсяги послуг, періодичність виконання та відповідність санітарним нормам.
        </p>
        <div className={classes.sectionTitle}>Для Замовників (Комунальне та побутове обслуговування)</div>
        <p className={classes.text}>
          Чітко визначайте перелік необхідних послуг, їх обсяги та графік виконання. Вказуйте вимоги до кваліфікації виконавців та використання спеціалізованого обладнання.
        </p>
        <div className={classes.sectionTitle}>Для Постачальників (Комунальне та побутове обслуговування)</div>
        <p className={classes.text}>
          Постачальники мають підтвердити можливість надавати заявлені послуги якісно та вчасно. Важливо мати необхідні дозволи та ліцензії (якщо це потрібно).
        </p>
        <div className={classes.sectionTitle}>Прозорість у закупівлях комунальних послуг</div>
        <p className={classes.text}>
          Прозорість у цій сфері дозволяє забезпечити якісне надання послуг громадянам та установам. Громадський моніторинг допомагає контролювати тарифи та обсяги послуг, що закуповуються.
        </p>
      </div>
    );
  }
}

export default UtilitiesInfo;
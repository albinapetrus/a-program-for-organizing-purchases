// AgricultureInfo.js
import React, { Component } from 'react';
import classes from './categories.module.css'; // !!! ІМПОРТУЄМО CSS MODULE !!!

export class AgricultureInfo extends Component {
  render() {
    return (
      <div className={classes.container}>
        <div className={classes.title}>Закупівлі у сфері Сільського господарства</div>
        <div className={classes.sectionTitle}>Особливості сільськогосподарських закупівель</div>
        <p className={classes.text}>
          Закупівлі сільськогосподарської продукції, техніки, добрив, насіння залежать від сезонності, погодних умов та стандартів якості продукції. Важлива логістика та умови зберігання.
        </p>
        <div className={classes.sectionTitle}>Для Замовників (Сільське господарство)</div>
        <p className={classes.text}>
          Чітко визначайте тип продукції, її кількість, якісні показники (вологість, засміченість тощо) та стандарти (наприклад, ДСТУ). Вказуйте терміни та умови поставки.
        </p>
        <div className={classes.sectionTitle}>Для Постачальників (Сільське господарство)</div>
        <p className={classes.text}>
          Постачальники мають підтвердити можливість забезпечити необхідні обсяги продукції відповідної якості у встановлені терміни. Надавайте сертифікати якості та відповідності.
        </p>
        <div className={classes.sectionTitle}>Прозорість у сільськогосподарських закупівлях</div>
        <p className={classes.text}>
          Відкритість тендерів у цій сфері допомагає забезпечити аграріїв необхідними ресурсами та реалізувати продукцію за ринковими цінами. Громадський моніторинг сприяє контролю якості та обсягів закупівель.
        </p>
      </div>
    );
  }
}

export default AgricultureInfo;
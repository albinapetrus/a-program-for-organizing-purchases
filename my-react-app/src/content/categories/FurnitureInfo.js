import React, { Component } from 'react';
import classes from './categories.module.css';

export class FurnitureInfo extends Component {
  render() {
    return (
      <div className={classes.container}>
        <div className={classes.title}>Закупівлі у сфері Меблів</div>
        <div className={classes.sectionTitle}>
          Особливості закупівель меблів
        </div>
        <p className={classes.text}>
          При закупівлі меблів важливі матеріали, якість виготовлення,
          функціональність та дизайн. Часто вимагається відповідність
          ергономічним та екологічним стандартам, а також наявність гарантії.
        </p>
        <div className={classes.sectionTitle}>Для Замовників (Меблі)</div>
        <p className={classes.text}>
          Вказуйте точні розміри, матеріали, колір та стиль меблів. Можливо,
          потрібно надати ескізи або технічні вимоги. Звертайте увагу на терміни
          виготовлення та доставки.
        </p>
        <div className={classes.sectionTitle}>Для Постачальників (Меблі)</div>
        <p className={classes.text}>
          Постачальники мають надати зразки матеріалів, каталоги продукції та
          підтвердження якості. Важливо чітко вказати терміни виробництва та
          умови монтажу, якщо це передбачено.
        </p>
        <div className={classes.sectionTitle}>
          Прозорість у меблевих закупівлях
        </div>
        <p className={classes.text}>
          Відкритість тендерів на меблі дозволяє замовникам отримати кращі
          цінові пропозиції та ширший вибір постачальників. Громадський
          моніторинг допомагає забезпечити відповідність якості поставлених
          меблів заявленим вимогам.
        </p>
      </div>
    );
  }
}

export default FurnitureInfo;

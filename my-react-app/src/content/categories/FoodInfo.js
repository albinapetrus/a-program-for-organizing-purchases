import React, { Component } from 'react';
import classes from './categories.module.css';

export class FoodInfo extends Component {
  render() {
    return (
      <div className={classes.container}>
        <div className={classes.title}>Закупівлі у сфері Харчування</div>
        <div className={classes.sectionTitle}>
          Особливості закупівель продуктів
        </div>
        <p className={classes.text}>
          Закупівлі продуктів харчування вимагають дотримання суворих санітарних
          норм, стандартів якості, термінів придатності та умов
          зберігання/транспортування. Важлива періодичність та обсяги поставок.
        </p>
        <div className={classes.sectionTitle}>Для Замовників (Харчування)</div>
        <p className={classes.text}>
          Чітко визначайте перелік продуктів, необхідну кількість, якісні
          показники, стандарти (наприклад, ДСТУ) та вимоги до пакування.
          Вказуйте графік та місця поставки.
        </p>
        <div className={classes.sectionTitle}>
          Для Постачальників (Харчування)
        </div>
        <p className={classes.text}>
          Постачальники мають надати сертифікати якості та відповідності на
          продукцію, медичні книжки персоналу. Важливо підтвердити можливість
          забезпечити своєчасну поставку продуктів, дотримуючись санітарних
          норм.
        </p>
        <div className={classes.sectionTitle}>
          Прозорість у закупівлях харчування
        </div>
        <p className={classes.text}>
          Прозорість у цій сфері є важливою для забезпечення якості продуктів у
          дитячих садках, школах, лікарнях, армії. Громадський моніторинг
          допомагає контролювати якість, безпеку та обґрунтованість цін на
          продукти харчування.
        </p>
      </div>
    );
  }
}

export default FoodInfo;

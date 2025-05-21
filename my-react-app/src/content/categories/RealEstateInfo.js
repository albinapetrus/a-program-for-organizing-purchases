// RealEstateInfo.js
import React, { Component } from 'react';
import classes from './categories.module.css'; // !!! ІМПОРТУЄМО CSS MODULE !!!

export class RealEstateInfo extends Component {
  render() {
    return (
      <div className={classes.container}>
        <div className={classes.title}>Закупівлі у сфері Нерухомості</div>
        <div className={classes.sectionTitle}>Особливості закупівель нерухомості</div>
        <p className={classes.text}>
          Закупівлі будівель, приміщень, земельних ділянок вимагають ретельної юридичної перевірки, оцінки вартості та відповідності цільовому призначенню. Це складні тендери з високою вартістю.
        </p>
        <div className={classes.sectionTitle}>Для Замовників (Нерухомість)</div>
        <p className={classes.text}>
          Чітко визначайте тип об'єкта нерухомості, його площу, місце розташування, технічний стан та правовий статус. Вимагайте повний пакет документів, що підтверджують право власності та відсутність обтяжень.
        </p>
        <div className={classes.sectionTitle}>Для Постачальників (Нерухомість)</div>
        <p className={classes.text}>
          Постачальники мають надати повний пакет документів на об'єкт нерухомості, включаючи технічний паспорт, витяг з реєстру прав власності та інші необхідні документи. Важливо підтвердити відсутність будь-яких юридичних проблем.
        </p>
        <div className={classes.sectionTitle}>Прозорість у закупівлях нерухомості</div>
        <p className={classes.text}>
          Прозорість у цій сфері є надзвичайно важливою через високу вартість об'єктів та потенційні ризики. Громадський моніторинг допомагає контролювати обґрунтованість ціни та законність угод.
        </p>
      </div>
    );
  }
}

export default RealEstateInfo;
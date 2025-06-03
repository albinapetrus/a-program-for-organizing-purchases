import React, { Component } from 'react';
import classes from './categories.module.css'; 

export class TransportInfo extends Component {
  render() {
    return (
      <div className={classes.container}>
        <div className={classes.title}>Закупівлі Транспорту та запчастин</div>
        <div className={classes.sectionTitle}>Особливості транспортних закупівель</div>
        <p className={classes.text}>
          Закупівлі транспортних засобів та запчастин вимагають детального опису технічних характеристик, року випуску, комплектації. Важливі умови гарантії, сервісного обслуговування та наявність супутньої документації.
        </p>
        <div className={classes.sectionTitle}>Для Замовників (Транспорт та запчастини)</div>
        <p className={classes.text}>
          Чітко визначайте тип транспортного засобу, його призначення, необхідні технічні параметри та вимоги до безпеки. При закупівлі запчастин вказуйте точні маркування та сумісність.
        </p>
        <div className={classes.sectionTitle}>Для Постачальників (Транспорт та запчастини)</div>
        <p className={classes.text}>
          Постачальники мають надати повну інформацію про транспортний засіб або запчастини, включаючи технічні паспорти, сертифікати відповідності та умови гарантії.
        </p>
        <div className={classes.sectionTitle}>Прозорість у транспортних закупівлях</div>
        <p className={classes.text}>
          Відкриті тендери на транспорт дозволяють забезпечити оновлення автопарків за конкурентними цінами. Громадський моніторинг допомагає виявляти випадки завищення вартості транспортних засобів або запчастин.
        </p>
      </div>
    );
  }
}

export default TransportInfo;
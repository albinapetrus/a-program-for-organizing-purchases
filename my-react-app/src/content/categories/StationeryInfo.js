import React, { Component } from 'react';
import classes from './categories.module.css';

export class StationeryInfo extends Component {
  render() {
    return (
      <div className={classes.container}>
        <div className={classes.title}>Закупівлі Канцелярії та госптоварів</div>
        <div className={classes.sectionTitle}>Особливості закупівель цієї категорії</div>
        <p className={classes.text}>
          Ці закупівлі стосуються широкого асортименту товарів повсякденного використання. Важлива наявність необхідних товарів, їх якість, відповідність санітарним нормам та умови поставки.
        </p>
        <div className={classes.sectionTitle}>Для Замовників (Канцелярія та госптовари)</div>
        <p className={classes.text}>
          Формуйте чіткі списки необхідних товарів із зазначенням кількості та специфікацій (наприклад, щільність паперу, тип ручок). Звертайте увагу на можливість періодичних поставок.
        </p>
        <div className={classes.sectionTitle}>Для Постачальників (Канцелярія та госптовари)</div>
        <p className={classes.text}>
          Постачальники мають продемонструвати широкий асортимент продукції та можливість забезпечити своєчасну поставку. Конкурентна ціна та якість товару є ключовими факторами.
        </p>
        <div className={classes.sectionTitle}>Прозорість у закупівлях канцелярії та госптоварів</div>
        <p className={classes.text}>
          Відкритість тендерів дозволяє отримати необхідні товари за оптимальними цінами. Громадський моніторинг може допомагати виявляти випадки завищення цін на базові товари.
        </p>
      </div>
    );
  }
}

export default StationeryInfo;
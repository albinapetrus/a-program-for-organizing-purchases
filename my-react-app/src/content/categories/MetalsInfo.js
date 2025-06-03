import React, { Component } from 'react';
import classes from './categories.module.css'; 

export class MetalsInfo extends Component {
  render() {
    return (
      <div className={classes.container}>
        <div className={classes.title}>Закупівлі у сфері Металів</div>
        <div className={classes.sectionTitle}>Особливості закупівель металопродукції</div>
        <p className={classes.text}>
          Закупівлі металів та металопродукції вимагають точного визначення типу металу, його сплаву, розмірів, форми та стандартів якості (наприклад, ДСТУ, ISO). Важливі умови поставки та зберігання.
        </p>
        <div className={classes.sectionTitle}>Для Замовників (Метали)</div>
        <p className={classes.text}>
          Чітко вказуйте марку сталі, необхідні розміри прокату, сортамент. Надавайте креслення, якщо це необхідно. Перевіряйте наявність сертифікатів якості на продукцію.
        </p>
        <div className={classes.sectionTitle}>Для Постачальників (Метали)</div>
        <p className={classes.text}>
          Постачальники мають надати сертифікати відповідності та якості на металопродукцію. Важливо чітко описати умови поставки, різання (якщо потрібно) та транспортування.
        </p>
        <div className={classes.sectionTitle}>Прозорість у закупівлях металів</div>
        <p className={classes.text}>
          Відкриті тендери на метали дозволяють замовникам отримати матеріали необхідної якості за ринковими цінами. Громадський моніторинг допомагає контролювати обсяги та вартість закупівель металопродукції.
        </p>
      </div>
    );
  }
}

export default MetalsInfo;
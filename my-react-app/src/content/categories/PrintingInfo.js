// PrintingInfo.js
import React, { Component } from 'react';
import classes from './categories.module.css'; // !!! ІМПОРТУЄМО CSS MODULE !!!

export class PrintingInfo extends Component {
  render() {
    return (
      <div className={classes.container}>
        <div className={classes.title}>Закупівлі у сфері Поліграфії</div>
        <div className={classes.sectionTitle}>Особливості поліграфічних закупівель</div>
        <p className={classes.text}>
          Закупівлі друкованої продукції (бланки, листівки, книги, газети тощо) вимагають точного визначення тиражу, формату, типу паперу, кольоровості, післядрукарської обробки. Важливі терміни виготовлення та якість друку.
        </p>
        <div className={classes.sectionTitle}>Для Замовників (Поліграфія)</div>
        <p className={classes.text}>
          Надавайте детальні технічні вимоги до друку, макети продукції у потрібному форматі. Чітко вказуйте тираж, специфікацію матеріалів та терміни виконання замовлення.
        </p>
        <div className={classes.sectionTitle}>Для Постачальників (Поліграфія)</div>
        <p className={classes.text}>
          Постачальники мають продемонструвати можливості свого обладнання та якість друку (можливо, надати зразки). Важливо чітко вказати терміни виготовлення та умови доставки готової продукції.
        </p>
        <div className={classes.sectionTitle}>Прозорість у закупівлях поліграфії</div>
        <p className={classes.text}>
          Відкриті тендери дозволяють замовникам отримати друковану продукцію необхідної якості за конкурентними цінами. Громадський моніторинг допомагає контролювати обсяги та вартість поліграфічних послуг.
        </p>
      </div>
    );
  }
}

export default PrintingInfo;
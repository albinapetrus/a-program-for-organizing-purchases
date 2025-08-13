import React, { Component } from 'react';
import classes from './categories.module.css';

export class ClothingInfo extends Component {
  render() {
    return (
      <div className={classes.container}>
        <div className={classes.title}>Закупівлі Одягу, взуття та текстилю</div>
        <div className={classes.sectionTitle}>
          Особливості закупівель цієї категорії
        </div>
        <p className={classes.text}>
          При закупівлі одягу, взуття та текстилю важливі матеріали, розміри,
          відповідність стандартам (наприклад, для спецодягу), якість пошиття.
          Часто вимагається надання зразків.
        </p>
        <div className={classes.sectionTitle}>
          Для Замовників (Одяг, взуття та текстиль)
        </div>
        <p className={classes.text}>
          Чітко вказуйте тип одягу/взуття, необхідні розміри, матеріали, колір,
          кількість. Надавайте технічний опис або зразки. Звертайте увагу на
          умови поставки та пакування.
        </p>
        <div className={classes.sectionTitle}>
          Для Постачальників (Одяг, взуття та текстиль)
        </div>
        <p className={classes.text}>
          Постачальники мають надати зразки продукції, сертифікати на матеріали,
          таблиці розмірів. Важливо підтвердити відповідність якості та
          можливість виготовити необхідні обсяги у термін.
        </p>
        <div className={classes.sectionTitle}>
          Прозорість у закупівлях одягу та текстилю
        </div>
        <p className={classes.text}>
          Відкриті тендери дозволяють замовникам отримати якісну продукцію
          (особливо для потреб армії, медицини тощо) за обґрунтованими цінами.
          Громадський моніторинг допомагає контролювати відповідність якості
          поставленої продукції.
        </p>
      </div>
    );
  }
}

export default ClothingInfo;

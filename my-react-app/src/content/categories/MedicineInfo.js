// MedicineInfo.js
import React, { Component } from 'react';
import classes from './categories.module.css'; 

export class MedicineInfo extends Component {
  render() {
    return (
      <div className={classes.container}>
        <div className={classes.title}>Закупівлі у сфері Медицини</div>
        <div className={classes.sectionTitle}>Особливості медичних закупівель</div>
        <p className={classes.text}>
          Закупівлі медикаментів, обладнання та послуг вимагають особливої уваги до якості, сертифікації та термінів придатності. Важливо дотримуватись суворих стандартів та регуляторних вимог.
        </p>
        <div className={classes.sectionTitle}>Для Замовників (Медицина)</div>
        <p className={classes.text}>
          При оголошенні закупівлі чітко вказуйте необхідні технічні характеристики, стандарти якості та вимоги до реєстрації продукції. Перевіряйте ліцензії постачальників та відповідність запропонованих товарів медичним нормам.
        </p>
        <div className={classes.sectionTitle}>Для Постачальників (Медицина)</div>
        <p className={classes.text}>
          Постачальники мають надати повний пакет документів, що підтверджують якість, безпеку та реєстрацію медичної продукції. Будьте готові продемонструвати відповідність стандартам зберігання та транспортування.
        </p>
        <div className={classes.sectionTitle}>Прозорість у медицині</div>
        <p className={classes.text}>
          Прозорість медичних закупівель має критичне значення для забезпечення доступу пацієнтів до якісного лікування. Громадський контроль допомагає запобігати корупції та забезпечує ефективне використання бюджетних коштів у сфері охорони здоров'я.
        </p>
      </div>
    );
  }
}

export default MedicineInfo;
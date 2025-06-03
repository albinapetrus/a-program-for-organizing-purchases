import React, { Component } from 'react';
import classes from './categories/categories.module.css'; 

export class PrincipleOfWorkInfo extends Component {
  render() {
    return (
      <div className={classes.container}>
        <div className={classes.title}>Принцип роботи платформи</div>
        <div className={classes.sectionTitle}>Як це працює?</div>
        <p className={classes.text}>
          Наша платформа створена для спрощення та оптимізації процесу закупівель, забезпечуючи прозору та ефективну взаємодію між Замовниками та Постачальниками. Ми прагнемо зробити ринок більш відкритим та конкурентним.
        </p>
        
        <div className={classes.sectionTitle}>Для Замовників</div>
        <ul className={classes.list}>
          <li className={classes.listItem}><strong>Реєстрація та створення профілю:</strong> Швидко створіть обліковий запис вашої компанії.</li>
          <li className={classes.listItem}><strong>Публікація закупівель:</strong> Легко формуйте та публікуйте детальні описи ваших потреб, вказуючи всі необхідні параметри та додаючи супровідні документи.</li>
          <li className={classes.listItem}><strong>Отримання пропозицій:</strong> Отримуйте пропозиції від зацікавлених постачальників безпосередньо на платформі.</li>
          <li className={classes.listItem}><strong>Аналіз та вибір переможця:</strong> Порівнюйте умови, ціни та репутацію постачальників для прийняття обґрунтованого рішення.</li>
          <li className={classes.listItem}><strong>Укладання угоди:</strong> Після прийняття пропозиції система надає можливість сформувати базовий договір.</li>
        </ul>

        <div className={classes.sectionTitle}>Для Постачальників</div>
        <ul className={classes.list}>
          <li className={classes.listItem}><strong>Реєстрація та налаштування профілю:</strong> Зареєструйте свою компанію та вкажіть сфери вашої діяльності.</li>
          <li className={classes.listItem}><strong>Пошук актуальних закупівель:</strong> Використовуйте зручні фільтри для пошуку закупівель, що відповідають вашому профілю.</li>
          <li className={classes.listItem}><strong>Подання пропозицій:</strong> Надсилайте конкурентоспроможні пропозиції, додаючи необхідні документи та вказуючи ваші умови.</li>
          <li className={classes.listItem}><strong>Відстеження статусу:</strong> Слідкуйте за статусом ваших пропозицій – чи вони розглядаються, прийняті або відхилені.</li>
          <li className={classes.listItem}><strong>Розширення бізнесу:</strong> Отримуйте доступ до нових замовників та можливостей для розвитку.</li>
        </ul>

        <div className={classes.sectionTitle}>Наша місія</div>
        <p className={classes.text}>
          Ми прагнемо створити чесне та відкрите середовище для проведення закупівель, де кожен учасник має рівні можливості, а ціноутворення формується на основі здорової конкуренції. Наша платформа – це інструмент для ефективного бізнесу та боротьби з непрозорими схемами.
        </p>
      </div>
    );
  }
}

export default PrincipleOfWorkInfo;
import React, { Component } from 'react';
import classes from './categories/categories.module.css'; 

export class ForDevelopersInfo extends Component {
  render() {
    return (
      <div className={classes.container}>
        <div className={classes.title}>Інформація для Розробників</div>
        <div className={classes.sectionTitle}>Технологічний стек</div>
        <p className={classes.text}>
          Наш веб-додаток розроблено з використанням сучасних та перевірених технологій, що забезпечують його надійність, масштабованість та продуктивність.
        </p>
        <ul className={classes.list}>
          <li className={classes.listItem}><strong>Бекенд:</strong> ASP.NET Core (C#) – для створення потужного та безпечного RESTful API.</li>
          <li className={classes.listItem}><strong>Фронтенд:</strong> React (JavaScript) – для побудови динамічного та інтерактивного користувацького інтерфейсу.</li>
          <li className={classes.listItem}><strong>База даних:</strong> [Твоя СУБД, наприклад, SQL Server] – для надійного зберігання даних.</li>
          <li className={classes.listItem}><strong>ORM:</strong> Entity Framework Core – для зручної взаємодії з базою даних з коду C#.</li>
          <li className={classes.listItem}><strong>Автентифікація:</strong> JWT (JSON Web Tokens) – для безпечної автентифікації користувачів.</li>
          <li className={classes.listItem}><strong>Документування API:</strong> Swagger/OpenAPI – для створення інтерактивної документації API.</li>
          <li className={classes.listItem}><strong>Стилізація:</strong> CSS Modules та Bootstrap (частково) – для гнучкого та адаптивного дизайну.</li>
        </ul>

        <div className={classes.sectionTitle}>Архітектурні підходи</div>
        <p className={classes.text}>
          В основі архітектури лежать принципи клієнт-серверної взаємодії та багатошарової архітектури на бекенді. Використання RESTful API забезпечує чітке розділення між фронтендом та бекендом. Патерни проектування, такі як DTO, Repository (через DbContext) та Dependency Injection, сприяють створенню чистого, модульного та легкого в підтримці коду.
        </p>

        <div className={classes.sectionTitle}>Відкритість та можливості (якщо актуально)</div>
        <p className={classes.text}>
          Ми завжди відкриті до співпраці та ідей щодо покращення платформи. Якщо у вас є пропозиції або ви зацікавлені в інтеграції, зв'яжіться з нами.
          Даний проект є демонстрацією застосування сучасних технологій для створення веб-платформи. Вихідний код доступний [посилання на GitHub, якщо є] для ознайомлення та навчальних цілей.
        </p>
      </div>
    );
  }
}

export default ForDevelopersInfo;
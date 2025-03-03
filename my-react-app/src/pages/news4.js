import React, { Component } from 'react'
import classes from './Article.module.css'
import { Link } from 'react-router-dom'; 

export class news4 extends Component {
  render() {
    return (
        <div className={classes.article}>
        <Link to="/news" className={classes.newsLink}>До усіх новин</Link>
        <article className={classes.article1}>
          <h1>Не витрачайте час на пошук технічної специфікації – ось як знайти її за кілька кліків</h1>
          <p className={classes.date}>3 січня 2025, 11:00</p>
          
          <p>
            Технічну специфікацію у запиті ціни пропозицій можна подивитися на новій версії порталу без додаткових завантажень.
          </p>
          
          <h2>Де знайти технічну специфікацію за кілька кліків</h2>
          <p>У новій версії порталу UkrainianTrading</p>
          <ul>
            <li>Зайдіть у Реєстр пропозицій учасника.</li>
            <li>Знайдіть файл під назвою "Електронна пропозиція".</li>
            <li>Натисніть кнопку "Відкрити у PDF", щоб одразу переглянути документ онлайн.</li>
          </ul>
          
          <p>
            Нагадуємо, що у листопаді в системі Prozorro запрацювала електронна тендерна пропозиція.  Її можна переглянути на порталі в розділі "Реєстр пропозицій" в документах пропозиції учасників. А для лотових закупівель — у вкладці "Лоти"  (всередині лоту в розділі "Реєстр пропозицій").
          </p>
          
          <p>
            Електронна пропозиція формується у всіх типах закупівель, крім закупівлі без використання електронної системи та переговорної процедури.
          </p>
        </article>
      </div>
    )
  }
}

export default news4
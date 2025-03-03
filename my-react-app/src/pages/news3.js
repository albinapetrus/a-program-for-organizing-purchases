import React, { Component } from 'react'
import classes from './Article.module.css'
import { Link } from 'react-router-dom'; 

export class news3 extends Component {
  render() {
    return (
        <div className={classes.article}>
        <Link to="/news" className={classes.newsLink}>До усіх новин</Link>
        <article className={classes.article1}>
          <h1>181 мільярд через UkrainianTrading: як минув грудень у публічних закупівлях</h1>
          <p className={classes.date}>7 січня 2025, 10:23</p>
          
          <p>
            Наприкінці року замовники оголосили в електронній системі закупівлі на 180,97 млрд грн та уклали договорів на 158,24 млрд грн за результатами конкурентних торгів.
          </p>
          
          <h2>Оголошені конкурентні закупівлі</h2>
          <p>
            13,63 тис. замовників оголосили 62,27 тис. закупівель очікуваною вартістю 180,97 млрд грн.
          </p>
          
          <h2>На що планували витратити найбільше:</h2>
          <ul>
            <li>Електроенергія</li>
            <li>Бензин та ДП</li>
            <li>Харчові продукти</li>
            <li>Бойове екіпірування</li>
            <li>Ремонт та реконструкція</li>
          </ul>
          
          <h2>Економія та завершені конкурентні закупівлі</h2>
          <p>
            UkrainianTrading — це не тільки про витрати, а й про заощадження. За підсумками 48,6 тис. укладених договорів замовники заощадили 8 млрд грн.
          </p>
          
          <h2>Найбільше коштів за укладеними договорами мають отримати:</h2>
          <ul>
            <li>Трейд Енерджі Солюшн</li>
            <li>Автомагістраль-Південь</li>
            <li>Енера</li>
            <li>Міт Пром</li>
            <li>Буський консервний завод</li>
          </ul>
          
          <p>
            Проаналізовано завдяки модулю аналітики <a href="https://bi.UkrainianTrading.org" target="_blank" rel="noopener noreferrer">bi.UkrainianTrading.org</a>, що розвиває команда DOZORRO.
          </p>
        </article>
      </div>
    )
  }
}

export default news3
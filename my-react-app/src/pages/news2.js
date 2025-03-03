import React, { Component } from 'react'
import classes from './Article.module.css'
import { Link } from 'react-router-dom'; 

export class news2 extends Component {
  render() {
    return (
        <div className={classes.article}>
            <Link to = "/news" className={classes.newsLink}>До усіх новин</Link>
        <article className={classes.article1}>
        <h1>
          Про відновлення формування довідок з ЄДР в системі Prozorro
        </h1>
        <p className={classes.date}>10 січня 2025, 11:10</p>
        
        <p>
          Від 9 січня 2025 року роботу Єдиного державного реєстру було відновлено.
        </p>
        
        <p>
          Інформуємо користувачів системи щодо відновлення формування довідок на порталі Prozorro в рамках інтеграції з ЄДР.
        </p>
        
        <p>
          Нагадаємо: через проблеми мережевої інфраструктури на боці ДП «НАІС» в системі Prozorro тимчасово не формувались довідки з ЄДР.
        </p>
      </article>
      </div>
    )
  }
}

export default news2
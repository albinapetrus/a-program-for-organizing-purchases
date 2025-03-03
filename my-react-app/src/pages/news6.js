import React, { Component } from 'react'
import classes from './Article.module.css'
import { Link } from 'react-router-dom'; 

export class news6 extends Component {
  render() {
    return (
        <div className={classes.article}>
        <Link to="/news" className={classes.newsLink}>До усіх новин</Link>
        <article className={classes.article1}>
          <h1>Нагадуємо про необхідність підтвердження ступеню локалізації виробництва товарів після 1 січня 2025 року</h1>
          <p className={classes.date}>24 грудня 2024, 19:40</p>
          <p>
            Нагадуємо виробникам, які хочуть включити свої товари до переліку локалізованих, про необхідність переподачі заявок на підтвердження ступеню локалізації. Незалежно від того, в якому місяці та якому році ви подали попередню заявку, після 1 січня 2025 року необхідно переподати заявку, калькуляцію та підтверджуючі документи.
          </p>
          <p>
            Просимо користуватись нормами Постанови від 2 серпня 2022 р. № 861 (зі змінами), яка регулює процес підтвердження ступеню локалізації та передбачає, що перелік локалізованих товарів формується щороку за результатами автоматичного опрацювання поданих виробником заявок на вебпорталі UkrainianTrading. Запис про включення товару до переліку чинний лише протягом року, в якому була подана заявка.
          </p>
          <p>
            Більш детальну інформацію про локалізацію ви можете знайти за посиланням: <a href="https://prozorro.gov.ua/page/localisation" target="_blank" rel="noopener noreferrer">https://prozorro.gov.ua/page/localisation</a>.
          </p>
        </article>
      </div>
    )
  }
}

export default news6
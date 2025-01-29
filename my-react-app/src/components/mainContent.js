import React, { Component } from 'react'
import classes from './MainContent.module.css'
import { FaHandHoldingUsd } from "react-icons/fa";
import { FaBuildingUser } from "react-icons/fa6";
import { MdOutlinePeopleAlt } from "react-icons/md";

export class mainContent extends Component {
  render() {
    return (
      <section>
        <img src = '/ukraniantrading1.png' className={classes.baner} width='1044px' height='100px' />
        <div className={classes.row}>
        <p className={classes.text}> <strong> Новачок у закупівлях?</strong> Дізнайтеся про перші кроки </p>
        <ul className={classes.firstStepsInfo}>
<div className={classes.first}><FaHandHoldingUsd className={classes.icon}/>Постачальникам </div>
<div className={classes.first}><FaBuildingUser className={classes.icon}/>Замовникам</div>
<div className={classes.first}><MdOutlinePeopleAlt className={classes.icon}/>Громадськості</div>

        </ul>
        <h3 className={classes.text}>Категорії закупівель</h3>
        <ul className={classes.firstStepsInfo}>

        </ul>
        </div>
      </section>
    )
  }
}

export default mainContent
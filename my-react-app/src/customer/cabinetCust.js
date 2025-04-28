import React, { Component } from 'react'
import classes from './Universal.module.css'
import { IoPersonSharp } from "react-icons/io5";

export class cabinetCust extends Component {
  render() {
    return (
     <div className={classes.universal}>
        <div className={classes.block2}>
            <div className={classes.help}>
                    <h1 className={`${classes.label} ${classes.labelBlue}`}><IoPersonSharp   className={classes.icon}/>Ваш кабінет</h1>
                    <p style={{fontWeight:"bold"}}>Ім'я:</p>
                    <p>Email:</p>
                    <p>Роль:</p>
                    <p>Зареєстровано:</p>
                  
                    </div>
                    <div className={classes.help2}>
                        <button className={classes.buttonHelp}>Редагувати</button>
                        <button className={classes.buttonHelp}> Мої закупівлі</button>
                        <button className={classes.buttonHelp}> Додати закупівлю</button>
                        <button className={classes.buttonHelp}> Вийти</button>
                        </div>
        
        </div>
     </div>
    )
  }
}

export default cabinetCust
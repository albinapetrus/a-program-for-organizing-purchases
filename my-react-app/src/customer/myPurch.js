import React, { Component } from 'react'
import classes from './Universal.module.css'
import { FaFolder } from "react-icons/fa";


export class myPurch extends Component {
  render() {
    return (
      <div className={classes.universal}>
        <div className={classes.block1}>
<div style={{backgroundColor:"white", width:"100%"}}>
    <h1 className={classes.label} ><FaFolder style={{color:" #2070d1", position:"relative", marginRight:"0.3em", marginBottom:"0.3em" }} className={classes.icon}/>Мої закупівлі</h1>
    <button style={{ marginLeft:"31em" }} >Створити закупівлю</button>
</div>
<table>
<colgroup>
    <col style={{width: "40%"}}/> 
    <col style={{width: "20%"}}/>
    <col style={{width: "20%"}}/>
    <col style={{width: "20%"}}/>
  </colgroup>
    <tr>
        <th>Назва</th>
        <th>Дата завершення</th>
        <th>Статус</th>
        <th>Пропозиції</th>
    </tr>
    <tr>
        <td>Закупівля компЄютерного обладнання</td>
        <td>26.04.2025</td>
        <td>Активна</td>
        <td>7</td>
        </tr>
        <tr>
        <td>Закупівля компЄютерного обладнання</td>
        <td>26.04.2025</td>
        <td>Активна</td>
        <td>7</td>
        </tr>
</table>
</div>
      </div>
    )
  }
}

export default myPurch
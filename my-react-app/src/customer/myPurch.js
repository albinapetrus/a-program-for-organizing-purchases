import React, { Component } from 'react'
import classes from './Universal.module.css'
import { FaFolder } from "react-icons/fa";
import { Link } from 'react-router-dom';


export class myPurch extends Component {
  render() {
    return (
      <div className={classes.universal}>
        <div className={classes.block1}>
<div style={{backgroundColor:"white", width:"100%"}}>
    <h1 className={classes.label} ><FaFolder style={{color:" #2070d1", position:"relative", marginRight:"0.3em", marginBottom:"0.3em" }} className={classes.icon}/>Мої закупівлі</h1>
    <Link to="/newOne"  style={{
    display: "block",
    marginLeft: "31em",
    backgroundColor: "#2070d1", // Правильно
    textDecoration: "none",
    color: "white",
    borderRadius: "5px",
    width: "10em"
  }} >Створити закупівлю</Link>
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
    <tbody>
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
        </tbody>
</table>
</div>
      </div>
    )
  }
}

export default myPurch
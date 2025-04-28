import React, { Component } from 'react'
import classes from './Universal.module.css'
import { GoPaperclip } from "react-icons/go";

export class NewOne extends Component {
  render() {
    return (
      <div className={classes.universal}>
        <form className={classes.block}>
        <h1 className={`${classes.label} ${classes.labelBlue}`}>Зареєструйте нову закупівлю</h1>
        <label for="purch_name">Назва закупівлі:</label>
        <input type="text" id="purch_name" placeholder="Закупівля системних ПК...." name="purch_name" required></input>
        <label for="purch_desc">Опис закупівлі:</label>
        <input type="text" id="purch_desc" placeholder="Тендер на закупівлю нових або в хорошому стані ....." name="purch_desc" required></input>
        <label >Додайте супровідні документи:</label>
         <label for="purch_doc" className={classes.styledFile}><GoPaperclip className={classes.icon}/></label>
        <input type="file" id="purch_doc" name="purch_doc" required></input>
        <label>Вкажіть категорію</label>
<select id="purch_category" name="category">
  <option value="construction">Будівництво</option>
  <option value="medicine">Медицина</option>
  <option value="furniture">Меблі</option>
  <option value="computers">Комп'ютерна техніка</option>
  <option value="stationery">Канцелярія та госптовари</option>
  <option value="transport">Транспорт та запчастини</option>
  <option value="energy">Енергетика, нафтопродукти та паливо</option>
  <option value="metals">Метали</option>
  <option value="utilities">Комунальне та побутове обслуговування</option>
  <option value="education">Навчання та консалтинг</option>
  <option value="real_estate">Нерухомість</option>
  <option value="agriculture">Сільське господарство</option>
  <option value="clothing">Одяг, взуття та текстиль</option>
  <option value="equipment">Промислове обладнання та прилади</option>
  <option value="food">Харчування</option>
  <option value="printing">Поліграфія</option>
  <option value="research">Науково-дослідні роботи</option>
  <option value="other">Різні послуги та товари</option>
</select>
<div style={{ backgroundColor: "#fff", marginBottom: "2em" }}>

<label>Кількість/Обсяг</label>
<input type="number" id="purch_amount" required style={{  marginRight: "1em", marginLeft:"0.5em" , height:"2em", width:"15%"  }}></input>
<label>Орієнтовний бюджет($)</label>

<input type="number" id="purch_budget" style={{  marginLeft: "0.5em", height:"2em",  width:"15%" }} required></input>
</div>
<div style={{ backgroundColor: "#fff"}}>
<label>Завершення закупівлі:</label>

<input  type="date" id="purch_deadline" required></input>
</div>
<input type="submit" placeholder="Створити закупівлю"></input>

</form>
      </div>
    )
  }
}

export default NewOne
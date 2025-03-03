import React, { Component } from 'react'
import classes from './auth.module.css' 


export class auth2 extends Component {
  render() {
    return (
      <div className={classes.auth}>
         <h2 className={classes.text1}>Форма реєстрації</h2>
        <form  >
        <fieldset className={classes.fieldset}>
        <label>Вкажіть роль:</label>
       <div>   
  <input type="radio" id="postachalnyk" name="role" value="postachalnyk" defaultChecked></input>
  <label for="postachalnyk">Постачальник</label>
  <input type="radio" id="custumer" name="role" value="CSS"></input>
  <label for="custumer">Замовник</label>
  </div> 
<label>Вкажіть правовий статус:</label>
<div>
  <input type="radio" id="fiz" name="fav_language" value="HTML" ></input>
  <label for="html">Фізичне лице</label>
  <input type="radio" id="ur" name="fav_language" value="CSS"  ></input>
  <label for="ur" required >Юридичне лице</label>
  </div>
  <label>Вкажіть ПІБ</label>
<input type="text" required ></input>
<label>Вкажіть ІПН</label>
<input type="text" pattern="[0-9]{10}" required ></input>
<label>Вкажіть дату народження</label>
<input type="date"></input>
<label>Вкажіть категорію</label>
<select id="category" name="cars">
    <option value="volvo">Volvo</option>
    <option value="saab">Saab</option>
    <option value="fiat">Fiat</option>
    <option value="audi">Audi</option>
  </select>
  <label>Вставте фото паспорту для перевірки (першу сторінку)</label>
  <input type="file" required  className={classes.file}></input>
  <input type="submit" className={classes.submit} value="Submit" ></input> 
</fieldset>

  </form>

    

      </div>
    )
  }
}

export default auth2
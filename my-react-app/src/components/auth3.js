import React, { Component } from 'react'
import classes from './auth.module.css' 
import { SideMenuContext } from '../SideMenuContext';
import { Link,  Navigate } from 'react-router-dom';


export class auth3 extends Component {
  static contextType = SideMenuContext;
  constructor(props) {
    super(props);
    this.state = {
      redirect: false,
      companyName: '', // Стан для перенаправлення
    };
  }

  handleSubmit = (e) => {
    e.preventDefault();
    this.context.setIsSideMenuOpen(true);
    localStorage.setItem('isRegistered', 'true'); 
    this.context.handleCompanyNameChange(this.state.companyName); 
    this.setState({ redirect: true }); // Зміна стану для редиректу
  };
  handleInputChange = (e) => {
    this.setState({ companyName: e.target.value });
  };
  render() {
    if (this.state.redirect) {
      return <Navigate to="/auth4" />; // Програмне перенаправлення
    } 
    return (
      <div  className={classes.auth}>
        <p style ={{color: "#2070d1" }}>Всього 4 кроки до участі у закупівлі</p>
               <div className={classes.around}>
                        <div className={`${classes.circle} ${classes.circle1}`}>1</div>
                        <div className={`${classes.circle} ${classes.circle1}`}>2</div>
                        <div className={`${classes.circle} ${classes.circle1}`}>3</div>
                        <div className={classes.circle}>4</div>
                    
                        </div>
      <form  className={classes.form1} onSubmit={this.handleSubmit}>
              <fieldset className={classes.fieldset}>
<label>Вкажіть назву компанії</label>
<input type="text" 
  value={this.state.companyName} // використовуємо значення з state
  onChange={this.handleInputChange}
required></input>
<label>Вкажіть категорію</label>
<select id="category" name="category">
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
<input type="submit" className={classes.submit} value="Далі"  /*onClick={this.handleSubmit}*/ ></input> 
   </fieldset>
</form>      
      </div>
      
    )
  }
}

export default auth3
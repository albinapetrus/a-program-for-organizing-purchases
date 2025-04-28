import React, { Component } from 'react'
import classes from './auth.module.css' 
import { GiTakeMyMoney } from "react-icons/gi";
import { TbPigMoney } from "react-icons/tb";
import { Link,  Navigate } from 'react-router-dom';


export class auth2 extends Component {
  constructor(props) {
    super(props);
    this.state = {
      redirect: false, // Стан для перенаправлення
      selectedRole: 'supplier',
    };
  }

  handleSubmit = (e) => {
    e.preventDefault();
    this.setState({ redirect: true }); // Зміна стану для редиректу
  };

  handleRoleChange = (role) => {
    this.setState({ selectedRole: role });
    localStorage.setItem('role', role);
  };

  render() {
if (this.state.redirect) {
      return <Navigate to="/auth3" />; // Програмне перенаправлення
    }
    const { selectedRole } = this.state;
    return (
      <div className={classes.auth}>
        
        <p style ={{color: "#2070d1" }}>Всього 4 кроки до участі у закупівлі</p>
         <div className={classes.around}>
                  <div className={`${classes.circle} ${classes.circle1}`}>1</div>
                  <div className={`${classes.circle} ${classes.circle1}`}>2</div>
                  <div className={classes.circle}>3</div>
                  <div className={classes.circle}>4</div>
               
                  </div>
                 
        { /*<h2 className={classes.text1}>Форма реєстрації</h2>*/}
        <form  className={classes.form1} onSubmit={this.handleSubmit}>
        <fieldset className={classes.fieldset}>
        
       

  <label     className={`${classes.role} ${classes.role2} ${selectedRole === 'supplier' ? classes.activeRole : classes.inactiveRole}`}
              onClick={() => this.handleRoleChange('supplier')}>
 
  <input
    type="radio"
    name="role"
    value="supplier"
    onChange={(e) => localStorage.setItem('role', e.target.value)}
    style={{ display: "none" }}
    required
    
  />
    Постачальник<TbPigMoney className={classes.icon}/></label>
 
  <label      className={`${classes.role} ${classes.role1}  ${selectedRole === 'customer' ? classes.activeRole : classes.inactiveRole}`}
              onClick={() => this.handleRoleChange('customer')}
            >
      
         <input
    type="radio"
    name="role"
    value="customer"
    onChange={(e) => localStorage.setItem('role', e.target.value)}
    style={{ display: "none" }}
    required
  />
        Замовник<GiTakeMyMoney className={classes.icon}/></label>
  
<label className={classes.first}>Вкажіть правовий статус:</label>
<div>
  <input type="radio" id="fiz" name="fav_language" value="fiz" ></input>
  <label for="fiz" >Фізичне лице</label>
  <input type="radio" id="ur" name="fav_language" value="CSS"  ></input>
  <label for="ur" required >Юридичне лице</label>
  </div>
  <label>Вкажіть ПІБ</label>
<input type="text" required ></input>
<label>Вкажіть ІПН</label>
<input type="text" pattern="[0-9]{10}" required ></input>
<label>Вкажіть дату народження</label>
<input type="date"></input>


  <label >Вставте фото паспорту для перевірки (першу сторінку)</label>
  <label for="file" className={classes.styledFile}>Завантажити</label>
  <input type="file" id="file" required  ></input>
  <input type="submit" className={classes.submit} value="Далі"  onClick={this.handleSubmit}></input> 
</fieldset>

  </form>

    

      </div>
    )
  }
}

export default auth2
import React, { Component } from 'react'
import classes from './auth.module.css' 
import { Link,  Navigate } from 'react-router-dom';
import { useNavigate } from 'react-router-dom'; 

export class auth extends Component {
  constructor(props) {
    super(props);
    this.state = {
      redirect: false, // Стан для перенаправлення
    };
  }

  handleSubmit = (e) => {
    e.preventDefault();
    this.setState({ redirect: true }); // Зміна стану для редиректу
  };

  render() {

    if (this.state.redirect) {
      return <Navigate to="/auth2" />; // Програмне перенаправлення
    }
    return (
      <div className={classes.auth}>
            <p style ={{color: "#2070d1" }}>Всього 4 кроки до участі у закупівлі</p>
                   <div className={classes.around}>
          <div className={`${classes.circle} ${classes.circle1}`}>1</div>
          <div className={classes.circle}>2</div>
          <div className={classes.circle}>3</div>
          <div className={classes.circle}>4</div>
      
          </div>
       { /*<h2 className={classes.text1}>Форма реєстрації</h2>*/}
        <form className={classes.form1} onSubmit={this.handleSubmit}>
           <fieldset className={classes.fieldset}>
            <label for="email" >Введіть email:</label>
            <input type="email" id="email" name="email" placeholder="gmail@gmail.com" />
             <label for="password" >Введіть пароль:</label> 
            <input type="password" id="password"  name="password"></input>
            <label for="password" >Повторіть пароль:</label> 
            <input type="password" id="password1"  name="password"></input>
            <input type="submit" className={classes.submit} value="Далі" onClick={this.handleSubmit}></input> 
            </fieldset>
        </form><br/>
        
        <div className={classes.container}>
        <p className={classes.text}>Уже є акаунт? <Link to="/form">Увійти</Link></p>
        </div>
              </div>
    )
  }
}
export default auth
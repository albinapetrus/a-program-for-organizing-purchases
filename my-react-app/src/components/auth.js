import React, { Component } from 'react'
import classes from './auth.module.css' 
import { Link } from 'react-router-dom'; 

export class auth extends Component {
    handleSubmit = () => {
        window.location.href = "/auth2"; // Перехід на іншу сторінку
      };
  render() {
    return (
      <div className={classes.auth}>
        <h2 className={classes.text1}>Форма реєстрації</h2>
        <form className={classes.form}>
            <label for="email" className={classes.label}>Введіть email:</label><br/>
            <input type="email" id="email"className={classes.email} name="email" placeholder="gmail@gmail.com" /><br/>
             <label for="password" className={classes.label}>Введіть пароль:</label> <br/>
            <input type="password" id="password" className={classes.email} name="password"></input><br/>
            <label for="password" className={classes.label}>Повторіть пароль:</label> <br/>
            <input type="password" id="password1" className={classes.email} name="password"></input><br/>
            <input type="submit" className={classes.submit} value="Submit" onClick={this.handleSubmit}></input> 
        </form><br/>
        
        <div className={classes.container}>
        <p className={classes.text}>Уже є акаунт? <Link to="/form">Увійти</Link></p>
        </div>
              </div>
    )
  }
}
export default auth
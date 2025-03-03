import React, { Component } from 'react'
import classes from './auth.module.css' 
import { Link } from 'react-router-dom'; 
import { useNavigate } from "react-router-dom";

export class form extends Component {
   

  render() {
    return (
      <div className={classes.auth}>
             <h2 className={classes.text1}>Форма авторизації</h2>
             <form className={classes.form}>
                 <label for="email" className={classes.label}>Введіть email:</label><br/>
                 <input type="email" id="email"className={classes.email} name="email" placeholder="gmail@gmail.com" /><br/>
                  <label for="password" className={classes.label}>Введіть пароль:</label> <br/>
                 <input type="password" id="password" className={classes.email} name="password"></input><br/>
                
                 
             </form><br/>
             <input type="submit" className={classes.submit} value="Submit"   ></input>
              <div className={classes.container}>
             <p className={classes.text}> <Link to="/auth">Повернутись</Link></p>
             </div>
                   </div>
    )
  }
}

export default form
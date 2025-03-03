import React, { Component } from 'react'
import classes from './footer.module.css'
import { FaTelegramPlane } from "react-icons/fa";
import { FaYoutube } from "react-icons/fa";
import { FaFacebook } from "react-icons/fa";

export class footer extends Component {
  render() {
    return (
      <footer className={classes.footer}>
        <div className={classes.rows}>
        <div>
            <h4>UkrainianTrading</h4>
            <h5>Про нас</h5>
            
<h5>UkrainianTrading концесії</h5>
<h5>Інформаційна безпека</h5>
<h5>Документи ДП "UkrainianTrading"</h5>
<h5>UkrainianTrading+</h5>
<h5>Розвиток системи</h5>
        </div>
        <div>
            <h4>ДРУЗІ</h4>
            <h5>Майданчики </h5>
            
<h5>Дозорро</h5>
<h5>Закупівлі з tender.me.gov.ua</h5>
<h5>Діяльність ЦЗО</h5>

        </div>
        <div>
            <h4>РЕСУРСИ</h4>
            <h5>Розробникам</h5>
            
<h5>Майданчикам</h5>
<h5>Захист учасниківa</h5>


        </div>
        <div>
            <h4>Контакти</h4>
            <p>+38 (044) 281-42-87</p>
<p>0-800-503-400</p>
<p>feedback@prozorro.ua</p>
<p>Подати офіційний лист</p>
<p>вул. Бульварно-Кудрявська, 22, м. Київ, 01601</p>
<FaTelegramPlane className={classes.icon3}/>
<FaYoutube className={classes.icon3}/>
<FaFacebook className={classes.icon3} />
        </div>
        </div>
        

      </footer>
    )
  }
}

export default footer
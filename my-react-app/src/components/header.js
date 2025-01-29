import React, { Component } from 'react'
import classes from './header.module.css'
import { Link } from 'react-router-dom'; 
import App from '../App';

export class header extends Component {
  render() {
    return (
      <header className={classes.header}>
        <h1 className={classes.h1}>UkrainianTrading</h1>
        <nav className={classes.nav1}>
            <div className={classes.div}>Новини</div>
            <div className={classes.div}>UkrainianTrading маркет</div>
            <div className={classes.div}>Інфобокс</div>
            <div className={classes.div}>Локалізація</div>
        </nav>
        <section className={classes.section}>
        <h2 className={classes.h2}>Служба підтримки<br/>0-800-503-400 </h2>
        <h3 className={classes.h3}>Зареєструватися</h3>
        </section>
      </header>
    )
  }
}

export default header
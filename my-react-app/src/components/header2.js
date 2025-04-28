import React, { Component } from 'react'
import classes from './header.module.css'
import { Link } from 'react-router-dom'; 
import App from '../App';
import News from '../pages/News'


export class header2 extends Component {
  render() {
    return (
      <header className={classes.header}>
        <Link to = "/" className={classes.h1}>UkrainianTrading</Link>
        <nav className={classes.nav1}>
            <Link to="/news" className={classes.div}>Новини</Link>
            <Link to = "/market" className={classes.div}>UkrainianTrading маркет</Link>
            <Link to ="/infobox" className={classes.div}>Інфобокс</Link>
            <Link to ="/local"className={classes.div}>Локалізація</Link>
        </nav>
        <section className={classes.section}>
        <h2 className={classes.h2}>Служба підтримки<br/>0-800-503-400 </h2>
        <Link to ="/auth" className={classes.h3}>Назва вашої компанії:</Link>
        <Link to ="/auth" className={classes.h3}>Вийти</Link>
        </section>
      </header>
    )
  }
}

export default header2
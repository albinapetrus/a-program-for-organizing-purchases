import React, { Component } from 'react';
import classes from './header.module.css';
import { Link } from 'react-router-dom';

export class header extends Component {
  render() {
    return (
      <header className={classes.header}>
        <Link to="/" className={classes.h1}>
          UkrainianTrading
        </Link>
        <nav className={classes.nav1}>
          <Link to="/news" className={classes.div}>
            Новини
          </Link>
          <Link to="/market" className={classes.div}>
            UkrainianTrading маркет
          </Link>
          <Link to="/infobox" className={classes.div}>
            Інфобокс
          </Link>
          <Link to="/local" className={classes.div}>
            Переваги
          </Link>
        </nav>
        <section className={classes.section}>
          <a
            href="tel:+380800503400 "
            className={classes.h2}
            style={{ marginTop: '0.7em' }}
          >
            Служба підтримки
            <br />
            0-800-503-400{' '}
          </a>
          <Link to="/auth" className={classes.h3}>
            Зареєструватися
          </Link>
        </section>
      </header>
    );
  }
}

export default header;

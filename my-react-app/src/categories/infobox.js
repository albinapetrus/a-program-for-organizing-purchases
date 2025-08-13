import React, { Component } from 'react';
import classes from './infobox.module.css';

export class infobox extends Component {
  render() {
    return (
      <div>
        <div className={classes.container}>
          <img src="/ukr.png" className={classes.picture} alt="Market"></img>
          <div className={classes.text}>
            Цей сайт створений в цілях навчання. Ідея взята:
          </div>
          <iframe
            className={classes.video}
            title="web-site"
            width="1000"
            height="530"
            src="https://prozorro.gov.ua/uk"
            frameBorder="0"
            allowFullScreen
          ></iframe>
        </div>
      </div>
    );
  }
}

export default infobox;

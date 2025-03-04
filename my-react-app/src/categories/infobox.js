import React, { Component } from 'react'
import classes from './infobox.module.css'

export class infobox extends Component {
  render() {
    return (
      <div>
         <div className={classes.container}>
 <img src="/ukr.png" className={classes.picture} alt="Market"></img>
 <div className={classes.text}>
    Дізнайся як просуватись за допомогою UkrainianTrading
 </div>
 <iframe 
 className={classes.video}
 title='video'
  width="1000" 
  height="530"
  src="https://www.youtube.com/embed/hPESicFVfsc?autoplay=1&mute=1"
   frameborder="0" 
 allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
 
    allowfullscreen></iframe>
     <div className={classes.text}>
    Цей сайт створений в цілях навчання. Ідея взята:
 </div>
 <iframe 
 className={classes.video}
 title='web-site'
  width="1000" 
  height="530"
  src="https://prozorro.gov.ua/uk" 
   frameborder="0" 
    allowfullscreen></iframe>
 </div>
      </div>
    )
  }
}

export default infobox
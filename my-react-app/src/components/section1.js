import React, { Component } from 'react';
import classes from './section1.module.css';
import { FaSearch } from "react-icons/fa";

export class Section1 extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: '',
    };
  }

  handleChange = (event) => {
    this.setState({ value: event.target.value });
  };

  handleSubmit = (event) => {
    event.preventDefault();
    alert(`Введено: ${this.state.value}`);
  };

  render() {
    return (
      <div className={classes.el2}>
        <section className={classes.section2}>
          <nav className={classes.nav}>
            <div>Закупівлі</div>
            <div>Договори</div>
            <div>Плани</div>
            <div>Відбори</div>
            <div>Товари</div>
          </nav>
        </section>
        <form onSubmit={this.handleSubmit} className={classes.form}>
        
          <input
          className={classes.input}
            type="text"
            id="inputField"
            value={this.state.value}
            onChange={this.handleChange}
            placeholder="Назва або код товару, номер закупівлі"
          />
          <button className={classes.button} type="submit"><FaSearch className={classes.icon}/></button>
        </form>
        <nav className={classes.butSec}>
          <button className={classes.button1}>Замовник</button>
          <button className={classes.button1}>Учасник</button>
          <button className={classes.button1}>Закупівельник</button>
          <button className={classes.button1}>Статус</button>
          <button className={classes.button1}>Вид закупівлі</button>
          <button className={classes.button1}>Регіон</button>
        </nav>
      </div>
      
    );
  }
}

export default Section1;

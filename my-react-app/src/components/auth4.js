import React, { Component } from 'react';
import classes from './step4.module.css';
import { IoIosRocket } from 'react-icons/io';
import { Link } from 'react-router-dom';

export class auth4 extends Component {
  render() {
    const role = localStorage.getItem('role');

    return (
      <div className={classes.step4}>
        <p style={{ color: '#2070d1' }}>Всього 4 кроки до участі у закупівлі</p>
        <div className={classes.around}>
          <div className={`${classes.circle} ${classes.circle1}`}>1</div>
          <div className={`${classes.circle} ${classes.circle1}`}>2</div>
          <div className={`${classes.circle} ${classes.circle1}`}>3</div>
          <div className={`${classes.circle} ${classes.circle1}`}>4</div>
        </div>

        <div className={classes.box}>
          <img src="purchase.png" alt="purchase" className={classes.img} />
          {role === 'supplier' ? (
            <>
              <h1>
                Кожного дня більше 11 000 закупівель чекають на пропозиції!
              </h1>
              <p>
                Ви успішно зареєстрували та активували кабінет на
                UkrainianTrading. Час знайти вашу першу закупівлю.{' '}
              </p>
              <Link to="/ProcurementSearch">
                <button>
                  Перейти до закупівель{' '}
                  <IoIosRocket style={{ background: '#2070d1' }} />
                </button>
              </Link>
            </>
          ) : (
            <>
              <h1>
                Кожного дня більше 11 000 постачальників чекають на пропозиції!
              </h1>
              <p>
                Ви успішно зареєстрували та активували кабінет на
                UkrainianTrading. Час створити вашу першу закупівлю.{' '}
              </p>
              <Link to="/newOne">
                <button>
                  Створити першу закупівлю{' '}
                  <IoIosRocket style={{ background: '#2070d1' }} />
                </button>
              </Link>
            </>
          )}
        </div>
      </div>
    );
  }
}

export default auth4;

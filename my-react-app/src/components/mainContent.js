import React, { Component } from 'react'
import classes from './MainContent.module.css'
import { FaHandHoldingUsd } from "react-icons/fa";
import { FaBuildingUser } from "react-icons/fa6";
import { MdOutlinePeopleAlt } from "react-icons/md";
import { BsBuildingCheck } from "react-icons/bs";
import { CiMedicalCase } from "react-icons/ci";
import { AiTwotoneDatabase } from "react-icons/ai";
import { HiMiniComputerDesktop } from "react-icons/hi2";
import { LuScissors } from "react-icons/lu";
import { MdOutlineEmojiTransportation } from "react-icons/md";
import { SlEnergy } from "react-icons/sl";
import { GiMetalBar } from "react-icons/gi";
import { MdOutlineElectricalServices } from "react-icons/md";
import { GiTeacher } from "react-icons/gi";
import { TbBuildingPlus } from "react-icons/tb";
import { GiVillage } from "react-icons/gi";
import { GiClothes } from "react-icons/gi";
import { LiaIndustrySolid } from "react-icons/lia";
import { MdFastfood } from "react-icons/md";
import { FaPrint } from "react-icons/fa";
import { MdOutlineScience } from "react-icons/md";
import { MdOutlineOtherHouses } from "react-icons/md";
import { Link } from 'react-router-dom';
import { HiArrowRight } from "react-icons/hi2";


export class mainContent extends Component {
  render() {
    return (
      <section>
        <img src = '/ukraniantrading1.png' alt='' className={classes.baner} width='1044px' height='100px' />
        <div className={classes.row}>
        <p className={classes.text}> <strong> Новачок у закупівлях?</strong> Дізнайтеся про перші кроки </p>
        <ul className={classes.firstStepsInfo}>
<div className={classes.first}><FaHandHoldingUsd className={classes.icon}/>Постачальникам </div>
<div className={classes.first}><FaBuildingUser className={classes.icon}/>Замовникам</div>
<div className={classes.first}><MdOutlinePeopleAlt className={classes.icon}/>Громадськості</div>

        </ul>
        <div className={classes.row1}>
        <h3 className={classes.text1}>Категорії закупівель</h3>
        <ul className={classes.secondStepsInfo}>
<div className={classes.second}><BsBuildingCheck className={classes.icon1}/>Будівництво</div>
<div className={classes.second}><CiMedicalCase className={classes.icon1}/>Медицина</div>
<div className={classes.second}><AiTwotoneDatabase  className={classes.icon1}/>Меблі</div>
<div className={classes.second}><HiMiniComputerDesktop className={classes.icon1}/>Комп'ютерна техніка</div>
<div className={classes.second}><LuScissors className={classes.icon1}/>Канцелярія та госптовари</div>
<div className={classes.second}><MdOutlineEmojiTransportation className={classes.icon1}/>Транспорт та запчастини</div>
<div className={classes.second}><SlEnergy className={classes.icon1}/>Енергетика, нафтопродукти та паливо</div>
<div className={classes.second}><GiMetalBar  className={classes.icon1}/>Метали</div>
<div className={classes.second}><MdOutlineElectricalServices className={classes.icon1}/>Комунальне та побутове обслуговування</div>
<div className={classes.second}><GiTeacher className={classes.icon1}/>Навчання та консалтинг</div>
<div className={classes.second}><TbBuildingPlus className={classes.icon1}/>Нерухомість</div>
<div className={classes.second}><GiVillage className={classes.icon1}/>Сільське господарство</div>
<div className={classes.second}><GiClothes className={classes.icon1}/>Одяг, взуття та текстиль</div>
<div className={classes.second}><LiaIndustrySolid className={classes.icon1}/>Промислове обладнання та прилади</div>
<div className={classes.second}><MdFastfood className={classes.icon1}/>Харчування</div>
<div className={classes.second}><FaPrint className={classes.icon1}/>Поліграфія</div>
<div className={classes.second}><MdOutlineScience className={classes.icon1}/>Науково-дослідні роботи</div>
<div className={classes.second}><MdOutlineOtherHouses className={classes.icon1}/>Різні послуги та товари</div>

        </ul>
        </div>
        <div className={classes.row1}>
          <div className={classes.flex}>
          <h3 className={classes.text1}>Новини</h3>
          <Link to ='/news'>До усіх новин </Link><HiArrowRight className={classes.point} />
          </div>
          <div className={classes.third}>
          <article className={classes.news}>
            <p>14 січня 2025, 12:45</p>
            <Link to = "/news1">793 мільярди через Prozorro: підсумки державних закупівель 2024 року</Link>
            <p>Команда  підбила підсумки 2024 року: 19,21 тис. публічних замовників за підсумками <br/> конкурентних торгів уклали понад 379 тис. договорів на 793,04 млрд грн.  Завдяки конкуренції</p>
          </article>
          <article className={classes.news1}>
          <p>10 січня 2025, 11:10</p>
          <Link to = "/news2">Про відновлення формування довідок з ЄДР в системі </Link>
         
          </article>
          
          <article className={classes.news2}>
          <hr></hr>
          <p>7 січня 2025, 10:23</p>
          <Link to ="/news3">181 мільярд : як минув грудень у публічних закупівлях</Link>
          </article>
          </div>
        </div>
        </div>
      </section>
    )
  }
}

export default mainContent
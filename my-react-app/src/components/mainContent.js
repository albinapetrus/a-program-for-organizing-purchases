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
        <Link to="/ResponsiveTextBlock">
        <img src = '/ukraniantrading1.png' alt='' className={classes.baner} width='1044px' height='100px' /></Link>
        <div className={classes.row}>
        <p className={classes.text}> <strong> Новачок у закупівлях?</strong> Дізнайтеся про перші кроки </p>
        <ul className={classes.firstStepsInfo}>
<div className={classes.first} >    <FaHandHoldingUsd className={classes.icon}  />
         <Link
          to="/ProcurementInfo"
          style={{ textDecoration: 'none', color: 'inherit', backgroundColor:"inherit" }} 
                                                                
        >
       
         Постачальникам
        </Link></div>
<div className={classes.first}><FaBuildingUser className={classes.icon}/> <Link
          to="/CustomerInfo"
          style={{ textDecoration: 'none', color: 'inherit', backgroundColor:"inherit" }} >
          Замовникам
        </Link></div>
<div className={classes.first}><MdOutlinePeopleAlt className={classes.icon}/><Link
          to="/PublicInfo"
          style={{ textDecoration: 'none', color: 'inherit', backgroundColor:"inherit" }} 
        >
       
         Громадськості
        </Link></div> 

        </ul>
        <div className={classes.row1}>
        <h3 className={classes.text1}>Категорії закупівель</h3>
        <ul className={classes.secondStepsInfo}>
<div className={classes.second}><BsBuildingCheck className={classes.icon1}/><Link
          to="/ConstructionInfo"
          style={{ textDecoration: 'none', color: 'inherit', backgroundColor:"inherit" }}
        >
       
        Будівництво
        </Link></div>
<div className={classes.second}>
  <CiMedicalCase className={classes.icon1}/>
  <Link to="/MedicineInfo" style={{ textDecoration: 'none', color: 'inherit', backgroundColor:"inherit" }}>
    Медицина
  </Link>
</div>

<div className={classes.second}>
  <AiTwotoneDatabase className={classes.icon1}/>
  <Link to="/FurnitureInfo" style={{ textDecoration: 'none', color: 'inherit', backgroundColor:"inherit" }}>
    Меблі
  </Link>
</div>

<div className={classes.second}>
  <HiMiniComputerDesktop className={classes.icon1}/>
  <Link to="/ComputerInfo" style={{ textDecoration: 'none', color: 'inherit', backgroundColor:"inherit" }}>
    Комп'ютерна техніка
  </Link>
</div>

<div className={classes.second}>
  <LuScissors className={classes.icon1}/>
  <Link to="/StationeryInfo" style={{ textDecoration: 'none', color: 'inherit', backgroundColor:"inherit" }}>
    Канцелярія та госптовари
  </Link>
</div>

<div className={classes.second}>
  <MdOutlineEmojiTransportation className={classes.icon1}/>
  <Link to="/TransportInfo" style={{ textDecoration: 'none', color: 'inherit', backgroundColor:"inherit" }}>
    Транспорт та запчастини
  </Link>
</div>

<div className={classes.second}>
  <SlEnergy className={classes.icon1}/>
  <Link to="/EnergyInfo" style={{ textDecoration: 'none', color: 'inherit', backgroundColor:"inherit" }}>
    Енергетика, нафтопродукти та паливо
  </Link>
</div>

<div className={classes.second}>
  <GiMetalBar className={classes.icon1}/>
  <Link to="/MetalsInfo" style={{ textDecoration: 'none', color: 'inherit', backgroundColor:"inherit" }}>
    Метали
  </Link>
</div>

<div className={classes.second}>
  <MdOutlineElectricalServices className={classes.icon1}/>
  <Link to="/UtilitiesInfo" style={{ textDecoration: 'none', color: 'inherit', backgroundColor:"inherit" }}>
    Комунальне та побутове обслуговування
  </Link>
</div>

<div className={classes.second}>
  <GiTeacher className={classes.icon1}/>
  <Link to="/EducationInfo" style={{ textDecoration: 'none', color: 'inherit', backgroundColor:"inherit" }}>
    Навчання та консалтинг
  </Link>
</div>

<div className={classes.second}>
  <TbBuildingPlus className={classes.icon1}/>
  <Link to="/RealEstateInfo" style={{ textDecoration: 'none', color: 'inherit', backgroundColor:"inherit" }}>
    Нерухомість
  </Link>
</div>

<div className={classes.second}>
  <GiVillage className={classes.icon1}/>
  <Link to="/AgricultureInfo" style={{ textDecoration: 'none', color: 'inherit', backgroundColor:"inherit" }}>
    Сільське господарство
  </Link>
</div>

<div className={classes.second}>
  <GiClothes className={classes.icon1}/>
  <Link to="/ClothingInfo" style={{ textDecoration: 'none', color: 'inherit', backgroundColor:"inherit" }}>
    Одяг, взуття та текстиль
  </Link>
</div>

<div className={classes.second}>
  <LiaIndustrySolid className={classes.icon1}/>
  <Link to="/EquipmentInfo" style={{ textDecoration: 'none', color: 'inherit', backgroundColor:"inherit" }}>
    Промислове обладнання та прилади
  </Link>
</div>

<div className={classes.second}>
  <MdFastfood className={classes.icon1}/>
  <Link to="/FoodInfo" style={{ textDecoration: 'none', color: 'inherit', backgroundColor:"inherit" }}>
    Харчування
  </Link>
</div>

<div className={classes.second}>
  <FaPrint className={classes.icon1}/>
  <Link to="/PrintingInfo" style={{ textDecoration: 'none', color: 'inherit', backgroundColor:"inherit" }}>
    Поліграфія
  </Link>
</div>

<div className={classes.second}>
  <MdOutlineScience className={classes.icon1}/>
  <Link to="/ResearchInfo" style={{ textDecoration: 'none', color: 'inherit', backgroundColor:"inherit" }}>
    Науково-дослідні роботи
  </Link>
</div>

<div className={classes.second}>
  <MdOutlineOtherHouses className={classes.icon1}/>
  <Link to="/VariousInfo" style={{ textDecoration: 'none', color: 'inherit', backgroundColor:"inherit" }}>
    Різні послуги та товари
  </Link>
</div>


        </ul>
        </div>
        <div className={classes.row1}>
          <div className={classes.flex}>
          <h3 className={classes.text1}>Новини</h3>
          <Link to ='/news' style={{marginBottom:"1em"}}>До усіх новин </Link><HiArrowRight className={classes.point} />
          </div>
          <div className={classes.third}>
          <article className={classes.news}>
            <p>14 січня 2025, 12:45</p>
            <Link to = "/news1">Новий функціонал: Розширений пошук та фільтрація для Постачальників!</Link>
            <p>Ми раді повідомити про запуск оновленого модуля пошуку закупівель!  <br/> Тепер постачальники можуть використовувати ще більше критеріїв для точного підбору актуальних тендерів</p>
          </article>
          <article className={classes.news1}>
          <p>10 січня 2025, 11:10</p>
          <Link to = "/news2">Поради Замовникам: Як створити ефективний запит на закупівлю?</Link>
         
          </article>
          
          <article className={classes.news2}>
          <hr></hr>
          <p>7 січня 2025, 10:23</p>
          <Link to ="/news3">Наша платформа зростає: Вже понад 1000 компаній з нами!</Link>
          </article>
          </div>
        </div>
        </div>
      </section>
    )
  }
}

export default mainContent
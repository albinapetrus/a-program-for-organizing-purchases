import React, { Component } from 'react'; // Імпортуємо Component

// Якщо використовуєш CSS модулі і хочеш їх застосувати, розкоментуй і використовуй відповідні класи
// import classes from './Universal.module.css'

export class CustomerInfo extends Component { // Визначаємо клас для Замовників
  render() { // Класові компоненти використовують метод render()
    const primaryColor = '#2070d1';
    const backgroundColor = '#e0f2f7'; // Світлий відтінок синього для фону
    const textColor = '#333'; // Темніший колір для кращої читабельності

    // Стилі контейнера, скопійовані з ProcurementInfo зі змінами для центрування та ширини
    const containerStyle = {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start', // Залишаємо вирівнювання вмісту по лівому краю
      padding: '20px',
      border: `1px solid ${primaryColor}`,
      borderRadius: '5px',
      backgroundColor: backgroundColor,
      width: '60%', // Ширина 60%
      minWidth: '450px', // Мінімальна ширина
      margin: '5em auto', // Центрування по горизонталі з відступами зверху/знизу
    };

    // Стилі заголовків та тексту, скопійовані з ProcurementInfo
    const titleStyle = {
      fontSize: '1.3em',
      fontWeight: 'bold',
      marginBottom: '15px',
      color: primaryColor,
      backgroundColor: 'inherit', // Залишаємо inherit, якщо фон контейнера задано
    };

    const sectionTitleStyle = {
      fontSize: '1.1em',
      fontWeight: 'bold',
      marginTop: '10px',
      marginBottom: '5px',
      color: primaryColor,
      backgroundColor: 'inherit',
    };

    const textStyle = {
      fontSize: '1em',
      marginBottom: '10px',
      color: textColor,
      lineHeight: '1.5',
      backgroundColor: 'inherit',
    };

    // JSX структура зі зміненим вмістом для Замовників
    return (
      <div style={containerStyle}>
        {/* Головний заголовок для Замовників */}
        <div style={titleStyle}>Закупівлі для Замовників: Створення та Управління</div>

        {/* Секція про створення закупівлі */}
        <div style={sectionTitleStyle}>Створення нової закупівлі</div>
        <p style={textStyle}>
          Як замовник, ви маєте можливість оголошувати власні закупівлі для пошуку необхідних товарів, робіт чи послуг. Чітко сформулюйте назву та опис закупівлі, вкажіть категорію, очікуваний обсяг та бюджет. Не забудьте встановити дату завершення прийому пропозицій та додати всі необхідні супровідні документи.
        </p>

        {/* Секція про перегляд пропозицій */}
        <div style={sectionTitleStyle}>Перегляд та оцінка пропозицій</div>
        <p style={textStyle}>
          Після оголошення закупівлі постачальники зможуть надсилати свої пропозиції. Ви зможете переглядати всі отримані пропозиції в одному місці. Уважно оцінюйте запропоновані ціни, вивчайте коментарі постачальників та аналізуйте завантажені ними документи (комерційні пропозиції, сертифікати тощо).
        </p>

        {/* Секція про прийняття/відхилення пропозицій */}
        <div style={sectionTitleStyle}>Вибір переможця та завершення закупівлі</div>
        <p style={textStyle}>
          Ознайомившись з усіма пропозиціями, ви зможете прийняти найбільш вигідну для вас. Система дозволить вам прийняти одну пропозицію, після чого зазвичай інші автоматично позначаються як відхилені. У разі потреби, ви також можете відхилити небажані пропозиції.
        </p>
         {/* Секція про ключові аспекти */}
         <div style={sectionTitleStyle}>Важливі рекомендації</div>
         <p style={textStyle}>
             Пам'ятайте про необхідність дотримання термінів та прозорості процесу. Взаємодійте з постачальниками, якщо виникають питання щодо їхніх пропозицій. Чітке та повне оголошення закупівлі значно підвищує шанси на отримання якісних та конкурентних пропозицій.
         </p>
      </div>
    );
  }
}

export default CustomerInfo;
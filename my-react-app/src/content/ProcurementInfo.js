import React, { Component } from 'react'; // Імпортуємо Component

// Назви стилів можна залишити або перенести в окремий CSS файл, як у тебе з Universal.module.css
// Для цього прикладу залишимо їх всередині компонента
// import classes from './Universal.module.css' // Якщо стилі в CSS модулі

export class ProcurementInfo extends Component { // Визначаємо клас, який наслідується від Component
  render() { // Класові компоненти використовують метод render()
    const primaryColor = '#2070d1';
    const backgroundColor = '#e0f2f7'; // Світлий відтінок синього для фону
    const textColor = '#333'; // Темніший колір для кращої читабельності

    const containerStyle = {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      padding: '20px',
      border: `1px solid ${primaryColor}`,
      borderRadius: '5px',
      backgroundColor: backgroundColor,
      // !!! ЗМІНЕНО: Центрування та встановлення ширини !!!
      // maxWidth: '450px', // Прибираємо фіксований maxWidth
      width: '60%', // Встановлюємо ширину 60%
      minWidth: '450px', // Опціонально: можна додати minWidth, щоб блок не ставав занадто вузьким на маленьких екранах
      margin: '5em auto', // Встановлюємо верхній/нижній margin 20px, а лівий/правий auto для центрування
      // !!! КІНЕЦЬ ЗМІН !!!
    };

    const titleStyle = {
      fontSize: '1.3em',
      fontWeight: 'bold',
      marginBottom: '15px',
      color: primaryColor,
      backgroundColor: 'inherit',
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

    // JSX структура залишається всередині render()
    return (
      <div style={containerStyle}>
        <div style={titleStyle}>Закупівлі: Перші кроки та інформація</div>

        <div style={sectionTitleStyle}>Новачкам у закупівлях</div>
        <p style={textStyle}>
          Якщо ви вперше берете участь у закупівлях, важливо ознайомитися з основними принципами та процедурами. Розберіться з типами закупівель, електронними майданчиками та необхідною документацією. Зверніть увагу на вимоги до учасників та критерії оцінки пропозицій.
        </p>

        <div style={sectionTitleStyle}>Інформація для постачальників</div>
        <p style={textStyle}>
          Постачальникам необхідно ретельно вивчати оголошення про закупівлі, щоб розуміти потреби замовників та вимоги до товарів/послуг. Підготуйте повний та відповідний пакет документів, а також конкурентоспроможну цінову пропозицію. Слідкуйте за оновленнями та змінами в закупівлях, які вас цікавлять.
        </p>

        <div style={sectionTitleStyle}>Ключові аспекти участі</div>
        <p style={textStyle}>
          Участь у закупівлях вимагає уважності до деталей та дотримання встановлених правил. Важливо вчасно подавати свої пропозиції та бути готовим надати необхідні роз'яснення або додаткову інформацію на запит замовника. Чесність та прозорість є запорукою успішної співпраці.
        </p>
      </div>
    );
  }
}

export default ProcurementInfo;
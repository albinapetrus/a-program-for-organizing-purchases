import React, { Component } from 'react';

export class PublicInfo extends Component {
  render() {
    const primaryColor = '#2070d1';
    const backgroundColor = '#e0f2f7';
    const textColor = '#333';

    const containerStyle = {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      padding: '20px',
      border: `1px solid ${primaryColor}`,
      borderRadius: '5px',
      backgroundColor: backgroundColor,
      width: '60%',
      margin: '5em auto',
    };

    const titleStyle = {
      fontSize: '1.3em',
      fontWeight: 'bold',
      marginBottom: '1em',
      color: primaryColor,
      backgroundColor: 'inherit',
    };

    const sectionTitleStyle = {
      fontSize: '1.1em',
      fontWeight: 'bold',
      marginTop: '1em',
      marginBottom: '0.2em',
      color: primaryColor,
      backgroundColor: 'inherit',
    };

    const textStyle = {
      fontSize: '1em',
      marginBottom: '2em',
      color: textColor,
      lineHeight: '1.5',
      backgroundColor: 'inherit',
    };

    return (
      <div style={containerStyle}>
        <div style={titleStyle}>Публічний доступ та прозорість закупівель</div>

        <div style={sectionTitleStyle}>Важливість прозорості</div>
        <p style={textStyle}>
          Прозорість у системі закупівель є ключовим елементом довіри та
          ефективності. Публічний доступ до інформації про оголошені закупівлі,
          подані пропозиції та результати тендерів дозволяє контролювати процес,
          запобігати корупції та забезпечувати справедливу конкуренцію між
          постачальниками.
        </p>

        <div style={sectionTitleStyle}>
          Як громадськість може отримати інформацію
        </div>
        <p style={textStyle}>
          Вся інформація про закупівлі є відкритою та доступною для
          громадськості. Ви можете переглядати деталі оголошень, умови участі,
          список учасників та їхні пропозиції, а також інформацію про прийняте
          рішення та обраного переможця. Це дозволяє кожному бажаючому
          здійснювати моніторинг закупівель.
        </p>

        <div style={sectionTitleStyle}>Роль громадського контролю</div>
        <p style={textStyle}>
          Громадський контроль відіграє важливу роль у забезпеченні чесності та
          ефективності закупівель. Якщо ви помітили порушення або маєте сумніви
          щодо законності певних дій, ви маєте право звернутися зі запитом або
          скаргою до відповідних органів або організацій, які займаються
          моніторингом закупівель.
        </p>
        <div style={sectionTitleStyle}>Переваги для суспільства</div>
        <p style={textStyle}>
          Відкритість та активна участь громадськості у моніторингу закупівель
          сприяє більш раціональному використанню бюджетних коштів, підвищенню
          якості товарів та послуг, що закуповуються, а також загальному
          зміцненню принципів демократії та підзвітності влади.
        </p>
      </div>
    );
  }
}

export default PublicInfo;

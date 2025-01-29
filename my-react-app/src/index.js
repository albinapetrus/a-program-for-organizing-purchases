import React from 'react';
import ReactDOM from 'react-dom/client';
import classes from './index.module.css';
//import App from './App';
import Header from './components/header';
import Section1 from './components/section1';
import MainContent from './components/mainContent';
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <div className={classes.render}>
    <React.StrictMode>
    <Header />

    <Section1/>
    <MainContent/>
   </React.StrictMode>
   </div>
);



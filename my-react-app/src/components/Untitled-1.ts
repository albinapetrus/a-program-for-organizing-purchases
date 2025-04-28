import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import classes from "./index.module.css";
import Header from "./components/header";
import Section1 from "./components/section1";
import MainContent from "./components/mainContent";
import Footer from "./components/footer";
import News from "./pages/News"; // Правильний імпорт

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Router> {/* Додаємо BrowserRouter */}
      <div className={classes.render}>
        <Header />
        <Routes> {/* Routes всередині Router */}
          <Route path="/" element={<>
            <Section1 />
            <MainContent />
            <Footer />
          </>} />
          <Route path="/news" element={<News />} /> {/* Правильний шлях */}
        </Routes>
      </div>
    </Router>
  </React.StrictMode>
);

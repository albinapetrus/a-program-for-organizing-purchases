import { useContext, useEffect, useState } from "react";
import { SideMenuContext } from "./SideMenuContext";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import classes from "./index.module.css";
import Header from "./components/header";
import Section1 from "./components/section1";
import MainContent from "./components/mainContent";
import Footer from "./components/footer";
import News from "./pages/News"; 
import News1 from "./pages/news1";
import News2 from "./pages/news2";
import News3 from "./pages/news3";
import News4 from "./pages/news4";
import News5 from "./pages/news5";
import News6 from "./pages/news6";
import Market from "./categories/market";
import Salers from "./categories/salers";
import Infobox from "./categories/infobox";
import Local from "./categories/local";
import Auth from "./components/auth";
import Form from "./components/form";
import Auth2 from "./components/auth2";
import Auth3 from "./components/auth3";
import Auth4 from "./components/auth4";
import SideMenu from "./inner/SideMenu"; 
import NewOne from "./customer/newOne"; 
import MyPurch from "./customer/myPurch"; 
import CabinetCust from "./customer/cabinetCust"; 

function App() {
  const { isSideMenuOpen, setIsSideMenuOpen } = useContext(SideMenuContext); 
  const [isRegistered, setIsRegistered] = useState(false);
  useEffect(() => {
    const registrationStatus = localStorage.getItem('isRegistered') === 'true';
    setIsRegistered(registrationStatus);
    setIsSideMenuOpen(registrationStatus);  // якщо зареєстровано — відкриваємо меню
  }, [setIsSideMenuOpen]);
  return (
    <Router> 
      <div className={classes.render}>
      {!isSideMenuOpen && <Header />}
      {isSideMenuOpen && <SideMenu/>}
        {/*<Header />*/}
        <Routes> 
          <Route path="/" element={
            
               <>
                 
            <Section1 />
            <MainContent />
          </>} />
          <Route path="/news" element={<News />} /> 
          <Route path="/news1" element={<News1 />} /> 
          <Route path="/news2" element={<News2 />} /> 
          <Route path="/news3" element={<News3 />} /> 
          <Route path="/news4" element={<News4 />} /> 
          <Route path="/news5" element={<News5 />} /> 
          <Route path="/news6" element={<News6 />} /> 
          <Route path="/market" element={<Market />} /> 
          <Route path="/salers" element={<Salers />} /> 
          <Route path="/infobox" element={<Infobox />} /> 
          <Route path="/local" element={<Local />} /> 
          <Route path="/auth" element={<Auth />} /> 
          <Route path="/form" element={<Form />} /> 
          <Route path="/auth2" element={<Auth2 />} />
          <Route path="/auth3" element={<Auth3 />} />
          <Route path="/auth4" element={<Auth4 />} />
          <Route path="/newOne" element={<NewOne />} />
          <Route path="/myPurch" element={<MyPurch />} />
          <Route path="/cabinetCust" element={<CabinetCust />} />
        </Routes>
        {!isSideMenuOpen && <Footer />}
      </div>
    </Router>
  );
}

export default App;


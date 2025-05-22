// src/App.js

import React from 'react'; // Обов'язково імпортувати React
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import classes from "./index.module.css";

// Імпорти ваших компонентів (не обрізаю їх)
import Header from "./components/header";
import MyOffersPage from './supplier/MyOffersPage';
import Section1 from "./components/section1";
import MainContent from "./components/mainContent";
import Footer from "./components/footer";
import News from "./pages/News";
import MyProcurementsPage from './customer/MyProcurementsPage';
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
import SideMenu from "./inner/SideMenu"; // Шлях до SideMenu
import NewOne from "./customer/newOne";
import MyPurch from "./customer/myPurch";
import CabinetCust from "./customer/cabinetCust";
import ProcurementInfo from "./content/ProcurementInfo"
import CustomerInfo from "./content/CustomerInfo"
import PublicInfo from "./content/PublicInfo"
import ConstructionInfo from "./content/categories/ConstructionInfo"
import MedicineInfo from "./content/categories/MedicineInfo";
import FurnitureInfo from "./content/categories/FurnitureInfo";
import ComputerInfo from "./content/categories/ComputerInfo";
import OfferCreationPage from "./supplier/OfferCreation";
import StationeryInfo from "./content/categories/StationeryInfo";
import TransportInfo from "./content/categories/TransportInfo";
import EnergyInfo from "./content/categories/EnergyInfo";
import MetalsInfo from "./content/categories/MetalsInfo";
import UtilitiesInfo from "./content/categories/UtilitiesInfo";
import EducationInfo from "./content/categories/EducationInfo";
import RealEstateInfo from "./content/categories/RealEstateInfo";
import CustomerOffersPage from './customer/CustomerOffersPage';
import AgricultureInfo from "./content/categories/AgricultureInfo";
import ClothingInfo from "./content/categories/ClothingInfo";
import EquipmentInfo from "./content/categories/EquipmentInfo";
import FoodInfo from "./content/categories/FoodInfo";
import PrintingInfo from "./content/categories/PrintingInfo";
import ResearchInfo from "./content/categories/ResearchInfo";
import VariousInfo from "./content/categories/VariousInfo";
import ResponsiveTextBlock from "./content/categories/ResponsiveTextBlock";
import ProcurementSearch from "./supplier/ProcurementSearch";
// !!! Обов'язково імпортуйте AuthProvider та useAuth !!!
import { AuthProvider, useAuth } from './context/AuthContext';


// Це компонент, який містить основний вміст вашого додатку.
// Він обгорнутий у <AuthProvider>, тому може використовувати useAuth().
function AppContent() {
  // Отримуємо стан автентифікації з AuthContext
  const { isAuthenticated, loading } = useAuth();

  // Логіка умовного рендерингу для Header/Footer та SideMenu
  // Header та Footer відображаються, якщо користувач НЕ автентифікований
  const showHeaderFooter = !isAuthenticated;
  // SideMenu відображається, якщо користувач АВТЕНТИФІКОВАНИЙ
  const showSideMenu = isAuthenticated; // Можна додати && !loading, якщо SideMenu має чекати завантаження

  // Якщо дані контексту ще завантажуються, або якщо ви хочете
  // приховати весь UI до визначення статусу
  if (loading) {
    return (
      <div className={classes.loadingScreen}>
        <p>Завантаження даних...</p>
        {/* Можливо, тут якийсь спінер */}
      </div>
    );
  }

  return (
    <div className={classes.render}>
      {/* Рендеримо Header, якщо showHeaderFooter є true */}
      {showHeaderFooter && <Header />}

      {/* Рендеримо SideMenu, якщо showSideMenu є true */}
      {showSideMenu && <SideMenu />}

      {/* Основний вміст маршрутів */}
      <Routes>
        <Route path="/" element={
          <>
            
            <MainContent />
          </>}
        />
        {/* Всі ваші інші маршрути тут */}
        <Route path="/news" element={<News />} />
        <Route path="/myoffers" element={<MyOffersPage/>} />
        <Route path="/customeroffers" element={<CustomerOffersPage/>} />
        <Route path="/myprocurements" element={<MyProcurementsPage/>} />
        <Route path= "/ProcurementSearch" element = {<ProcurementSearch />} />
        <Route path= "/offercreate" element = {<OfferCreationPage/>} />
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
        <Route path="/ProcurementInfo" element={<ProcurementInfo/>} />
        <Route path="/CustomerInfo" element={<CustomerInfo/>} />
        <Route path="/PublicInfo" element={<PublicInfo/>} />
        <Route path="/ConstructionInfo" element={<ConstructionInfo/>} />
        <Route path="/MedicineInfo" element={<MedicineInfo />} />
        <Route path="/FurnitureInfo" element={<FurnitureInfo />} />
        <Route path="/ComputerInfo" element={<ComputerInfo />} />
        <Route path="/StationeryInfo" element={<StationeryInfo />} />
        <Route path="/TransportInfo" element={<TransportInfo />} />
        <Route path="/EnergyInfo" element={<EnergyInfo />} />
        <Route path="/MetalsInfo" element={<MetalsInfo />} />
        <Route path="/UtilitiesInfo" element={<UtilitiesInfo />} />
        <Route path="/EducationInfo" element={<EducationInfo />} />
        <Route path="/RealEstateInfo" element={<RealEstateInfo />} />
        <Route path="/AgricultureInfo" element={<AgricultureInfo />} />
        <Route path="/ClothingInfo" element={<ClothingInfo />} />
        <Route path="/EquipmentInfo" element={<EquipmentInfo />} />
        <Route path="/FoodInfo" element={<FoodInfo />} />
        <Route path="/PrintingInfo" element={<PrintingInfo />} />
        <Route path="/ResearchInfo" element={<ResearchInfo />} />
        <Route path="/VariousInfo" element={<VariousInfo />} />
        <Route path="/ResponsiveTextBlock" element={<ResponsiveTextBlock />} />
      </Routes>

      {/* Рендеримо Footer, якщо showHeaderFooter є true */}
      {showHeaderFooter && <Footer />}
    </div>
  );
}

// Головний компонент App, який обгортає все в AuthProvider та Router
function App() {
  return (
    <AuthProvider> {/* <--- ЦЕЙ ОБГОРТКА КРИТИЧНО ВАЖЛИВА! */}
      <Router>
        <AppContent /> {/* AppContent містить увесь ваш UI, який потребує AuthContext */}
      </Router>
    </AuthProvider>
  );
}

export default App;


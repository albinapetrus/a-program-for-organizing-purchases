import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import classes from './index.module.css';
import Header from './components/header';
import MyOffersPage from './supplier/MyOffersPage';
import MainContent from './components/mainContent';
import Footer from './components/footer';
import News from './pages/News';
import MyProcurementsPage from './customer/MyProcurementsPage';
import News1 from './pages/news1';
import News2 from './pages/news2';
import News3 from './pages/news3';
import News4 from './pages/news4';
import News5 from './pages/news5';
import Market from './categories/market';
import Salers from './categories/salers';
import Infobox from './categories/infobox';
import Local from './categories/local';
import Auth from './components/auth';
import Form from './components/form';
import Auth2 from './components/auth2';
import Auth3 from './components/auth3';
import Auth4 from './components/auth4';
import SideMenu from './inner/SideMenu';
import NewOne from './customer/newOne';
import CabinetCust from './customer/cabinetCust';
import ProcurementInfo from './content/ProcurementInfo';
import CustomerInfo from './content/CustomerInfo';
import PublicInfo from './content/PublicInfo';
import ConstructionInfo from './content/categories/ConstructionInfo';
import MedicineInfo from './content/categories/MedicineInfo';
import FurnitureInfo from './content/categories/FurnitureInfo';
import ComputerInfo from './content/categories/ComputerInfo';
import OfferCreationPage from './supplier/OfferCreation';
import StationeryInfo from './content/categories/StationeryInfo';
import TransportInfo from './content/categories/TransportInfo';
import EnergyInfo from './content/categories/EnergyInfo';
import MetalsInfo from './content/categories/MetalsInfo';
import UtilitiesInfo from './content/categories/UtilitiesInfo';
import EducationInfo from './content/categories/EducationInfo';
import RealEstateInfo from './content/categories/RealEstateInfo';
import CustomerOffersPage from './customer/CustomerOffersPage';
import AgricultureInfo from './content/categories/AgricultureInfo';
import ClothingInfo from './content/categories/ClothingInfo';
import EquipmentInfo from './content/categories/EquipmentInfo';
import FoodInfo from './content/categories/FoodInfo';
import PrintingInfo from './content/categories/PrintingInfo';
import ResearchInfo from './content/categories/ResearchInfo';
import VariousInfo from './content/categories/VariousInfo';
import ResponsiveTextBlock from './content/categories/ResponsiveTextBlock';
import ProcurementSearch from './supplier/ProcurementSearch';
import { AuthProvider, useAuth } from './context/AuthContext';
import PrincipleOfWorkInfo from './content/PrincipleOfWorkInfo';
import ForParticipantsInfo from './content/ForParticipantsInfo';
import ForDevelopersInfo from './content/ForDevelopersInfo';
import ParticipantProtectionInfo from './content/ParticipantProtectionInfo';

function AppContent() {
  const { isAuthenticated, loading, user } = useAuth();
  console.log(
    'AppContent: рендер. isAuthenticated:',
    isAuthenticated,
    'loading:',
    loading,
    'user:',
    user
  );
  const showHeaderFooter = !isAuthenticated;
  const showSideMenu = isAuthenticated;

  if (loading) {
    return (
      <div className={classes.loadingScreen}>
        <p>Завантаження даних...</p>
      </div>
    );
  }

  return (
    <div className={classes.render}>
      {showHeaderFooter && <Header />}

      {showSideMenu && <SideMenu />}

      <Routes>
        <Route
          path="/"
          element={
            <>
              <MainContent />
            </>
          }
        />
        <Route path="/news" element={<News />} />
        <Route path="/myoffers" element={<MyOffersPage />} />
        <Route path="/customeroffers" element={<CustomerOffersPage />} />
        <Route path="/myprocurements" element={<MyProcurementsPage />} />
        <Route path="/ProcurementSearch" element={<ProcurementSearch />} />
        <Route path="/offercreate" element={<OfferCreationPage />} />
        <Route path="/news1" element={<News1 />} />
        <Route path="/news2" element={<News2 />} />
        <Route path="/news3" element={<News3 />} />
        <Route path="/news4" element={<News4 />} />
        <Route path="/news5" element={<News5 />} />
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
        <Route path="/cabinetCust" element={<CabinetCust />} />
        <Route path="/ProcurementInfo" element={<ProcurementInfo />} />
        <Route path="/CustomerInfo" element={<CustomerInfo />} />
        <Route path="/PublicInfo" element={<PublicInfo />} />
        <Route path="/ConstructionInfo" element={<ConstructionInfo />} />
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
        <Route
          path="/my-procurements/:procurementId/offers"
          element={<CustomerOffersPage />}
        />
        <Route path="/principle-of-work" element={<PrincipleOfWorkInfo />} />
        <Route path="/for-participants" element={<ForParticipantsInfo />} />
        <Route path="/for-developers" element={<ForDevelopersInfo />} />
        <Route
          path="/participant-protection"
          element={<ParticipantProtectionInfo />}
        />
      </Routes>
      {showHeaderFooter && <Footer />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;

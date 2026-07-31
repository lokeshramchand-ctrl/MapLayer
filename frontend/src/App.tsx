import './App.css';
import { useState } from 'react';
import OpenLayerMap from './components/OpenLayerMap';
import OpenLayerEsri from './components/OpenLayerEsri';
import LegiScanAPI from './components/LegiScanAPI';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LandingPage from './components/LandingPage';

function App() {
  const [addressData, setAddressData] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const handleSearchSuccess = (data: any, term: string) => {
    setAddressData(data);
    setSearchTerm(term);
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage onSearchSuccess={handleSearchSuccess} />} />
        <Route path="/open" element={<OpenLayerMap initialAddressData={addressData} initialTerm={searchTerm} />} />
        <Route path="/esri" element={<OpenLayerEsri />} />
        <Route path="/legi" element={<LegiScanAPI />} />
      </Routes>
    </Router>
  );
}

export default App;
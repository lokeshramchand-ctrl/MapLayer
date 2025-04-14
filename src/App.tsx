import { useState } from 'react'
import './App.css'
import OpenLayerMap from './components/OpenLayerMap';
import LegiScanAPI from './components/LegiScanAPI';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

function App() {

  //return <OpenLayerMap /> 
	//o
return (
    <Router>
    <Routes>
        <Route exact path="/" element={<OpenLayerMap />} />
        <Route exact path="/legi" element={<LegiScanAPI />} />
    </Routes>
    </Router>
  );
}

export default App

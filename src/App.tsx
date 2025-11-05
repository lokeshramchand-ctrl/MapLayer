
import './App.css'
import OpenLayerMap from './components/OpenLayerMap';
// import OpenLayerEsri from './components/OpenLayerEsri';
// import LegiScanAPI from './components/LegiScanAPI';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

function App() {

	
return (
    <Router>
    <Routes>
        <Route path="/" element={<OpenLayerMap />} />
        <Route path="/open" element={<OpenLayerMap />} />
        {/* <Route path="/esri" element={<OpenLayerEsri />} />
        <Route path="/legi" element={<LegiScanAPI />} /> */}
    </Routes>
    </Router>
  );
}

export default App;

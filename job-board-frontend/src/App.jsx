import { Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import AddJob from "./components/AddJob";
import JobDetails from "./components/JobDetails";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/add-job" element={<AddJob />} />
      <Route path="/job/:id" element={<JobDetails />} />
    </Routes>
  );
}

export default App;

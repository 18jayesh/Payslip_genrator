import { Toaster } from "react-hot-toast";
import { Routes, Route } from "react-router-dom";

import Login from "./components/Login";
import Dashboard from "./pages/Dashboard";
import CreateCompany from "./pages/CreateCompany";
import AddEmployee from "./pages/AddEmployee";
import EmployeePreview from "./pages/EmployeePreview";
import EditCompany from "./pages/EditCompany";
import ManageEmployees from "./pages/ManageEmployees";
import Templates from "./pages/Templates";

function App() {
  return (
    <>
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          duration: 3000,
        }}
      />

      <Routes>
        {/* Login */}
        <Route path="/" element={<Login />} />

        {/* Dashboard */}
        <Route path="/Dashboard" element={<Dashboard />} />

        {/* Company */}
        <Route path="/CreateCompany" element={<CreateCompany />} />

        <Route
          path="/EditCompany/:companyId"
          element={<EditCompany />}
        />

        {/* Employee */}
        <Route
          path="/AddEmployee/:companyId"
          element={<AddEmployee />}
        />

        {/* Payslip Preview */}
        <Route
          path="/EmployeePreview/:employeeId"
          element={<EmployeePreview />}
        />
        <Route
            path="/ManageEmployees"
            element={<ManageEmployees />}
        />
        <Route
            path="/Templates"
            element={<Templates />}
        />
      </Routes>
    </>
  );
}

export default App;
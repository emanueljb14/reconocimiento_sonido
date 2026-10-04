import {
    Navigate,
    Route,
    Routes,
} from "react-router-dom";

import ProtectedRoute from "./components/layout/ProtectedRoute";

/* =========================================
   AUTENTICACIÓN
========================================= */
import SplashScreen from "./pages/auth/SplashScreen";
import Login from "./pages/auth/Login";
import FaceLogin from "./pages/auth/FaceLogin";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";

/* =========================================
   ADMINISTRADOR
========================================= */
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminDetections from "./pages/admin/AdminDetections";
import AdminHistory from "./pages/admin/AdminHistory";
import AdminStatistics from "./pages/admin/AdminStatistics";
import AIModel from "./pages/admin/AIModel";
import Users from "./pages/admin/Users";
import VoiceAssistant from "./pages/admin/VoiceAssistant";
import AdminSettings from "./pages/admin/Settings";

/* =========================================
   SUPERVISOR
========================================= */
import SupervisorDashboard from "./pages/supervisor/SupervisorDashboard";
import SupervisorDetections from "./pages/supervisor/SupervisorDetections";
import SupervisorHistory from "./pages/supervisor/SupervisorHistory";
import SupervisorStatistics from "./pages/supervisor/SupervisorStatistics";
import SupervisorSettings from "./pages/supervisor/Settings";

/* =========================================
   USUARIO
========================================= */
import UserDashboard from "./pages/user/UserDashboard";
import UserDetections from "./pages/user/UserDetections";
import UserHistory from "./pages/user/UserHistory";
import UserStatistics from "./pages/user/UserStatistics";
import UserSettings from "./pages/user/Settings";

function Proteger({ roles, children }) {
    return (
        <ProtectedRoute roles={roles}>
            {children}
        </ProtectedRoute>
    );
}

export default function App() {
    return (
        <Routes>
            {/* PANTALLA INICIAL */}
            <Route path="/" element={<SplashScreen />} />

            {/* AUTENTICACIÓN */}
            <Route path="/login" element={<Login />} />
            <Route path="/login-facial" element={<FaceLogin />} />
            <Route path="/registro" element={<Register />} />
            <Route path="/register" element={<Register />} />
            <Route path="/recuperar-password" element={<ForgotPassword />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* ADMINISTRADOR */}
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/admin/dashboard" element={<Proteger roles={["admin"]}><AdminDashboard /></Proteger>} />
            <Route path="/admin/detecciones" element={<Proteger roles={["admin"]}><AdminDetections /></Proteger>} />
            <Route path="/admin/historial" element={<Proteger roles={["admin"]}><AdminHistory /></Proteger>} />
            <Route path="/admin/estadisticas" element={<Proteger roles={["admin"]}><AdminStatistics /></Proteger>} />
            <Route path="/admin/modelo-ia" element={<Proteger roles={["admin"]}><AIModel /></Proteger>} />
            <Route path="/admin/usuarios" element={<Proteger roles={["admin"]}><Users /></Proteger>} />
            <Route path="/admin/asistente" element={<Proteger roles={["admin"]}><VoiceAssistant /></Proteger>} />
            <Route path="/admin/configuracion" element={<Proteger roles={["admin"]}><AdminSettings /></Proteger>} />

            {/* SUPERVISOR */}
            <Route path="/supervisor" element={<Navigate to="/supervisor/dashboard" replace />} />
            <Route path="/supervisor/dashboard" element={<Proteger roles={["supervisor"]}><SupervisorDashboard /></Proteger>} />
            <Route path="/supervisor/detecciones" element={<Proteger roles={["supervisor"]}><SupervisorDetections /></Proteger>} />
            <Route path="/supervisor/historial" element={<Proteger roles={["supervisor"]}><SupervisorHistory /></Proteger>} />
            <Route path="/supervisor/estadisticas" element={<Proteger roles={["supervisor"]}><SupervisorStatistics /></Proteger>} />
            <Route path="/supervisor/configuracion" element={<Proteger roles={["supervisor"]}><SupervisorSettings /></Proteger>} />

            {/* USUARIO */}
            <Route path="/user" element={<Navigate to="/user/dashboard" replace />} />
            <Route path="/usuario" element={<Navigate to="/user/dashboard" replace />} />
            <Route path="/user/dashboard" element={<Proteger roles={["user"]}><UserDashboard /></Proteger>} />
            <Route path="/user/detecciones" element={<Proteger roles={["user"]}><UserDetections /></Proteger>} />
            <Route path="/user/historial" element={<Proteger roles={["user"]}><UserHistory /></Proteger>} />
            <Route path="/user/estadisticas" element={<Proteger roles={["user"]}><UserStatistics /></Proteger>} />
            <Route path="/user/configuracion" element={<Proteger roles={["user"]}><UserSettings /></Proteger>} />

            {/* RUTA NO ENCONTRADA */}
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
}
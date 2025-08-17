import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { ThemeProvider } from "./components/ui/theme-provider"
import { Toaster } from "./components/ui/toaster"
import { AuthProvider } from "./contexts/AuthContext"
import { Login } from "./pages/Login"
import { Register } from "./pages/Register"
import { ProtectedRoute } from "./components/ProtectedRoute"
import { DashboardLayout } from "./components/DashboardLayout"
import { Dashboard } from "./pages/Dashboard"
import { FileUpload } from "./pages/FileUpload"
import { UrlScraping } from "./pages/UrlScraping"
import { ManualEntry } from "./pages/ManualEntry"
import { BotConfiguration } from "./pages/BotConfiguration"
import { Analytics } from "./pages/Analytics"
import { BlankPage } from "./pages/BlankPage"

function App() {
  return (
    <AuthProvider>
      <ThemeProvider defaultTheme="light" storageKey="ui-theme">
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="files" element={<FileUpload />} />
              <Route path="urls" element={<UrlScraping />} />
              <Route path="manual" element={<ManualEntry />} />
              <Route path="bot-config" element={<BotConfiguration />} />
              <Route path="analytics" element={<Analytics />} />
            </Route>
            <Route path="*" element={<BlankPage />} />
          </Routes>
        </Router>
        <Toaster />
      </ThemeProvider>
    </AuthProvider>
  )
}

export default App
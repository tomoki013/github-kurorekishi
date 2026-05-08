import { useEffect } from "react";
import { Routes, Route, useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import { TopPage } from "./pages/TopPage";
import { ResultPage } from "./pages/ResultPage";
import { SecurityPage } from "./pages/SecurityPage";
import { LanguageProvider, useLanguage } from "./i18n";

function MainPage() {
  const { user, loading, logout } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Handle ?login=success — clean up the URL
  useEffect(() => {
    if (searchParams.get("login") === "success") {
      navigate("/", { replace: true });
    }
  }, [searchParams, navigate]);

  const { t } = useLanguage();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-gray-400 text-sm animate-pulse">{t.loading}</div>
      </div>
    );
  }

  if (user) {
    return <ResultPage user={user} onLogout={logout} />;
  }

  return <TopPage />;
}

export function App() {
  return (
    <LanguageProvider>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/security" element={<SecurityPage />} />
      </Routes>
    </LanguageProvider>
  );
}

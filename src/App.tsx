import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import { hasCompletedOnboarding } from "./data/onboarding";
import { BusinessDashboardPage } from "./pages/BusinessDashboardPage";
import { BusinessProfilePage } from "./pages/BusinessProfilePage";
import { BoardPage } from "./pages/BoardPage";
import { ExplorePage } from "./pages/ExplorePage";
import { HomePage } from "./pages/HomePage";
import { OnboardingPage } from "./pages/OnboardingPage";
import { PlaceDetailPage } from "./pages/PlaceDetailPage";
import { PlanDetailPage } from "./pages/PlanDetailPage";
import { PlansPage } from "./pages/PlansPage";
import { ProfilePage } from "./pages/ProfilePage";
import { SavedPage } from "./pages/SavedPage";
import { SearchPage } from "./pages/SearchPage";

function RequireOnboarding() {
  return hasCompletedOnboarding() ? <AppShell /> : <Navigate to="/onboarding" replace />;
}

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to={hasCompletedOnboarding() ? "/home" : "/onboarding"} replace />} />
      <Route element={<RequireOnboarding />}>
        <Route path="/home" element={<HomePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/saved" element={<SavedPage />} />
        <Route path="/saved/places" element={<BoardPage />} />
        <Route path="/saved/boards/:boardId" element={<BoardPage />} />
        <Route path="/plans" element={<PlansPage />} />
        <Route path="/plans/:planId" element={<PlanDetailPage />} />
        <Route path="/place/:placeId" element={<PlaceDetailPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/business" element={<BusinessDashboardPage />} />
        <Route path="/business/profile" element={<BusinessProfilePage />} />
      </Route>
      <Route path="/onboarding/*" element={<OnboardingPage />} />
    </Routes>
  );
}

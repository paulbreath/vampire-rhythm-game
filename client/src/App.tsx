import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Game from "./pages/Game";
import NewEquipment from "./pages/NewEquipment";
import MapSelection from "./pages/MapSelection";
import Leaderboard from "./pages/Leaderboard";
import AnimationTest from "./pages/AnimationTest";


function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/game"} component={Game} />
      <Route path={"/map"} component={MapSelection} />
      <Route path={"/equipment"} component={NewEquipment} />
      <Route path={"/leaderboard"} component={Leaderboard} />
      <Route path={"/animation-test"} component={AnimationTest} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="dark"
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

import { useEffect } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/Home";
import LevelSelect from "@/pages/LevelSelect";
import Game from "@/pages/Game";
import Skins from "@/pages/Skins";
import EndlessGame from "@/pages/EndlessGame";
import NotFound from "@/pages/not-found";
import { soundManager } from "@/game/sound";

const queryClient = new QueryClient();

function MusicBootstrap() {
  useEffect(() => {
    soundManager.loadMusic("/music-home.mp3");
    soundManager.loadSfx("btn", "/sfx-btn.mp3", 4, 1.3);
    const tryPlay = () => {
      soundManager.playMusic();
      document.removeEventListener("pointerdown", tryPlay);
      document.removeEventListener("keydown", tryPlay);
      document.removeEventListener("touchstart", tryPlay);
    };
    document.addEventListener("pointerdown", tryPlay);
    document.addEventListener("keydown", tryPlay);
    document.addEventListener("touchstart", tryPlay);
    return () => {
      document.removeEventListener("pointerdown", tryPlay);
      document.removeEventListener("keydown", tryPlay);
      document.removeEventListener("touchstart", tryPlay);
    };
  }, []);
  return null;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/levels" component={LevelSelect} />
      <Route path="/game/:level">
        {(params: { level: string }) => <Game key={params?.level} />}
      </Route>
      <Route path="/skins" component={Skins} />
      <Route path="/endless" component={EndlessGame} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <MusicBootstrap />
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

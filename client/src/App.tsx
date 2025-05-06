import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import WebComponentDemo from "@/pages/web-component-demo";

function Router() {
  return (
    <Switch>
      <Route path="/midi-lyrics-generator/" component={Home} />
      <Route path="/" component={Home} />
      <Route path="/web-component" component={WebComponentDemo} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;

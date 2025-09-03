import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Layout from "./pages/Layout";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Index />} />
            <Route path="cases" element={<div className="p-6">Browse Cases - Coming Soon</div>} />
            <Route path="needy" element={<div className="p-6">Needy Management - Coming Soon</div>} />
            <Route path="case-management" element={<div className="p-6">Case Management - Coming Soon</div>} />
            <Route path="donors" element={<div className="p-6">Donor Relations - Coming Soon</div>} />
            <Route path="reports" element={<div className="p-6">Reports - Coming Soon</div>} />
            <Route path="financial" element={<div className="p-6">Financial - Coming Soon</div>} />
            <Route path="requests" element={<div className="p-6">Requests - Coming Soon</div>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

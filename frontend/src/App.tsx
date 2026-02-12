import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import ProtectedRoute from "./components/ProtectedRoute";
import { PostProvider } from "./context/PostContext";
import GlobalChatListener from "./components/chat/GlobalChatListener";
import { Loader2 } from "lucide-react";
import ErrorBoundary from "@/components/ErrorBoundary";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

// Lazy Load Pages
const Index = lazy(() => import("./pages/Index"));
const Profile = lazy(() => import("./pages/Profile"));
const Community = lazy(() => import("./pages/Community"));
const Chats = lazy(() => import("./pages/Chats"));
const NotFound = lazy(() => import("./pages/NotFound"));
const CreatePost = lazy(() => import("./pages/CreatePost"));
const Alerts = lazy(() => import("./pages/Alerts"));
const Notifications = lazy(() => import("./pages/Notifications"));
const Login = lazy(() => import("./pages/Login"));
const PostDetails = lazy(() => import("./pages/PostDetails"));

const queryClient = new QueryClient();

const PageLoader = () => (
  <div className="h-screen w-full flex flex-col items-center justify-center bg-zinc-950 text-white z-50">
    <Loader2 className="h-10 w-10 animate-spin mb-4" />
    <p>Loading Application...</p>
  </div>
);




const App = () => {
  // Handle Supabase OAuth redirect with HashRouter
  const [isProcessingAuth, setIsProcessingAuth] = useState(false);

  useEffect(() => {
    // Check if we have an access token in the URL hash (Supabase OAuth redirect)
    if (window.location.hash.includes("access_token") || window.location.hash.includes("type=recovery") || window.location.hash.includes("error_description")) {
      setIsProcessingAuth(true);

      // Allow supabase client to process the hash
      supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' || event === 'PASSWORD_RECOVERY') {
          // Clear hash to fix HashRouter
          window.location.hash = "";
          setIsProcessingAuth(false);
        }
      });

      // Safety timeout just in case
      setTimeout(() => {
        if (window.location.hash.includes("access_token")) {
          console.warn("Auth processing timeout, clearing hash forcefully");
          window.location.hash = "";
          setIsProcessingAuth(false);
        }
      }, 3000);
    }
  }, []);

  if (isProcessingAuth) {
    return <PageLoader />;
  }

  console.log("App rendering state:", { isProcessingAuth });

  return (
    <div className="border-4 border-red-500 min-h-screen relative">
      <div className="absolute top-0 left-0 bg-red-500 text-white z-[9999] p-2">Debug: App Root</div>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <ErrorBoundary>
            <PostProvider>
              <HashRouter>
                <GlobalChatListener />
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route path="/" element={
                      <ProtectedRoute>
                        <Index />
                      </ProtectedRoute>
                    } />
                    <Route path="/create" element={
                      <ProtectedRoute>
                        <CreatePost />
                      </ProtectedRoute>
                    } />
                    <Route path="/profile/:userId?" element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    } />
                    <Route path="/community/:communityId?" element={
                      <ProtectedRoute>
                        <Community />
                      </ProtectedRoute>
                    } />
                    <Route path="/chats/:chatId?" element={
                      <ProtectedRoute>
                        <Chats />
                      </ProtectedRoute>
                    } />
                    <Route path="/alerts" element={
                      <ProtectedRoute>
                        <Alerts />
                      </ProtectedRoute>
                    } />
                    <Route path="/notifications" element={
                      <ProtectedRoute>
                        <Notifications />
                      </ProtectedRoute>
                    } />
                    <Route path="/post/:postId" element={
                      <ProtectedRoute>
                        <PostDetails />
                      </ProtectedRoute>
                    } />
                    <Route path="/login" element={<Login />} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </HashRouter>
            </PostProvider>
          </ErrorBoundary>
        </TooltipProvider>
      </QueryClientProvider>
    </div>
  );
};

export default App;

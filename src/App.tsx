import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PublicStorefrontPage } from './features/storefront/pages/PublicStorefrontPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<PublicStorefrontPage />} />
          <Route path="/st/:slug" element={<PublicStorefrontPage />} />
          <Route path="/store/:slug" element={<PublicStorefrontPage />} />
          <Route path="/c/:categoryId" element={<PublicStorefrontPage />} />
          <Route path="/st/:slug/c/:categoryId" element={<PublicStorefrontPage />} />
          <Route path="/store/:slug/c/:categoryId" element={<PublicStorefrontPage />} />
          <Route path="/category/:categoryId" element={<PublicStorefrontPage />} />
          <Route path="/st/:slug/category/:categoryId" element={<PublicStorefrontPage />} />
          <Route path="/p/:productId" element={<PublicStorefrontPage />} />
          <Route path="/st/:slug/p/:productId" element={<PublicStorefrontPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

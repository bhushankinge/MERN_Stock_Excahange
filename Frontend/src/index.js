import React from 'react'
import ReactDOM from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.min.css';
import WatchList from './components/WatchList';
import Portfolio from './Portfolio';
import SearchDetails from './SearchDetails';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import Home from './Home';
import { StockProvider } from './context/StockContext';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';


const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
    children: [
      { index: true, element: <Navigate to="/search/home" replace /> },
      { path: "search/home", element: <></> },
      { path: "search/:ticker", element: <SearchDetails /> },
      { path: "watchlist", element: <WatchList /> },
      { path: "portfolio", element: <Portfolio /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <StockProvider>
      <RouterProvider router={router} />
    </StockProvider>
  </React.StrictMode>,
)

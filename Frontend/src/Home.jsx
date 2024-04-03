import React, { useEffect } from 'react';
import Header from './Header';
import Search from './Search'; // Import the Search component
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Footer from './Footer';

function Home() {
    const navigate = useNavigate();
    const location = useLocation();

    // console.log("Home Component Rendered", location.pathname);

    useEffect(() => {

        const handlePageRefresh = () => {
            navigate('/search/home');
        };
        window.addEventListener('load', handlePageRefresh);

        return () => window.removeEventListener('load', handlePageRefresh);
    }, [navigate]);

    const showSearch = () => {
        const isSearchRoute = location.pathname === '/search/home' || location.pathname.match(/^\/search\/.+$/);
        // console.log("Show Search?", isSearchRoute);
        return isSearchRoute;
    };

    return (
        <div className="d-flex flex-column" style={{ minHeight: '100vh' }}>
            <Header />
            {showSearch() && <Search />}
            <Outlet />
            <div className="mt-auto">
                <Footer />
            </div>
        </div>
    );
}


export default Home;

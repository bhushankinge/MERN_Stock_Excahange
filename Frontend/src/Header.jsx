import React from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom'
import './components/Header.css'
import useStock from './context/StockContext';


const Header = () => {
    let { ticker } = useStock();
    const location = useLocation();
    const isSearchActive = () => {
        return location.pathname === '/search/home' || location.pathname.startsWith('/search/');
    };

    return (
        <nav className="container-fluid navbar navbar-expand-lg navbar-dark header-font " style={{ backgroundColor: '#2824ac' }}>
            <div className="container-fluid">
                <Link className="navbar-brand ms-5 brand-css" to="/search/home">Stock Search</Link>
                <button
                    className="navbar-toggler p-1"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarNavResponsive"
                    aria-controls="navbarNavResponsive"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse me-4 ms-4 mt-1" id="navbarNavResponsive">
                    <ul className="navbar-nav ms-auto">
                        <li className="nav-item w-100">
                            <NavLink
                                to={ticker ? `/search/${ticker}` : `/search/home`}
                                className={({ isActive }) => (isActive || isSearchActive()) ? 'active-link nav-link me-2 p-2 pe-3 ps-3' : 'nav-link me-2 p-2 pe-3 ps-3'}
                            >
                                Search
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink
                                to="/watchlist"
                                className={({ isActive }) => isActive ? 'active-link nav-link me-2 p-2 pe-3 ps-3' : 'nav-link me-2 p-2 pe-3 ps-3'}
                            >
                                Watchlist
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink
                                to="/portfolio"
                                className={({ isActive }) => isActive ? 'active-link nav-link me-2 p-2 pe-3 ps-3' : 'nav-link me-2 p-2 pe-3 ps-3'}
                            >
                                Portfolio
                            </NavLink>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
};


export default Header;

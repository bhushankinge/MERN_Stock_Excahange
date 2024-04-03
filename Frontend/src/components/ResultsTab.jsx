import React, { useState } from 'react';
import './results.css';
import SummaryTab from './SummaryTab';
import CompanyNews from './CompanyNews';
import Charts from './Charts';
import Insight from './Insight';

function ResultsTab() {
    const [activeTab, setActiveTab] = useState('Summary');
    const [clickedTab, setClickedTab] = useState(''); // New state for tracking clicked tab

    const tabContent = {
        'Summary': <SummaryTab />,
        'Top News': <CompanyNews />,
        'Charts': <Charts />,
        'Insights': <Insight />,
    };

    const handleTabClick = (tabName) => {
        setClickedTab(tabName); // Set clicked tab
        setTimeout(() => {
            setClickedTab(''); // Clear clicked tab state after a brief period
            setActiveTab(tabName); // Set the active tab
        }, 100); // Short delay to show click effect
    };

    const renderTabItems = () => {
        return Object.keys(tabContent).map((tabName) => (
            <div
                key={tabName}
                onClick={() => handleTabClick(tabName)}
                className={`d-flex w-100 justify-content-center p-2 tab-item ${activeTab === tabName ? 'active' : ''} ${clickedTab === tabName ? 'clicked' : ''}`} // Use `clicked` class for the click effect
            >
                <p className={`m-0 ps-4 pe-4 ${activeTab === tabName ? 'active-text' : ''}`}>{tabName}</p>
            </div>
        ));
    };

    const scrollTabs = (direction) => {
        const container = document.querySelector('.scrolling-tabs-container');
        const scrollAmount = 100; // Adjust based on your needs

        container.scrollBy({
            top: 0,
            left: direction === 'right' ? scrollAmount : -scrollAmount,
            behavior: 'smooth'
        });
    };

    return (
        <div>
            <div className='container-fluid p-0'>
                <div className="d-flex justify-content-between">
                    <button className="btn scroll-btn" onClick={() => scrollTabs('left')}>{'<'}</button>
                    <div className='scrolling-tabs-container d-flex flex-row justify-content-evenly p-0' style={{ overflowX: 'hidden' }}>
                        {renderTabItems()}
                    </div>
                    <button className="btn scroll-btn" onClick={() => scrollTabs('right')}>&gt;</button>
                </div>
            </div>
            <div className='tab-content'>
                {tabContent[activeTab]}
            </div>
        </div>

    );
}

export default ResultsTab;
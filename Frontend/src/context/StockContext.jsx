import React, { createContext, useContext, useState, useMemo } from 'react';

const StockContext = createContext();

export const StockProvider = ({ children }) => {
    const [ticker, setTicker] = useState('');
    const [stockDetails, setStockDetails] = useState(null);
    const [realTimeData, setRealTimeData] = useState(null);
    const [marketOpen, setMarketOpen] = useState(true);
    const [watchList, setWatchList] = useState([]);
    const [loadingSummary, setLoadingSummary] = useState(false);
    const [walletAmount, setWalletAmount] = useState(25000.00);
    const [portfolioData, setPortfolioData] = useState([]);
    const [showBuyModal, setShowBuyModal] = useState(false);
    const [showSellModal, setShowSellModal] = useState(false);
    const [quantity, setQuantity] = useState('0');
    const [total, setTotal] = useState(parseFloat(0.00));
    const [modalSource, setModalSource] = useState('');


    // Memoize the context value
    const value = useMemo(() => ({
        ticker,
        setTicker,
        stockDetails,
        setStockDetails,
        realTimeData,
        setRealTimeData,
        marketOpen,
        setMarketOpen,
        watchList,
        setWatchList,
        loadingSummary,
        setLoadingSummary,
        walletAmount,
        setWalletAmount,
        portfolioData,
        setPortfolioData,
        showBuyModal,
        setShowBuyModal,
        showSellModal,
        setShowSellModal,
        quantity,
        setQuantity,
        total,
        setTotal,
        modalSource,
        setModalSource,
    }), [
        ticker,
        stockDetails,
        realTimeData,
        marketOpen,
        watchList,
        loadingSummary,
        walletAmount,
        portfolioData,
        showBuyModal,
        showSellModal,
        quantity,
        total,
    ]);

    return <StockContext.Provider value={value}>{children}</StockContext.Provider>;
};

export default function useStock() {
    return useContext(StockContext);
}

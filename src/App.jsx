import React from 'react';
import Header from './components/Header';
import CustomerPortal from './components/CustomerPortal';
import ProductCards from './components/ProductCards';
import Footer from './components/Footer';
import './components/styles.css';


const App = () => {
  return (
    <div className="min-h-screen flex flex-col justify-between">
      <Header/>
      <CustomerPortal/>
      <ProductCards/>
      <Footer/>
    </div>
  );
};

export default App;

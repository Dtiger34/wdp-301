// src/pages/HomePage.js
import React from 'react';
import Footer from '../components/Footer';
import Header from '../components/Header';
const HomePage = () => {
    return (
        <div>
            <Header />
            <h1>Welcome to the Home Page!</h1>
            <p>You are successfully logged in.</p>
            <Footer />
        </div>
    );
};

export default HomePage;

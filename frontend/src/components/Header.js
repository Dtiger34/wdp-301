import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
    return (
        <header style={{
            backgroundColor: '#282c34',
            color: '#fff',
            padding: '10px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
        }}>
            <h1>Management Library</h1>
            <nav>
                <ul style={{
                    display: 'flex',
                    listStyleType: 'none',
                    padding: 0,
                    justifyContent: 'center',
                    gap: '20px'
                }}>
                    <li>
                        <Link to="/home" style={{ color: '#fff', textDecoration: 'none' }}>Home</Link>
                    </li>
                    <li>
                        <Link to="/profile" style={{ color: '#fff', textDecoration: 'none' }}>Profile</Link>
                    </li>
                </ul>
            </nav>
        </header>
    );
};

export default Header;

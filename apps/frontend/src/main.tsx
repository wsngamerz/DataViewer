import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import Home from './views/Home';
import Login from './views/Login';
import Register from './views/Register';

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);

root.render(
    <StrictMode>
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
            </Routes>
        </BrowserRouter>
    </StrictMode>
);

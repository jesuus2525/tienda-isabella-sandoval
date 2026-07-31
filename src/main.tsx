import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { router } from './router/index'; // O la ruta donde tengas tu router
import './index.css';

// 👇 1. Importamos el ThemeProvider que creamos
import { ThemeProvider } from './context/ThemeContext'; 

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* 👇 2. Envolvemos toda la app (el Router) dentro del ThemeProvider */}
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  </React.StrictMode>,
)
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
// 1. 在这里引入 Analytics 组件
import { Analytics } from '@vercel/analytics/react';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    {/* 2. 在这里添加 Analytics 标签 */}
    <Analytics />
  </StrictMode>,
);
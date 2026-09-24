import React from 'react';

/**
 * DynamicFinancialBackground
 * Renders rich dynamic translucent background elements with subtle, elegant illustrations of:
 * 1. Financial Charts (Bar charts, Trend lines, Candlesticks, Area graphs)
 * 2. Financial Calculators (LCD screens, keypad grids, arithmetic symbols)
 * 3. Money & Currency (Banknotes, Coin stacks, Flowing cash paths, Currencies: $, د.إ, ر.س, ر.ق, €)
 * 4. Ambient gradient orbs and mesh lighting
 */
export const DynamicFinancialBackground: React.FC = () => {
  return (
    <div 
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none" 
      aria-hidden="true"
    >
      {/* 1. Dynamic Technological Ambient Color Waves / Glow Orbs (Bright, Tech, Indigo, Cyan, Emerald) */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-blue-400/15 blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="absolute top-1/4 -right-32 w-96 h-96 rounded-full bg-cyan-400/15 blur-3xl animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }} />
      <div className="absolute bottom-10 left-1/3 w-80 h-80 rounded-full bg-emerald-400/12 blur-3xl animate-pulse" style={{ animationDuration: '12s', animationDelay: '4s' }} />
      <div className="absolute top-2/3 -left-20 w-72 h-72 rounded-full bg-indigo-400/12 blur-3xl animate-pulse" style={{ animationDuration: '9s' }} />

      {/* 2. Watermark Vector Layer - Financial Charts, Calculator, and Money/Currency in crisp light slate */}
      <div className="absolute inset-0 opacity-[0.07] text-slate-800 transition-opacity duration-700">
        
        {/* Top-Right: Financial Growth Chart & Candlesticks */}
        <div className="absolute top-12 right-8 lg:right-24 w-80 h-64 transform rotate-[-4deg]">
          <svg viewBox="0 0 320 240" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full stroke-current">
            {/* Grid Lines */}
            <line x1="20" y1="200" x2="300" y2="200" strokeWidth="2" strokeDasharray="4 4" />
            <line x1="20" y1="150" x2="300" y2="150" strokeWidth="1.5" strokeDasharray="4 4" />
            <line x1="20" y1="100" x2="300" y2="100" strokeWidth="1.5" strokeDasharray="4 4" />
            <line x1="20" y1="50" x2="300" y2="50" strokeWidth="1" strokeDasharray="4 4" />
            
            {/* Trend Curve */}
            <path
              d="M 30 180 Q 80 160, 120 120 T 200 80 T 290 30"
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
            />
            {/* Candlesticks & Bars */}
            <rect x="40" y="130" width="16" height="70" rx="3" fill="currentColor" fillOpacity="0.3" strokeWidth="1.5" />
            <line x1="48" y1="110" x2="48" y2="210" strokeWidth="2" />

            <rect x="90" y="90" width="16" height="110" rx="3" fill="currentColor" fillOpacity="0.4" strokeWidth="1.5" />
            <line x1="98" y1="75" x2="98" y2="210" strokeWidth="2" />

            <rect x="145" y="70" width="16" height="130" rx="3" fill="currentColor" fillOpacity="0.3" strokeWidth="1.5" />
            <line x1="153" y1="50" x2="153" y2="210" strokeWidth="2" />

            <rect x="200" y="50" width="16" height="150" rx="3" fill="currentColor" fillOpacity="0.5" strokeWidth="1.5" />
            <line x1="208" y1="35" x2="208" y2="210" strokeWidth="2" />

            <rect x="255" y="30" width="16" height="170" rx="3" fill="currentColor" fillOpacity="0.6" strokeWidth="1.5" />
            <line x1="263" y1="15" x2="263" y2="210" strokeWidth="2" />

            {/* Growth Arrow */}
            <path d="M 270 25 L 295 25 L 295 50" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        {/* Top-Left: Financial Calculator Illustration */}
        <div className="absolute top-28 left-6 lg:left-20 w-64 h-80 transform rotate-[6deg]">
          <svg viewBox="0 0 200 260" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full stroke-current">
            {/* Calculator Body */}
            <rect x="15" y="10" width="170" height="240" rx="20" strokeWidth="3" fill="currentColor" fillOpacity="0.1" />
            
            {/* Solar Cell / Brand strip */}
            <rect x="120" y="24" width="45" height="14" rx="3" strokeWidth="1.5" fill="currentColor" fillOpacity="0.4" />
            <line x1="135" y1="24" x2="135" y2="38" strokeWidth="1" />
            <line x1="150" y1="24" x2="150" y2="38" strokeWidth="1" />

            {/* LCD Screen */}
            <rect x="30" y="48" width="140" height="42" rx="8" strokeWidth="2" fill="currentColor" fillOpacity="0.2" />
            {/* Digits on screen 1MONEY */}
            <text x="155" y="78" textAnchor="end" fill="currentColor" fontSize="20" fontWeight="bold" fontFamily="monospace">
              9,845,210
            </text>

            {/* Keypad Buttons Grid */}
            {/* Row 1 */}
            <rect x="32" y="102" width="26" height="22" rx="5" strokeWidth="1.5" fill="currentColor" fillOpacity="0.2" />
            <text x="45" y="117" textAnchor="middle" fill="currentColor" fontSize="10" fontWeight="bold">AC</text>

            <rect x="68" y="102" width="26" height="22" rx="5" strokeWidth="1.5" fill="currentColor" fillOpacity="0.15" />
            <text x="81" y="117" textAnchor="middle" fill="currentColor" fontSize="11" fontWeight="bold">+/-</text>

            <rect x="104" y="102" width="26" height="22" rx="5" strokeWidth="1.5" fill="currentColor" fillOpacity="0.15" />
            <text x="117" y="117" textAnchor="middle" fill="currentColor" fontSize="11" fontWeight="bold">%</text>

            <rect x="140" y="102" width="28" height="22" rx="5" strokeWidth="2" fill="currentColor" fillOpacity="0.3" />
            <text x="154" y="117" textAnchor="middle" fill="currentColor" fontSize="12" fontWeight="bold">÷</text>

            {/* Row 2 */}
            <rect x="32" y="132" width="26" height="22" rx="5" strokeWidth="1.5" fill="currentColor" fillOpacity="0.15" />
            <text x="45" y="147" textAnchor="middle" fill="currentColor" fontSize="11" fontWeight="bold">7</text>

            <rect x="68" y="132" width="26" height="22" rx="5" strokeWidth="1.5" fill="currentColor" fillOpacity="0.15" />
            <text x="81" y="147" textAnchor="middle" fill="currentColor" fontSize="11" fontWeight="bold">8</text>

            <rect x="104" y="132" width="26" height="22" rx="5" strokeWidth="1.5" fill="currentColor" fillOpacity="0.15" />
            <text x="117" y="147" textAnchor="middle" fill="currentColor" fontSize="11" fontWeight="bold">9</text>

            <rect x="140" y="132" width="28" height="22" rx="5" strokeWidth="2" fill="currentColor" fillOpacity="0.3" />
            <text x="154" y="147" textAnchor="middle" fill="currentColor" fontSize="12" fontWeight="bold">×</text>

            {/* Row 3 */}
            <rect x="32" y="162" width="26" height="22" rx="5" strokeWidth="1.5" fill="currentColor" fillOpacity="0.15" />
            <text x="45" y="177" textAnchor="middle" fill="currentColor" fontSize="11" fontWeight="bold">4</text>

            <rect x="68" y="162" width="26" height="22" rx="5" strokeWidth="1.5" fill="currentColor" fillOpacity="0.15" />
            <text x="81" y="177" textAnchor="middle" fill="currentColor" fontSize="11" fontWeight="bold">5</text>

            <rect x="104" y="162" width="26" height="22" rx="5" strokeWidth="1.5" fill="currentColor" fillOpacity="0.15" />
            <text x="117" y="177" textAnchor="middle" fill="currentColor" fontSize="11" fontWeight="bold">6</text>

            <rect x="140" y="162" width="28" height="22" rx="5" strokeWidth="2" fill="currentColor" fillOpacity="0.3" />
            <text x="154" y="177" textAnchor="middle" fill="currentColor" fontSize="13" fontWeight="bold">−</text>

            {/* Row 4 */}
            <rect x="32" y="192" width="26" height="22" rx="5" strokeWidth="1.5" fill="currentColor" fillOpacity="0.15" />
            <text x="45" y="207" textAnchor="middle" fill="currentColor" fontSize="11" fontWeight="bold">1</text>

            <rect x="68" y="192" width="26" height="22" rx="5" strokeWidth="1.5" fill="currentColor" fillOpacity="0.15" />
            <text x="81" y="207" textAnchor="middle" fill="currentColor" fontSize="11" fontWeight="bold">2</text>

            <rect x="104" y="192" width="26" height="22" rx="5" strokeWidth="1.5" fill="currentColor" fillOpacity="0.15" />
            <text x="117" y="207" textAnchor="middle" fill="currentColor" fontSize="11" fontWeight="bold">3</text>

            <rect x="140" y="192" width="28" height="48" rx="5" strokeWidth="2" fill="currentColor" fillOpacity="0.4" />
            <text x="154" y="222" textAnchor="middle" fill="currentColor" fontSize="16" fontWeight="bold">=</text>

            {/* Row 5 */}
            <rect x="32" y="222" width="62" height="18" rx="5" strokeWidth="1.5" fill="currentColor" fillOpacity="0.15" />
            <text x="63" y="235" textAnchor="middle" fill="currentColor" fontSize="10" fontWeight="bold">0</text>

            <rect x="104" y="222" width="26" height="18" rx="5" strokeWidth="1.5" fill="currentColor" fillOpacity="0.15" />
            <text x="117" y="235" textAnchor="middle" fill="currentColor" fontSize="12" fontWeight="bold">.</text>
          </svg>
        </div>

        {/* Center / Middle-Right: Floating Banknotes & Coins Stack */}
        <div className="absolute top-1/2 right-10 lg:right-32 w-72 h-72 transform rotate-[8deg]">
          <svg viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full stroke-current">
            {/* Stacked Currency Banknotes */}
            {/* Note 1 (Bottom) */}
            <rect x="20" y="60" width="160" height="90" rx="8" strokeWidth="2" fill="currentColor" fillOpacity="0.15" transform="rotate(-10 20 60)" />
            {/* Note 2 (Middle) */}
            <rect x="40" y="50" width="160" height="90" rx="8" strokeWidth="2" fill="currentColor" fillOpacity="0.2" transform="rotate(5 40 50)" />
            {/* Note 3 (Top) */}
            <g transform="rotate(-3 50 40)">
              <rect x="50" y="40" width="160" height="90" rx="8" strokeWidth="2.5" fill="currentColor" fillOpacity="0.25" />
              <circle cx="130" cy="85" r="24" strokeWidth="2" strokeDasharray="3 3" />
              <text x="130" y="93" textAnchor="middle" fill="currentColor" fontSize="24" fontWeight="bold" fontFamily="sans-serif">
                $
              </text>
              <rect x="58" y="48" width="16" height="16" rx="2" strokeWidth="1" />
              <rect x="186" y="106" width="16" height="16" rx="2" strokeWidth="1" />
            </g>

            {/* Coins Stack */}
            <g transform="translate(130, 130)">
              {/* Coin 1 */}
              <ellipse cx="45" cy="80" rx="35" ry="14" strokeWidth="2" fill="currentColor" fillOpacity="0.3" />
              {/* Coin 2 */}
              <ellipse cx="45" cy="68" rx="35" ry="14" strokeWidth="2" fill="currentColor" fillOpacity="0.3" />
              {/* Coin 3 */}
              <ellipse cx="45" cy="56" rx="35" ry="14" strokeWidth="2" fill="currentColor" fillOpacity="0.35" />
              {/* Coin 4 */}
              <ellipse cx="45" cy="44" rx="35" ry="14" strokeWidth="2" fill="currentColor" fillOpacity="0.4" />
              {/* Coin 5 (Top with Emblem) */}
              <ellipse cx="45" cy="32" rx="35" ry="14" strokeWidth="2.5" fill="currentColor" fillOpacity="0.5" />
              <text x="45" y="36" textAnchor="middle" fill="currentColor" fontSize="12" fontWeight="bold">
                QAR
              </text>
            </g>
          </svg>
        </div>

        {/* Bottom-Left: Financial Analytics & Circular Donut Chart */}
        <div className="absolute bottom-16 left-8 lg:left-28 w-80 h-72 transform rotate-[-6deg]">
          <svg viewBox="0 0 280 240" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full stroke-current">
            {/* Donut Chart */}
            <circle cx="90" cy="110" r="65" strokeWidth="24" strokeDasharray="140 300" strokeLinecap="round" />
            <circle cx="90" cy="110" r="65" strokeWidth="24" strokeDasharray="90 300" strokeDashoffset="-150" strokeLinecap="round" strokeOpacity="0.6" />
            <circle cx="90" cy="110" r="65" strokeWidth="24" strokeDasharray="60 300" strokeDashoffset="-250" strokeLinecap="round" strokeOpacity="0.3" />
            
            {/* Center percentage badge */}
            <text x="90" y="108" textAnchor="middle" fill="currentColor" fontSize="15" fontWeight="bold" fontFamily="sans-serif">
              100%
            </text>
            <text x="90" y="124" textAnchor="middle" fill="currentColor" fontSize="8" fontWeight="bold">
              BUDGET
            </text>

            {/* Financial Multi-Currencies symbols floating */}
            <g transform="translate(180, 40)">
              <circle cx="25" cy="25" r="22" strokeWidth="2" fill="currentColor" fillOpacity="0.15" />
              <text x="25" y="32" textAnchor="middle" fill="currentColor" fontSize="16" fontWeight="bold">﷼</text>
            </g>

            <g transform="translate(200, 110)">
              <circle cx="22" cy="22" r="20" strokeWidth="2" fill="currentColor" fillOpacity="0.15" />
              <text x="22" y="29" textAnchor="middle" fill="currentColor" fontSize="15" fontWeight="bold">€</text>
            </g>

            <g transform="translate(170, 170)">
              <circle cx="22" cy="22" r="20" strokeWidth="2" fill="currentColor" fillOpacity="0.15" />
              <text x="22" y="28" textAnchor="middle" fill="currentColor" fontSize="13" fontWeight="bold">د.إ</text>
            </g>
          </svg>
        </div>

        {/* Center Top: Flowing Financial Matrix Waves */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-full max-w-4xl h-48 opacity-30">
          <svg viewBox="0 0 800 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full stroke-current">
            <path
              d="M 0 60 C 150 10, 250 110, 400 60 C 550 10, 650 110, 800 60"
              strokeWidth="2"
              strokeDasharray="6 6"
            />
            <path
              d="M 0 80 C 150 30, 250 130, 400 80 C 550 30, 650 130, 800 80"
              strokeWidth="1.5"
            />
          </svg>
        </div>

      </div>
    </div>
  );
};

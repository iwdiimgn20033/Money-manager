import React from 'react';

/**
 * BackgroundFinancialGraphics
 * Displays dynamic, elegant, transparent watermark illustrations of:
 * - Charts (Line chart, Bar chart, Area chart, Candlestick, Trend lines)
 * - Calculator (Pocket calculator, numeric grid, function symbols +, -, ×, ÷, =)
 * - Money (Banknotes, Currency coins with $, €, £, SAR, Cash stacks, Gold coins)
 * With soft dynamic glowing ambient gradients and glassmorphism support.
 */
export const BackgroundFinancialGraphics: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* 1. Dynamic Ambient Glowing Blobs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-400/15 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="absolute top-1/3 -right-32 w-[30rem] h-[30rem] bg-indigo-400/12 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '12s' }} />
      <div className="absolute -bottom-32 left-1/4 w-[32rem] h-[32rem] bg-emerald-400/12 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '10s' }} />
      <div className="absolute top-2/3 left-1/3 w-80 h-80 bg-purple-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '14s' }} />

      {/* 2. Top-Right Financial Watermark: Chart & Upward Growth Trends */}
      <div className="absolute top-12 right-6 lg:right-20 opacity-[0.07] text-indigo-950 transition-opacity duration-700 hover:opacity-15">
        <svg width="420" height="280" viewBox="0 0 420 280" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Grid lines */}
          <line x1="20" y1="40" x2="400" y2="40" stroke="currentColor" strokeWidth="1.5" strokeDasharray="6 6" />
          <line x1="20" y1="100" x2="400" y2="100" stroke="currentColor" strokeWidth="1.5" strokeDasharray="6 6" />
          <line x1="20" y1="160" x2="400" y2="160" stroke="currentColor" strokeWidth="1.5" strokeDasharray="6 6" />
          <line x1="20" y1="220" x2="400" y2="220" stroke="currentColor" strokeWidth="2" />
          <line x1="20" y1="20" x2="20" y2="220" stroke="currentColor" strokeWidth="2" />
          
          {/* Bar Chart Columns */}
          <rect x="50" y="130" width="28" height="90" rx="4" fill="currentColor" opacity="0.4" />
          <rect x="110" y="90" width="28" height="130" rx="4" fill="currentColor" opacity="0.6" />
          <rect x="170" y="150" width="28" height="70" rx="4" fill="currentColor" opacity="0.35" />
          <rect x="230" y="60" width="28" height="160" rx="4" fill="currentColor" opacity="0.8" />
          <rect x="290" y="100" width="28" height="120" rx="4" fill="currentColor" opacity="0.5" />
          <rect x="350" y="30" width="28" height="190" rx="4" fill="currentColor" opacity="0.9" />
          
          {/* Upward Curved Growth Line & Data Dots */}
          <path d="M 50 170 C 120 150, 150 70, 230 80 C 290 90, 330 30, 390 20" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
          <circle cx="50" cy="170" r="5" fill="currentColor" />
          <circle cx="120" cy="140" r="5" fill="currentColor" />
          <circle cx="230" cy="80" r="6" fill="currentColor" />
          <circle cx="390" cy="20" r="7" fill="currentColor" />
          
          {/* Arrow */}
          <path d="M 370 20 L 390 20 L 390 40" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {/* 3. Left Mid Section: Detailed Calculator Watermark */}
      <div className="absolute top-1/4 left-4 lg:left-14 opacity-[0.065] text-blue-950">
        <svg width="300" height="380" viewBox="0 0 300 380" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Calculator Body */}
          <rect x="10" y="10" width="280" height="360" rx="24" stroke="currentColor" strokeWidth="3.5" fill="none" />
          {/* Solar Panel & Brand */}
          <rect x="35" y="35" width="90" height="20" rx="4" stroke="currentColor" strokeWidth="2" />
          <line x1="65" y1="35" x2="65" y2="55" stroke="currentColor" strokeWidth="1.5" />
          <line x1="95" y1="35" x2="95" y2="55" stroke="currentColor" strokeWidth="1.5" />
          {/* Screen Display */}
          <rect x="35" y="70" width="230" height="60" rx="10" stroke="currentColor" strokeWidth="3" />
          <text x="245" y="112" fill="currentColor" fontSize="30" fontWeight="bold" fontFamily="monospace" textAnchor="end">
            1,854,920.00
          </text>
          
          {/* Keypad Grid */}
          {/* Row 1 */}
          <rect x="35" y="150" width="46" height="38" rx="8" stroke="currentColor" strokeWidth="2" />
          <text x="58" y="174" fill="currentColor" fontSize="16" fontWeight="bold" textAnchor="middle">AC</text>
          <rect x="96" y="150" width="46" height="38" rx="8" stroke="currentColor" strokeWidth="2" />
          <text x="119" y="174" fill="currentColor" fontSize="16" fontWeight="bold" textAnchor="middle">+/-</text>
          <rect x="157" y="150" width="46" height="38" rx="8" stroke="currentColor" strokeWidth="2" />
          <text x="180" y="174" fill="currentColor" fontSize="16" fontWeight="bold" textAnchor="middle">%</text>
          <rect x="219" y="150" width="46" height="38" rx="8" stroke="currentColor" strokeWidth="2" fill="currentColor" opacity="0.15" />
          <text x="242" y="174" fill="currentColor" fontSize="20" fontWeight="bold" textAnchor="middle">÷</text>

          {/* Row 2 */}
          <rect x="35" y="200" width="46" height="38" rx="8" stroke="currentColor" strokeWidth="2" />
          <text x="58" y="224" fill="currentColor" fontSize="16" fontWeight="bold" textAnchor="middle">7</text>
          <rect x="96" y="200" width="46" height="38" rx="8" stroke="currentColor" strokeWidth="2" />
          <text x="119" y="224" fill="currentColor" fontSize="16" fontWeight="bold" textAnchor="middle">8</text>
          <rect x="157" y="200" width="46" height="38" rx="8" stroke="currentColor" strokeWidth="2" />
          <text x="180" y="224" fill="currentColor" fontSize="16" fontWeight="bold" textAnchor="middle">9</text>
          <rect x="219" y="200" width="46" height="38" rx="8" stroke="currentColor" strokeWidth="2" fill="currentColor" opacity="0.15" />
          <text x="242" y="224" fill="currentColor" fontSize="20" fontWeight="bold" textAnchor="middle">×</text>

          {/* Row 3 */}
          <rect x="35" y="250" width="46" height="38" rx="8" stroke="currentColor" strokeWidth="2" />
          <text x="58" y="274" fill="currentColor" fontSize="16" fontWeight="bold" textAnchor="middle">4</text>
          <rect x="96" y="250" width="46" height="38" rx="8" stroke="currentColor" strokeWidth="2" />
          <text x="119" y="274" fill="currentColor" fontSize="16" fontWeight="bold" textAnchor="middle">5</text>
          <rect x="157" y="250" width="46" height="38" rx="8" stroke="currentColor" strokeWidth="2" />
          <text x="180" y="274" fill="currentColor" fontSize="16" fontWeight="bold" textAnchor="middle">6</text>
          <rect x="219" y="250" width="46" height="38" rx="8" stroke="currentColor" strokeWidth="2" fill="currentColor" opacity="0.15" />
          <text x="242" y="274" fill="currentColor" fontSize="20" fontWeight="bold" textAnchor="middle">-</text>

          {/* Row 4 */}
          <rect x="35" y="300" width="46" height="38" rx="8" stroke="currentColor" strokeWidth="2" />
          <text x="58" y="324" fill="currentColor" fontSize="16" fontWeight="bold" textAnchor="middle">1</text>
          <rect x="96" y="300" width="46" height="38" rx="8" stroke="currentColor" strokeWidth="2" />
          <text x="119" y="324" fill="currentColor" fontSize="16" fontWeight="bold" textAnchor="middle">2</text>
          <rect x="157" y="300" width="46" height="38" rx="8" stroke="currentColor" strokeWidth="2" />
          <text x="180" y="324" fill="currentColor" fontSize="16" fontWeight="bold" textAnchor="middle">3</text>
          <rect x="219" y="300" width="46" height="38" rx="8" stroke="currentColor" strokeWidth="2" fill="currentColor" opacity="0.15" />
          <text x="242" y="324" fill="currentColor" fontSize="20" fontWeight="bold" textAnchor="middle">+</text>
        </svg>
      </div>

      {/* 4. Bottom-Right: Money, Cash Banknotes & Stack of Coins */}
      <div className="absolute bottom-10 right-8 lg:right-24 opacity-[0.07] text-emerald-950">
        <svg width="400" height="300" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Back Banknote */}
          <g transform="rotate(-10 150 150)">
            <rect x="40" y="90" width="240" height="130" rx="14" stroke="currentColor" strokeWidth="3" />
            <circle cx="160" cy="155" r="36" stroke="currentColor" strokeWidth="2.5" />
            <text x="160" y="168" fill="currentColor" fontSize="38" fontWeight="bold" textAnchor="middle">$</text>
            <rect x="55" y="105" width="210" height="100" rx="8" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" />
            <text x="65" y="125" fill="currentColor" fontSize="18" fontWeight="bold">100</text>
            <text x="255" y="195" fill="currentColor" fontSize="18" fontWeight="bold" textAnchor="end">100</text>
          </g>

          {/* Front Banknote */}
          <g transform="rotate(8 220 160)">
            <rect x="120" y="100" width="250" height="135" rx="14" stroke="currentColor" strokeWidth="3.5" fill="none" />
            <circle cx="245" cy="167" r="40" stroke="currentColor" strokeWidth="3" />
            <text x="245" y="182" fill="currentColor" fontSize="42" fontWeight="bold" textAnchor="middle">$</text>
            <rect x="135" y="115" width="220" height="105" rx="8" stroke="currentColor" strokeWidth="1.5" strokeDasharray="5 5" />
            <text x="150" y="140" fill="currentColor" fontSize="20" fontWeight="bold">500</text>
            <text x="340" y="210" fill="currentColor" fontSize="20" fontWeight="bold" textAnchor="end">500</text>
          </g>

          {/* Golden Stacks of Coins */}
          {/* Coin Stack 1 */}
          <ellipse cx="70" cy="240" rx="35" ry="12" stroke="currentColor" strokeWidth="2.5" />
          <path d="M 35 240 v 14 c 0 7 15 12 35 12 s 35 -5 35 -12 v -14" stroke="currentColor" strokeWidth="2.5" />
          <path d="M 35 254 v 14 c 0 7 15 12 35 12 s 35 -5 35 -12 v -14" stroke="currentColor" strokeWidth="2.5" />
          <path d="M 35 268 v 14 c 0 7 15 12 35 12 s 35 -5 35 -12 v -14" stroke="currentColor" strokeWidth="2.5" />
          <text x="70" y="244" fill="currentColor" fontSize="13" fontWeight="bold" textAnchor="middle">SAR</text>

          {/* Coin Stack 2 */}
          <ellipse cx="140" cy="220" rx="30" ry="10" stroke="currentColor" strokeWidth="2.5" />
          <path d="M 110 220 v 12 c 0 6 13 10 30 10 s 30 -4 30 -10 v -12" stroke="currentColor" strokeWidth="2.5" />
          <path d="M 110 232 v 12 c 0 6 13 10 30 10 s 30 -4 30 -10 v -12" stroke="currentColor" strokeWidth="2.5" />
          <path d="M 110 244 v 12 c 0 6 13 10 30 10 s 30 -4 30 -10 v -12" stroke="currentColor" strokeWidth="2.5" />
          <path d="M 110 256 v 12 c 0 6 13 10 30 10 s 30 -4 30 -10 v -12" stroke="currentColor" strokeWidth="2.5" />
          <text x="140" y="224" fill="currentColor" fontSize="12" fontWeight="bold" textAnchor="middle">€</text>
        </svg>
      </div>

      {/* 5. Center Bottom Pie Chart & Analytics Dial */}
      <div className="absolute bottom-6 left-1/3 opacity-[0.05] text-purple-950">
        <svg width="260" height="260" viewBox="0 0 260 260" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Pie Chart Slices */}
          <circle cx="130" cy="130" r="100" stroke="currentColor" strokeWidth="3" strokeDasharray="5 5" />
          <path d="M 130 130 L 130 30 A 100 100 0 0 1 230 130 Z" fill="currentColor" opacity="0.3" stroke="currentColor" strokeWidth="2" />
          <path d="M 130 130 L 230 130 A 100 100 0 0 1 130 230 Z" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="2" />
          <path d="M 130 130 L 130 230 A 100 100 0 0 1 30 130 Z" fill="currentColor" opacity="0.1" stroke="currentColor" strokeWidth="2" />
          <path d="M 130 130 L 30 130 A 100 100 0 0 1 130 30 Z" fill="currentColor" opacity="0.4" stroke="currentColor" strokeWidth="2" />
          {/* Center Hole for Donut Effect */}
          <circle cx="130" cy="130" r="45" fill="white" stroke="currentColor" strokeWidth="2.5" />
          <text x="130" y="136" fill="currentColor" fontSize="16" fontWeight="bold" textAnchor="middle">% ROI</text>
        </svg>
      </div>

      {/* 6. Geometric Subtle Financial Matrix Dots / Grid Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.025]" 
        style={{ 
          backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)', 
          backgroundSize: '32px 32px' 
        }} 
      />
    </div>
  );
};

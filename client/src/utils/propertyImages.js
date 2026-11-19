/**
 * High-reliability Property Image Utilities
 * Provides robust fallback SVG graphics for offline / adblocked / slow connections
 */

export const getPropertyFallbackImage = (category = 'Apartment', title = 'EstateFlow Luxury Listing') => {
  const safeCat = category || 'Apartment';
  const safeTitle = (title || 'Premium Property').replace(/["'<>]/g, '');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500" fill="none">
    <rect width="800" height="500" fill="#fafafa"/>
    <defs>
      <pattern id="archGrid" width="32" height="32" patternUnits="userSpaceOnUse">
        <path d="M 32 0 L 0 0 0 32" fill="none" stroke="#f0f0f1" stroke-width="1.5"/>
      </pattern>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#18181b" />
        <stop offset="100%" stop-color="#27272a" />
      </linearGradient>
    </defs>
    <rect width="800" height="500" fill="url(#archGrid)" />
    
    <!-- Architectural Frame -->
    <rect x="40" y="40" width="720" height="420" rx="16" fill="#ffffff" stroke="#e4e4e7" stroke-width="2" />
    
    <!-- Modern Real Estate Graphic -->
    <g transform="translate(350, 140)">
      <rect x="15" y="20" width="70" height="110" rx="4" fill="#f4f4f5" stroke="#18181b" stroke-width="3"/>
      <rect x="-30" y="55" width="45" height="75" rx="4" fill="#ffffff" stroke="#18181b" stroke-width="3"/>
      <rect x="85" y="70" width="40" height="60" rx="4" fill="#ffffff" stroke="#18181b" stroke-width="3"/>
      
      <!-- Windows -->
      <rect x="27" y="32" width="16" height="18" rx="2" fill="#18181b"/>
      <rect x="55" y="32" width="16" height="18" rx="2" fill="#18181b"/>
      <rect x="27" y="60" width="16" height="18" rx="2" fill="#18181b"/>
      <rect x="55" y="60" width="16" height="18" rx="2" fill="#18181b"/>
      <rect x="27" y="88" width="16" height="18" rx="2" fill="#18181b"/>
      <rect x="55" y="88" width="16" height="18" rx="2" fill="#18181b"/>
      
      <rect x="-18" y="70" width="22" height="14" rx="1" fill="#71717a"/>
      <rect x="-18" y="94" width="22" height="14" rx="1" fill="#71717a"/>
      <rect x="95" y="84" width="20" height="12" rx="1" fill="#71717a"/>
    </g>
    
    <!-- Category Badge -->
    <rect x="330" y="300" width="140" height="28" rx="14" fill="#f4f4f5" stroke="#e4e4e7" stroke-width="1.5"/>
    <text x="400" y="318" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="700" fill="#18181b" letter-spacing="1.5" text-anchor="middle">${safeCat.toUpperCase()}</text>
    
    <!-- Property Title -->
    <text x="400" y="360" font-family="system-ui, -apple-system, sans-serif" font-size="17" font-weight="700" fill="#09090b" text-anchor="middle">${safeTitle}</text>
    <text x="400" y="385" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="500" fill="#71717a" text-anchor="middle">EstateFlow Verified Architecture</text>
  </svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

export const handleImageError = (e, category = 'Apartment', title = 'EstateFlow Luxury Listing') => {
  e.currentTarget.onerror = null;
  e.currentTarget.src = getPropertyFallbackImage(category, title);
};

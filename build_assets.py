import os

with open('logo_base64.txt', 'r', encoding='utf-8') as f:
    logo_base64 = f.read().strip()

svg_content = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1200" width="1200" height="1200">
  <defs>
    <!-- Background Gradients -->
    <radialGradient id="topGlow" cx="50%" cy="20%" r="60%">
      <stop offset="0%" stop-color="#b6a0ed" stop-opacity="0.22" />
      <stop offset="50%" stop-color="#766780" stop-opacity="0.08" />
      <stop offset="100%" stop-color="#080809" stop-opacity="0" />
    </radialGradient>
    
    <radialGradient id="bottomGlow" cx="85%" cy="85%" r="50%">
      <stop offset="0%" stop-color="#b6a0ed" stop-opacity="0.14" />
      <stop offset="100%" stop-color="#080809" stop-opacity="0" />
    </radialGradient>

    <radialGradient id="starGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.9" />
      <stop offset="40%" stop-color="#b6a0ed" stop-opacity="0.6" />
      <stop offset="100%" stop-color="#b6a0ed" stop-opacity="0" />
    </radialGradient>

    <!-- Grid Pattern -->
    <pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse">
      <path d="M 80 0 L 0 0 0 80" fill="none" stroke="rgba(255, 255, 255, 0.035)" stroke-width="1" />
    </pattern>

    <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>

    <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="4" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>

  <style>
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300..700;1,9..40,300..700&amp;family=Manrope:wght@400;500;600;700;800&amp;family=Playfair+Display:ital,wght@0,600;1,400;1,600&amp;display=swap');

    .text-title {{
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 78px;
      fill: #ffffff;
      font-weight: 600;
      letter-spacing: -1px;
    }}
    .text-title-accent {{
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 78px;
      font-style: italic;
      fill: #b6a0ed;
      font-weight: 400;
    }}
    .text-eyebrow {{
      font-family: 'DM Sans', sans-serif;
      font-size: 15px;
      font-weight: 600;
      letter-spacing: 5px;
      fill: #c5b0e1;
      text-transform: uppercase;
    }}
    .text-subtitle {{
      font-family: 'Manrope', sans-serif;
      font-size: 22px;
      font-weight: 600;
      letter-spacing: 4px;
      fill: #e9e4f3;
      text-transform: uppercase;
    }}
    .text-body {{
      font-family: 'DM Sans', sans-serif;
      font-size: 19px;
      fill: #a8a5ac;
      line-height: 1.7;
    }}
    .text-tagline {{
      font-family: 'Manrope', sans-serif;
      font-size: 14px;
      font-weight: 700;
      letter-spacing: 2px;
      fill: #b6a0ed;
      text-transform: uppercase;
    }}
    .text-url {{
      font-family: 'DM Sans', sans-serif;
      font-size: 15px;
      fill: #9a989f;
    }}
    .text-wishes {{
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 19px;
      font-style: italic;
      fill: #e9e4f3;
    }}
    .text-year {{
      font-family: 'DM Sans', sans-serif;
      font-size: 13px;
      letter-spacing: 1.5px;
      fill: #706c78;
      text-transform: uppercase;
    }}
    .badge-text {{
      font-family: 'DM Sans', sans-serif;
      font-size: 13px;
      font-weight: 600;
      letter-spacing: 3px;
      fill: #b6a0ed;
      text-transform: uppercase;
    }}
  </style>

  <!-- Base Background -->
  <rect width="1200" height="1200" fill="#080809" />
  
  <!-- Subtle Grid -->
  <rect width="1200" height="1200" fill="url(#grid)" />

  <!-- Radial Glows -->
  <circle cx="600" cy="280" r="500" fill="url(#topGlow)" />
  <circle cx="1050" cy="1050" r="450" fill="url(#bottomGlow)" />

  <!-- Borders and Framing -->
  <rect x="36" y="36" width="1128" height="1128" fill="none" stroke="rgba(255, 255, 255, 0.08)" stroke-width="1.5" />
  <rect x="48" y="48" width="1104" height="1104" fill="none" stroke="rgba(182, 160, 237, 0.18)" stroke-width="1" />

  <!-- Corner Brackets -->
  <path d="M 32 56 L 32 32 L 56 32" fill="none" stroke="#b6a0ed" stroke-width="2.5" />
  <path d="M 1168 56 L 1168 32 L 1144 32" fill="none" stroke="#b6a0ed" stroke-width="2.5" />
  <path d="M 32 1144 L 32 1168 L 56 1168" fill="none" stroke="#b6a0ed" stroke-width="2.5" />
  <path d="M 1168 1144 L 1168 1168 L 1144 1168" fill="none" stroke="#b6a0ed" stroke-width="2.5" />

  <!-- Floating Crystal Snowflakes -->
  <!-- Flake 1 (Top Left) -->
  <g transform="translate(100, 150)" stroke="#b6a0ed" stroke-width="2.5" stroke-linecap="round" opacity="0.75" filter="url(#softGlow)">
    <line x1="0" y1="-28" x2="0" y2="28" />
    <line x1="-28" y1="0" x2="28" y2="0" />
    <line x1="-20" y1="-20" x2="20" y2="20" />
    <line x1="-20" y1="20" x2="20" y2="-20" />
    <circle cx="0" cy="0" r="6" fill="none" stroke="#ffffff" stroke-width="1.5" />
    <path d="M -6 -18 L 0 -12 L 6 -18" fill="none" />
    <path d="M -6 18 L 0 12 L 6 18" fill="none" />
    <path d="M -18 -6 L -12 0 L -18 6" fill="none" />
    <path d="M 18 -6 L 12 0 L 18 6" fill="none" />
  </g>

  <!-- Flake 2 (Top Right) -->
  <g transform="translate(1080, 240)" stroke="#e9e4f3" stroke-width="2" stroke-linecap="round" opacity="0.65" filter="url(#softGlow)">
    <line x1="0" y1="-24" x2="0" y2="24" />
    <line x1="-24" y1="0" x2="24" y2="0" />
    <line x1="-17" y1="-17" x2="17" y2="17" />
    <line x1="-17" y1="17" x2="17" y2="-17" />
    <polygon points="0,-6 6,0 0,6 -6,0" fill="#b6a0ed" stroke="none" />
  </g>

  <!-- Flake 3 (Bottom Left) -->
  <g transform="translate(120, 1020)" stroke="#b6a0ed" stroke-width="2" stroke-linecap="round" opacity="0.7" filter="url(#softGlow)">
    <line x1="0" y1="-22" x2="0" y2="22" />
    <line x1="-22" y1="0" x2="22" y2="0" />
    <line x1="-15" y1="-15" x2="15" y2="15" />
    <line x1="-15" y1="15" x2="15" y2="-15" />
    <circle cx="0" cy="0" r="5" fill="#b6a0ed" stroke="none" />
  </g>

  <!-- Flake 4 (Bottom Right) -->
  <g transform="translate(1070, 980)" stroke="#c5b0e1" stroke-width="2.5" stroke-linecap="round" opacity="0.75" filter="url(#softGlow)">
    <line x1="0" y1="-28" x2="0" y2="28" />
    <line x1="-28" y1="0" x2="28" y2="0" />
    <line x1="-20" y1="-20" x2="20" y2="20" />
    <line x1="-20" y1="20" x2="20" y2="-20" />
    <circle cx="0" cy="0" r="7" fill="none" stroke="#ffffff" stroke-width="1.8" />
  </g>

  <!-- Header Bar -->
  <g transform="translate(85, 75)">
    <!-- Wissen Technology Logo -->
    <image href="data:image/png;base64,{logo_base64}" x="0" y="0" width="180" height="60" preserveAspectRatio="xMidYMid meet" />
    
    <!-- Holiday Edition Pill -->
    <g transform="translate(840, 10)">
      <rect x="0" y="0" width="190" height="38" rx="19" fill="rgba(182, 160, 237, 0.08)" stroke="rgba(182, 160, 237, 0.28)" stroke-width="1" />
      <circle cx="24" cy="19" r="4" fill="#b6a0ed" filter="url(#softGlow)" />
      <text x="38" y="24" class="badge-text">Holiday Edition</text>
    </g>
  </g>

  <!-- Central Festive Artwork -->
  <g transform="translate(600, 270)" filter="url(#glowFilter)">
    <!-- Star Glow -->
    <circle cx="0" cy="-40" r="30" fill="url(#starGlow)" />
    
    <!-- 8-Point Star -->
    <polygon points="0,-52 4,-38 18,-38 7,-28 11,-14 0,-24 -11,-14 -7,-28 -18,-38 -4,-38" fill="#ffffff" stroke="#b6a0ed" stroke-width="1.5" />
    
    <!-- Tree Tiers (Modern Geometric Tech Tree) -->
    <!-- Tier 1 -->
    <polygon points="0,-18 -32,22 32,22" fill="rgba(182, 160, 237, 0.2)" stroke="#b6a0ed" stroke-width="2.2" stroke-linejoin="round" />
    <!-- Tier 2 -->
    <polygon points="0,22 -50,68 50,68" fill="rgba(182, 160, 237, 0.14)" stroke="#b6a0ed" stroke-width="2.2" stroke-linejoin="round" />
    <!-- Tier 3 -->
    <polygon points="0,68 -72,120 72,120" fill="rgba(182, 160, 237, 0.08)" stroke="#b6a0ed" stroke-width="2.2" stroke-linejoin="round" />
    
    <!-- Stem -->
    <line x1="0" y1="120" x2="0" y2="138" stroke="#b6a0ed" stroke-width="3.5" stroke-linecap="round" />

    <!-- Tech Ornaments -->
    <circle cx="-16" cy="6" r="3" fill="#ffffff" />
    <circle cx="12" cy="12" r="3" fill="#b6a0ed" />
    <circle cx="-28" cy="50" r="3.5" fill="#ffffff" />
    <circle cx="25" cy="52" r="3.5" fill="#b6a0ed" />
    <circle cx="-45" cy="104" r="4" fill="#b6a0ed" />
    <circle cx="0" cy="98" r="3.5" fill="#ffffff" />
    <circle cx="45" cy="105" r="4" fill="#ffffff" />
  </g>

  <!-- Typography & Messaging -->
  <g transform="translate(600, 480)" text-anchor="middle">
    <!-- Eyebrow with flanking decorative lines -->
    <line x1="-220" y1="-8" x2="-155" y2="-8" stroke="#b6a0ed" stroke-width="1" opacity="0.6" />
    <text x="0" y="0" class="text-eyebrow">Warmest Season's Greetings</text>
    <line x1="155" y1="-8" x2="220" y2="-8" stroke="#b6a0ed" stroke-width="1" opacity="0.6" />

    <!-- Main Title Lines -->
    <text x="0" y="85" class="text-title">Merry Christmas</text>
    <text x="0" y="165" class="text-title-accent">&amp; Happy New Year</text>

    <!-- Subtitle -->
    <text x="0" y="225" class="text-subtitle">Wissen Technology</text>

    <!-- Divider Line -->
    <line x1="-60" y1="260" x2="60" y2="260" stroke="#b6a0ed" stroke-width="2" opacity="0.5" />

    <!-- Heartfelt Greeting Body Text -->
    <text x="0" y="315" class="text-body">Wishing our esteemed clients, partners, and colleagues a joyous holiday season.</text>
    <text x="0" y="348" class="text-body">May your festive days be filled with warmth, harmony, and peace, and may</text>
    <text x="0" y="381" class="text-body">the new year bring breakthrough innovation, shared growth, and lasting success.</text>
  </g>

  <!-- Footer Bar -->
  <g transform="translate(85, 1085)">
    <!-- Divider -->
    <line x1="0" y1="0" x2="1030" y2="0" stroke="rgba(255, 255, 255, 0.09)" stroke-width="1" />

    <!-- Left Footer -->
    <g transform="translate(0, 32)">
      <text x="0" y="0" class="text-tagline">Engineering What's Next</text>
      <text x="0" y="24" class="text-url">wissen.com</text>
    </g>

    <!-- Right Footer -->
    <g transform="translate(1030, 32)" text-anchor="end">
      <text x="0" y="0" class="text-wishes">Joy • Peace • Innovation</text>
      <text x="0" y="24" class="text-year">Season 2026</text>
    </g>
  </g>
</svg>
'''

with open('christmas-post-1200x1200.svg', 'w', encoding='utf-8') as f:
    f.write(svg_content)

print("Created christmas-post-1200x1200.svg successfully!")

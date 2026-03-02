# Crypto Timeline

Mobile-first timeline/chart view of BTC and ETH prices with Fidelity crypto ETF (FBTC, FETH) overlay.

## Features

- **BTC & ETH** historical price charts via CoinGecko API
- **FBTC & FETH** ETF price overlay via Yahoo Finance
- Selectable time ranges: 7D, 30D, 90D, 180D, 1Y
- **% Change view** for normalized cross-asset comparison
- Toggleable series legend
- Mobile-first responsive dark theme

## Tech Stack

- React 19 + TypeScript
- Vite (with SWC)
- Recharts
- Tailwind CSS v4

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Configuration

Copy `.env.example` to `.env` to customize the CORS proxy used for Yahoo Finance ETF data:

```
VITE_CORS_PROXY_URL=https://corsproxy.io/?url=
```

## Data Sources

- [CoinGecko API](https://docs.coingecko.com/) — free, no API key required
- [Yahoo Finance](https://finance.yahoo.com/) — ETF data via CORS proxy

## License

Apache-2.0 — see [LICENSE](LICENSE) for details.

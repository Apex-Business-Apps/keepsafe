# KeepSafe - Household Inventory & Recall Management

A progressive web app for managing household items, tracking warranties, and monitoring product recalls.

## Features

- 📦 **Item Management**: Track household items with details like brand, purchase date, warranty, price, serial numbers
- 📷 **Receipt Storage**: Upload and store receipt photos securely
- 🔍 **Barcode Scanning**: Scan product barcodes using your device camera
- ⚠️ **Recall Monitoring**: Automatic checks against CPSC and Health Canada recall databases
- 📄 **PDF Export**: Generate comprehensive PDF inventory reports
- 🔐 **Secure Authentication**: User accounts with email/password authentication
- 📱 **Progressive Web App**: Install on your device for offline access

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:8080` and create an account at `/auth`

## Project Structure

- **Frontend**: React + Vite + TypeScript + Tailwind CSS
- **Backend**: Supabase (Database, Auth, Storage, Edge Functions)
- **Security**: RLS policies, input validation (Zod), secure authentication

## Edge Functions

- **check-recalls**: `https://aljdaazlgjcfwirqfjuc.supabase.co/functions/v1/check-recalls`
- **ingest-hc-rss**: `https://aljdaazlgjcfwirqfjuc.supabase.co/functions/v1/ingest-hc-rss`

## Documentation

- See `SECURITY.md` for security considerations
- PWA manifest at `/manifest.webmanifest`

## License

MIT

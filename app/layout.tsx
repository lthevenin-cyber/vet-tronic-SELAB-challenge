import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = { title: "Vet'Tronic SELAB", description: "Defi Vet'Tronic SELAB", manifest: '/manifest.webmanifest' };
export const viewport: Viewport = { themeColor: '#0f766e', width: 'device-width', initialScale: 1 };
export default function RootLayout({ children }: { children: React.ReactNode }) { return <html lang="fr"><body>{children}</body></html>; }

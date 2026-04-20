import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import Navbar from '@/components/Navbar'

export const metadata: Metadata = {
  title: 'EM Feed',
  description: 'Emergency medicine literature and blog feed',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main className="max-w-3xl mx-auto px-4 pb-16 pt-4">
          {children}
        </main>
        <Toaster
          position="bottom-center"
          toastOptions={{
            style: {
              background: '#1a1d27',
              color: '#e5e7eb',
              border: '1px solid #2a2d3a',
              borderRadius: '8px',
            },
          }}
        />
      </body>
    </html>
  )
}

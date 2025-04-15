import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { FloatingDatabaseButton } from "@/components/floating-database-button"
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'PaperAgent - AI-Powered Paper Writing Assistant',
  description: 'Write research papers with the help of specialized AI agents',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen bg-gradient-to-b from-gray-900 to-black text-white`}>
        {children}
        <FloatingDatabaseButton />
      </body>
    </html>
  )
}

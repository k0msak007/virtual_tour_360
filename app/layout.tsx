import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Virtual Tour 360',
  description: 'Virtual Tour 360',
  generator: 'Virtual Tour 360',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

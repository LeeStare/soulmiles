import './globals.css'

export const metadata = {
  title: 'SoulMiles - 迷霧中的靈魂之旅',
  description: 'Q版暗黑哥德 x 迷霧尋寶主題的旅遊足跡應用',
}

export default function RootLayout({ children }) {
  return (
    <html lang="zh-TW">
      <body>{children}</body>
    </html>
  )
}


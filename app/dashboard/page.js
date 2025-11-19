'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';

/**
 * 心魂監控台頁面
 * 顯示靈魂狀態、天氣、交通、推薦等監控資訊
 */
export default function DashboardPage() {
  const router = useRouter();
  const [userLocation, setUserLocation] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [transportData, setTransportData] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);

  // 獲取用戶位置
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
        },
        (error) => {
          console.error('獲取位置失敗:', error);
          // 使用預設位置（台北）
          setUserLocation({ lat: 25.0330, lon: 121.5654 });
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      // 使用預設位置
      setUserLocation({ lat: 25.0330, lon: 121.5654 });
    }
  }, []);

  // 獲取天氣數據
  useEffect(() => {
    if (userLocation) {
      fetch(`/api/weather?lat=${userLocation.lat}&lon=${userLocation.lon}`)
        .then((res) => res.json())
        .then((data) => {
          if (!data.error) {
            setWeatherData(data);
          }
        })
        .catch((err) => console.error('獲取天氣失敗:', err))
        .finally(() => setLoading(false));
    }
  }, [userLocation]);

  // 獲取交通和推薦數據
  useEffect(() => {
    if (userLocation) {
      // 獲取交通資訊
      Promise.all([
        fetch(`/api/places?lat=${userLocation.lat}&lon=${userLocation.lon}&type=bus_station&radius=2000`).then((res) => res.json()),
        fetch(`/api/places?lat=${userLocation.lat}&lon=${userLocation.lon}&type=train_station&radius=2000`).then((res) => res.json()),
        fetch(`/api/places?lat=${userLocation.lat}&lon=${userLocation.lon}&type=bicycle_store&radius=2000`).then((res) => res.json()),
      ])
        .then(([busData, trainData, bikeData]) => {
          setTransportData({
            bus: busData.places?.slice(0, 3) || [],
            train: trainData.places?.slice(0, 3) || [],
            bike: bikeData.places?.slice(0, 3) || [],
          });
        })
        .catch((err) => console.error('獲取交通資訊失敗:', err));

      // 獲取推薦（住宿和餐廳）
      Promise.all([
        fetch(`/api/places?lat=${userLocation.lat}&lon=${userLocation.lon}&type=lodging&radius=5000`).then((res) => res.json()),
        fetch(`/api/places?lat=${userLocation.lat}&lon=${userLocation.lon}&type=restaurant&radius=5000`).then((res) => res.json()),
      ])
        .then(([lodgingData, restaurantData]) => {
          setRecommendations({
            lodging: lodgingData.places?.slice(0, 3) || [],
            restaurant: restaurantData.places?.slice(0, 3) || [],
          });
        })
        .catch((err) => console.error('獲取推薦失敗:', err));
    }
  }, [userLocation]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a1a] via-[#1a1a2e] to-[#0a0a1a] text-[#f7e7c7]">
      {/* 背景迷霧效果 */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-purple-900/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-900/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10">
        {/* 頂部導航欄 */}
        <div className="sticky top-0 z-20">
          <Header />
        </div>

        {/* 頁面內容 */}
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
          {/* 標題區域 */}
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-400 to-purple-400">
              心魂監控台
            </h1>
            <p className="text-sm text-purple-300/70">監控靈魂狀態，掌握迷霧動向</p>
          </div>

          {/* 指南針/靈魂指標區塊 */}
          <div className="flex justify-center mb-8">
            <div className="relative w-64 h-64 sm:w-80 sm:h-80">
              <svg width="100%" height="100%" viewBox="0 0 200 200" className="drop-shadow-2xl">
                {/* 外圈 */}
                <circle cx="100" cy="100" r="95" fill="none" stroke="rgba(139, 92, 246, 0.3)" strokeWidth="2" strokeDasharray="5,5" />
                <circle cx="100" cy="100" r="85" fill="none" stroke="rgba(99, 102, 241, 0.4)" strokeWidth="1" />
                <circle cx="100" cy="100" r="75" fill="rgba(10, 10, 26, 0.8)" stroke="rgba(139, 92, 246, 0.5)" strokeWidth="3" />
                
                {/* 指針 */}
                <line x1="100" y1="100" x2="100" y2="40" stroke="rgba(251, 191, 36, 0.8)" strokeWidth="3" strokeLinecap="round" />
                <line x1="100" y1="100" x2="100" y2="160" stroke="rgba(99, 102, 241, 0.6)" strokeWidth="2" strokeLinecap="round" />
                
                {/* 方向標記 */}
                <text x="100" y="30" textAnchor="middle" fill="rgba(167, 139, 250, 0.8)" fontSize="16" fontWeight="bold">N</text>
                <text x="100" y="185" textAnchor="middle" fill="rgba(99, 102, 241, 0.6)" fontSize="14">S</text>
                <text x="30" y="105" textAnchor="middle" fill="rgba(167, 139, 250, 0.6)" fontSize="14">W</text>
                <text x="170" y="105" textAnchor="middle" fill="rgba(167, 139, 250, 0.6)" fontSize="14">E</text>
                
                {/* 中心點 */}
                <circle cx="100" cy="100" r="5" fill="rgba(167, 139, 250, 0.8)" />
                <path d="M 100 35 L 95 50 L 100 45 L 105 50 Z" fill="rgba(251, 191, 36, 0.9)" />
              </svg>
              
              {/* 靈魂純淨度文字 */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-xs text-purple-300/60 mb-1">靈魂純淨度</p>
                  <p className="text-2xl font-bold text-purple-300">85%</p>
                </div>
              </div>
            </div>
          </div>

          {/* 數據卡片區域 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* 天氣卡片 */}
            <div className="gothic-button p-4 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">🌊</span>
                <h3 className="text-lg font-semibold text-purple-300">航海氣象</h3>
              </div>
              {loading ? (
                <p className="text-sm text-purple-300/60">載入中...</p>
              ) : weatherData ? (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-purple-300/80">溫度</span>
                    <span className="text-lg font-bold text-purple-300">{weatherData.temperature || 'N/A'}°C</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-purple-300/80">天氣</span>
                    <span className="text-sm text-purple-300">{weatherData.weather || '未知'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-purple-300/80">UV 指數</span>
                    <span className="text-sm text-purple-300">{weatherData.isSunny ? '9 (陽光強烈)' : '4 (霧雨遮蔽)'}</span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-purple-300/60">無法載入天氣數據</p>
              )}
            </div>

            {/* 交通資訊卡片 */}
            <div className="gothic-button p-4 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">🚂</span>
                <h3 className="text-lg font-semibold text-purple-300">交通資訊</h3>
              </div>
              {transportData ? (
                <div className="space-y-2 text-sm">
                  {transportData.train.length > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-purple-300/80">火車站</span>
                      <span className="text-purple-300">{transportData.train[0]?.name || '無資料'}</span>
                    </div>
                  )}
                  {transportData.bus.length > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-purple-300/80">公車站</span>
                      <span className="text-purple-300">{transportData.bus[0]?.name || '無資料'}</span>
                    </div>
                  )}
                  {transportData.bike.length > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-purple-300/80">單車站</span>
                      <span className="text-purple-300">{transportData.bike[0]?.name || '無資料'}</span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-purple-300/60">載入中...</p>
              )}
            </div>

            {/* 住宿推薦卡片 */}
            <div className="gothic-button p-4 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">🏨</span>
                <h3 className="text-lg font-semibold text-purple-300">附近住宿</h3>
              </div>
              {recommendations?.lodging && recommendations.lodging.length > 0 ? (
                <div className="space-y-2">
                  {recommendations.lodging.slice(0, 3).map((place, index) => (
                    <div key={index} className="text-sm">
                      <p className="text-purple-300">{place.name}</p>
                      {place.rating && (
                        <p className="text-xs text-purple-300/60">⭐ {place.rating}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-purple-300/60">載入中...</p>
              )}
            </div>

            {/* 餐廳推薦卡片 */}
            <div className="gothic-button p-4 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">🍴</span>
                <h3 className="text-lg font-semibold text-purple-300">附近餐廳</h3>
              </div>
              {recommendations?.restaurant && recommendations.restaurant.length > 0 ? (
                <div className="space-y-2">
                  {recommendations.restaurant.slice(0, 3).map((place, index) => (
                    <div key={index} className="text-sm">
                      <p className="text-purple-300">{place.name}</p>
                      {place.rating && (
                        <p className="text-xs text-purple-300/60">⭐ {place.rating}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-purple-300/60">載入中...</p>
              )}
            </div>
          </div>

          {/* 底部導航欄 */}
          <footer className="route-footer mt-8">
            <button
              onClick={() => router.push('/routes')}
              className="route-footer__icon"
              aria-label="藏寶圖尋蹤"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span className="route-footer__label">藏寶圖尋蹤</span>
            </button>
            <button
              onClick={() => router.push('/footprints')}
              className="route-footer__icon"
              aria-label="足跡之光"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
              <span className="route-footer__label">足跡之光</span>
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="route-footer__icon route-footer__icon--active"
              aria-label="心魂監控台"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <line x1="3" y1="9" x2="21" y2="9" />
                <line x1="9" y1="21" x2="9" y2="9" />
              </svg>
              <span className="route-footer__label">心魂監控台</span>
            </button>
          </footer>
        </div>
      </div>
    </div>
  );
}


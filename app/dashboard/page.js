'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Header from '../../components/Header';

/**
 * 心魂監控台頁面
 * Q版暗黑哥德 x 航海主題儀表板
 * 參考附圖排版：懸賞單、天氣/溫度、交通/人潮、住宿/餐廳
 */
export default function DashboardPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [userLocation, setUserLocation] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [transportData, setTransportData] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bountyAmount] = useState(Math.floor(Math.random() * (1000000 - 1000 + 1)) + 1000);
  const [bountyIndex, setBountyIndex] = useState(0); // 懸賞單分頁索引

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

  // 觸發登入模態視窗
  const handleLoginClick = () => {
    const headerButton = document.querySelector('header button[title="靈魂聖殿"]');
    if (headerButton) {
      headerButton.click();
    }
  };

  const isSunny = weatherData?.isSunny ?? true;

  return (
    <div className="route-page text-[#f7e7c7]">
      <div className="route-page__bg" style={{ backgroundImage: 'url(/images/routes/route-bg.jpg)' }} />
      <div className="route-page__veil" />

      <div className="route-page__content">
        <Header />

        {/* 標題區域 */}
        <div className="w-full text-center mb-4">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-soul-glow via-gothic-purple to-treasure-gold">
            🧭 心魂監控台
          </h1>
          <p className="text-xs sm:text-sm text-soul-glow/60">
            監控靈魂狀態，掌握迷霧動向
          </p>
        </div>

        {/* 海盜懸賞單卡片（頂部大卡片，參考附圖） */}
        <div className="w-full mb-4">
          <div className="gothic-button p-5 rounded-lg relative overflow-hidden">
            {/* 捲軸裝飾 */}
            <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-[#f0d9b5]/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#f0d9b5]/20 to-transparent" />
            
            {/* 旗幟裝飾 */}
            <div className="absolute top-2 right-4">
              <svg width="40" height="40" viewBox="0 0 100 100" className="text-treasure-gold/30">
                <path d="M 20 20 L 60 20 L 50 40 L 20 40 Z" fill="currentColor" />
                <rect x="20" y="20" width="3" height="60" fill="currentColor" />
              </svg>
            </div>

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-serif text-treasure-gold">🏴‍☠️ 懸賞單</h2>
                <span className="text-xs text-soul-glow/60">WANTED</span>
              </div>
              <div className="text-center mb-4">
                <p className="text-xs text-soul-glow/70 mb-1">越適合出遊獎金越高</p>
                <p className="text-3xl font-bold text-treasure-gold">
                  {bountyAmount.toLocaleString()} <span className="text-lg">SoulCoins</span>
                </p>
              </div>
              {session ? (
                // 登入後顯示用戶頭像
                <div className="flex items-center justify-center">
                  {session.user?.image ? (
                    <img
                      src={session.user.image}
                      alt={session.user.name || 'User'}
                      className="w-16 h-16 rounded-full object-cover border-2 border-treasure-gold/50 shadow-lg"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-treasure-gold/20 border-2 border-treasure-gold/50 flex items-center justify-center">
                      <span className="text-2xl text-treasure-gold">👤</span>
                    </div>
                  )}
                </div>
              ) : (
                // 未登入時顯示登入按鈕
                <button
                  onClick={handleLoginClick}
                  className="w-full py-2 px-4 rounded-lg border border-treasure-gold/50 bg-[#2b1a10]/70 text-treasure-gold text-sm font-semibold hover:bg-treasure-gold/20 transition-colors"
                >
                  登入以領取懸賞
                </button>
              )}
              
              {/* 分頁指示器（三個小圓點） */}
              <div className="flex justify-center gap-2 mt-4">
                {[0, 1, 2].map((index) => (
                  <button
                    key={index}
                    onClick={() => setBountyIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      bountyIndex === index
                        ? 'w-8 bg-treasure-gold'
                        : 'bg-treasure-gold/35'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 第一行：天氣 & 溫度（參考附圖） */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          {/* 天氣卡片 */}
          <div className="gothic-button p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">🌊</span>
              <h3 className="text-sm font-semibold text-soul-glow">天氣</h3>
            </div>
            <p className="text-xs text-soul-glow/60 mb-2">呈現方式: 航行中的小船</p>
            {loading ? (
              <p className="text-xs text-soul-glow/60">載入中...</p>
            ) : (
              <div className="relative w-20 h-20 mx-auto">
                {isSunny ? (
                  // 晴天：Q版小帆船光芒四射
                  <>
                    <div className="absolute inset-0 animate-pulse">
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-treasure-gold/40 to-transparent blur-xl" />
                    </div>
                    <div className="relative z-10">
                      <svg width="80" height="80" viewBox="0 0 100 100" className="text-treasure-gold">
                        {/* 太陽 */}
                        <circle cx="50" cy="50" r="25" fill="currentColor" opacity="0.8" />
                        {/* 光芒 */}
                        {[...Array(8)].map((_, i) => {
                          const angle = (i * 45 * Math.PI) / 180;
                          const x1 = 50 + 25 * Math.cos(angle);
                          const y1 = 50 + 25 * Math.sin(angle);
                          const x2 = 50 + 35 * Math.cos(angle);
                          const y2 = 50 + 35 * Math.sin(angle);
                          return (
                            <line
                              key={i}
                              x1={x1}
                              y1={y1}
                              x2={x2}
                              y2={y2}
                              stroke="currentColor"
                              strokeWidth="2"
                              className="animate-pulse"
                              style={{ animationDelay: `${i * 0.1}s` }}
                            />
                          );
                        })}
                        {/* 小船 */}
                        <path
                          d="M 30 70 Q 50 60 70 70 L 65 80 L 35 80 Z"
                          fill="#654321"
                          opacity="0.7"
                          className="animate-bounce"
                          style={{ animationDuration: '3s' }}
                        />
                        <path d="M 50 70 L 50 50" stroke="#654321" strokeWidth="2" opacity="0.7" />
                        <path d="M 50 50 L 60 40" stroke="#654321" strokeWidth="2" opacity="0.7" />
                      </svg>
                    </div>
                  </>
                ) : (
                  // 雨天：Q版小船風雨飄搖
                  <>
                    <div className="absolute inset-0 animate-pulse">
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500/40 to-transparent blur-xl" />
                    </div>
                    <div className="relative z-10">
                      <svg width="80" height="80" viewBox="0 0 100 100" className="text-blue-400">
                        {/* 雲朵 */}
                        <ellipse cx="40" cy="30" rx="15" ry="10" fill="currentColor" opacity="0.6" />
                        <ellipse cx="60" cy="30" rx="15" ry="10" fill="currentColor" opacity="0.6" />
                        {/* 閃電 */}
                        <path
                          d="M 50 25 L 45 40 L 50 40 L 48 55"
                          stroke="yellow"
                          strokeWidth="2"
                          fill="yellow"
                          className="animate-pulse"
                        />
                        {/* 雨滴 */}
                        {[...Array(6)].map((_, i) => (
                          <line
                            key={i}
                            x1={30 + i * 10}
                            y1={45}
                            x2={30 + i * 10}
                            y2={50}
                            stroke="currentColor"
                            strokeWidth="1"
                            className="animate-bounce"
                            style={{ animationDelay: `${i * 0.1}s`, animationDuration: '0.5s' }}
                          />
                        ))}
                        {/* 小船 */}
                        <path
                          d="M 30 70 Q 50 60 70 70 L 65 80 L 35 80 Z"
                          fill="#654321"
                          opacity="0.7"
                          className="animate-shake"
                        />
                        <path d="M 50 70 L 50 50" stroke="#654321" strokeWidth="2" opacity="0.7" />
                        <path d="M 50 50 L 60 40" stroke="#654321" strokeWidth="2" opacity="0.7" />
                      </svg>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* 溫度卡片 */}
          <div className="gothic-button p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">🌡️</span>
              <h3 className="text-sm font-semibold text-soul-glow">溫度</h3>
            </div>
            <p className="text-xs text-soul-glow/60 mb-2">紫外線指數</p>
            {loading ? (
              <p className="text-xs text-soul-glow/60">載入中...</p>
            ) : weatherData ? (
              <div className="space-y-1">
                <p className="text-2xl font-bold text-treasure-gold">
                  {weatherData.temperature || '25'}°C
                </p>
                <p className="text-xs text-soul-glow/80">
                  UV: {isSunny ? '9 (陽光強烈)' : '4 (霧雨遮蔽)'}
                </p>
              </div>
            ) : (
              <p className="text-xs text-soul-glow/60">無法載入</p>
            )}
          </div>
        </div>

        {/* 第二行：最近交通 & 最近景區人潮（參考附圖） */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          {/* 最近交通卡片 */}
          <div className="gothic-button p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">🚂</span>
              <h3 className="text-sm font-semibold text-soul-glow">最近交通</h3>
            </div>
            {transportData ? (
              <div className="space-y-1.5 text-xs">
                {transportData.train.length > 0 && (
                  <div className="flex items-center gap-1">
                    <span className="text-soul-glow/80">火車</span>
                    <span className="text-soul-glow/60">→</span>
                    <span className="text-treasure-gold">蒸氣</span>
                  </div>
                )}
                {transportData.bus.length > 0 && (
                  <div className="flex items-center gap-1">
                    <span className="text-soul-glow/80">巴士</span>
                    <span className="text-soul-glow/60">→</span>
                    <span className="text-treasure-gold">馬車</span>
                  </div>
                )}
                {transportData.bike.length > 0 && (
                  <div className="flex items-center gap-1">
                    <span className="text-soul-glow/80">單車</span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-soul-glow/60">載入中...</p>
            )}
          </div>

          {/* 最近景區人潮卡片 */}
          <div className="gothic-button p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">🧭</span>
              <h3 className="text-sm font-semibold text-soul-glow">最近景區人潮</h3>
            </div>
            <p className="text-xs text-soul-glow/60 mb-2">敵軍標示</p>
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full bg-treasure-gold/60"
                  />
                ))}
              </div>
              <span className="text-xs text-soul-glow/80">中度擁擠</span>
            </div>
          </div>
        </div>

        {/* 第三行：最近住宿三項 & 最近餐廳三項（參考附圖） */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {/* 最近住宿卡片 */}
          <div className="gothic-button p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">🏨</span>
              <h3 className="text-sm font-semibold text-soul-glow">最近住宿三項</h3>
            </div>
            <p className="text-xs text-soul-glow/60 mb-2">小酒館</p>
            {recommendations?.lodging && recommendations.lodging.length > 0 ? (
              <div className="space-y-1 text-xs">
                {recommendations.lodging.slice(0, 3).map((place, index) => (
                  <div key={index} className="text-soul-glow/80 truncate">
                    {place.name}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-soul-glow/60">載入中...</p>
            )}
          </div>

          {/* 最近餐廳卡片 */}
          <div className="gothic-button p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">🍴</span>
              <h3 className="text-sm font-semibold text-soul-glow">最近餐廳三項</h3>
            </div>
            <p className="text-xs text-soul-glow/60 mb-2">美食</p>
            {recommendations?.restaurant && recommendations.restaurant.length > 0 ? (
              <div className="space-y-1 text-xs">
                {recommendations.restaurant.slice(0, 3).map((place, index) => (
                  <div key={index} className="text-soul-glow/80 truncate">
                    {place.name}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-soul-glow/60">載入中...</p>
            )}
          </div>
        </div>

        {/* 底部導航欄 */}
        <footer className="route-footer">
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
            onClick={() => router.push('/footprint')}
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
  );
}


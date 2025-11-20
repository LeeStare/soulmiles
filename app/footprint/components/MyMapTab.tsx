'use client';

import { useState } from 'react';
import FootprintMap from './FootprintMap';
import FlipBook from './FlipBook';
import MapRecordModal from './MapRecordModal';

/**
 * MyMapTab - 我的地圖 Tab 內容
 * 包含地圖顯示、印記按鈕、翻書動畫
 */
export default function MyMapTab() {
  const [showMapRecordModal, setShowMapRecordModal] = useState(false);
  const [showFlipBook, setShowFlipBook] = useState(false);
  const [mapRecordMode, setMapRecordMode] = useState<'input' | 'edit' | null>(null);

  const handleImprintClick = () => {
    setShowMapRecordModal(true);
  };

  const handleInputClick = () => {
    setMapRecordMode('input');
    setShowMapRecordModal(true);
  };

  const handleEditClick = () => {
    setMapRecordMode('edit');
    setShowMapRecordModal(true);
  };

  if (showFlipBook) {
    return <FlipBook onClose={() => setShowFlipBook(false)} />;
  }

  return (
    <div className="flex flex-col gap-4 mb-4">
      {/* 地圖區域 */}
      <div className="w-full h-[400px] sm:h-[500px] relative rounded-lg overflow-hidden border border-[#f0d9b5]/30">
        <FootprintMap />
      </div>

      {/* 功能按鈕區域 */}
      <div className="flex flex-col gap-3 w-full">
        {/* 印記按鈕 */}
        <button
          onClick={handleImprintClick}
          className="gothic-button px-6 py-3 rounded-lg text-center font-bold text-lg text-[#f7e7c7] hover:text-[#fbbf24] transition-colors shadow-lg"
          style={{
            fontFamily: 'serif',
            letterSpacing: '0.1em',
          }}
        >
          ✨ 印記
        </button>

        {/* 命運之書按鈕 */}
        <button
          onClick={() => setShowFlipBook(true)}
          className="gothic-button px-6 py-3 rounded-lg text-center font-bold text-lg text-[#f7e7c7] hover:text-[#fbbf24] transition-colors shadow-lg"
          style={{
            fontFamily: 'serif',
            letterSpacing: '0.1em',
          }}
        >
          📖 命運之書
        </button>
      </div>

      {/* MapRecord 模態視窗 */}
      {showMapRecordModal && (
        <MapRecordModal
          mode={mapRecordMode}
          onClose={() => {
            setShowMapRecordModal(false);
            setMapRecordMode(null);
          }}
          onInputClick={handleInputClick}
          onEditClick={handleEditClick}
        />
      )}
    </div>
  );
}


'use client';

import { useState, useEffect } from 'react';
import Modal from '../../../components/Modal';

interface MapRecordModalProps {
  mode: 'input' | 'edit' | null;
  onClose: () => void;
  onInputClick: () => void;
  onEditClick: () => void;
}

/**
 * MapRecordModal - 足跡記錄模態視窗
 * 包含選擇「輸入」或「編輯」的初始狀態，以及實際的輸入/編輯表單
 */
export default function MapRecordModal({ mode, onClose, onInputClick, onEditClick }: MapRecordModalProps) {
  const [showModeSelection, setShowModeSelection] = useState(mode === null);
  const [currentMode, setCurrentMode] = useState<'input' | 'edit' | null>(mode);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [pictures, setPictures] = useState<string[]>([]);
  const [currentPicture, setCurrentPicture] = useState('');
  const [loading, setLoading] = useState(false);

  // 如果是初始狀態，顯示模式選擇
  if (showModeSelection || currentMode === null) {
    return (
      <Modal
        title="印記"
        subtitle="選擇您的操作"
        onClose={onClose}
      >
        <div className="space-y-3">
          <button
            onClick={() => {
              setShowModeSelection(false);
              setCurrentMode('input');
              onInputClick();
            }}
            className="w-full rounded-xl border border-[#fbbf24]/30 bg-[#2b1a10]/70 px-4 py-3 text-left hover:border-[#fbbf24] transition-colors"
          >
            <p className="text-sm font-semibold text-[#fbbf24]">輸入</p>
            <p className="text-xs text-[#f7e7c7]/70">新增新的足跡記錄</p>
          </button>
          <button
            onClick={() => {
              setShowModeSelection(false);
              setCurrentMode('edit');
              onEditClick();
            }}
            className="w-full rounded-xl border border-[#fbbf24]/30 bg-[#2b1a10]/70 px-4 py-3 text-left hover:border-[#fbbf24] transition-colors"
          >
            <p className="text-sm font-semibold text-[#fbbf24]">編輯</p>
            <p className="text-xs text-[#f7e7c7]/70">編輯現有的足跡記錄</p>
          </button>
        </div>
      </Modal>
    );
  }

  const handleAddPicture = () => {
    if (currentPicture.trim()) {
      setPictures([...pictures, currentPicture]);
      setCurrentPicture('');
    }
  };

  const handleRemovePicture = (index: number) => {
    setPictures(pictures.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      alert('請輸入地點名稱');
      return;
    }

    setLoading(true);
    try {
      // 獲取當前位置
      let coordinate: string | null = null;
      if (typeof window !== 'undefined' && navigator.geolocation) {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        coordinate = `${position.coords.latitude},${position.coords.longitude}`;
      }

      const response = await fetch('/api/footprint/map-records', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          description,
          coordinate,
          pictures,
        }),
      });

      if (response.ok) {
        alert('足跡記錄已保存');
        onClose();
        // 重置表單
        setName('');
        setDescription('');
        setPictures([]);
      } else {
        const error = await response.json();
        alert(`保存失敗: ${error.error || '未知錯誤'}`);
      }
    } catch (error) {
      console.error('保存足跡記錄失敗:', error);
      alert('保存失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={currentMode === 'input' ? '輸入足跡記錄' : '編輯足跡記錄'}
      subtitle="記錄您的美好回憶"
      onClose={onClose}
      primaryAction={
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full rounded-lg bg-[#fbbf24] py-2 text-sm font-semibold text-[#1b0e07] shadow-lg hover:bg-[#f59e0b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? '保存中...' : '保存'}
        </button>
      }
    >
      <div className="space-y-4">
        {/* 地點名稱 */}
        <div>
          <label className="block text-sm font-semibold text-[#f7e7c7] mb-2">
            地點名稱 *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg bg-[#2b1a10]/70 border border-[#fbbf24]/30 px-3 py-2 text-[#f7e7c7] focus:border-[#fbbf24] focus:outline-none"
            placeholder="輸入地點名稱"
          />
        </div>

        {/* 地點回憶 */}
        <div>
          <label className="block text-sm font-semibold text-[#f7e7c7] mb-2">
            地點回憶
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full rounded-lg bg-[#2b1a10]/70 border border-[#fbbf24]/30 px-3 py-2 text-[#f7e7c7] focus:border-[#fbbf24] focus:outline-none resize-none"
            placeholder="記錄您在此地的回憶..."
          />
        </div>

        {/* 照片輸入 */}
        <div>
          <label className="block text-sm font-semibold text-[#f7e7c7] mb-2">
            照片 (Base64 或 URL)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={currentPicture}
              onChange={(e) => setCurrentPicture(e.target.value)}
              className="flex-1 rounded-lg bg-[#2b1a10]/70 border border-[#fbbf24]/30 px-3 py-2 text-[#f7e7c7] focus:border-[#fbbf24] focus:outline-none"
              placeholder="輸入照片 URL 或 Base64"
            />
            <button
              onClick={handleAddPicture}
              className="px-4 py-2 rounded-lg bg-[#6b46c1] text-[#f7e7c7] hover:bg-[#5b21b6] transition-colors"
            >
              添加
            </button>
          </div>
          {pictures.length > 0 && (
            <div className="mt-2 space-y-2">
              {pictures.map((pic, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-[#2b1a10]/50 rounded">
                  <span className="text-xs text-[#f7e7c7]/70 flex-1 truncate">{pic.substring(0, 50)}...</span>
                  <button
                    onClick={() => handleRemovePicture(index)}
                    className="text-[#fbbf24] hover:text-red-400 text-sm"
                  >
                    移除
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}


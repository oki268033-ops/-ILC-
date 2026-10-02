import React, { useState } from 'react';
import { Eye, EyeOff, Lock, ShieldCheck, X } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface AdminLoginModalProps {
  onLoginSuccess: () => void;
  onClose: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  onLoginSuccess,
  onClose,
}) => {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundManager.playClickSound();

    if (loginId.trim() === 'i-lion' && password === 'oki2023') {
      soundManager.playSuccessSound();
      setErrorMessage(null);
      onLoginSuccess();
    } else {
      soundManager.playClickSound();
      setErrorMessage('ログインIDまたはパスワードが正しくありません。');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div
        className="bg-slate-900 w-full max-w-md rounded-3xl border border-slate-700 shadow-2xl overflow-hidden text-slate-100 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-blue-950 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-xl shadow-sm">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest block">
                STAFF AUTHENTICATION
              </span>
              <h3 className="text-base font-bold text-white">運営管理本部 ログイン</h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="text-xs text-slate-400 leading-relaxed">
            教職員・運営スタッフ専用の管理画面です。指定のログインIDとパスワードを入力してください。
          </div>

          {errorMessage && (
            <div className="p-3 bg-red-500/20 border border-red-500/40 rounded-xl text-red-300 text-xs font-semibold flex items-center gap-2 animate-fade-in">
              <span className="text-red-400 font-bold">✕</span>
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 block">ログインID</label>
            <input
              type="text"
              autoComplete="username"
              value={loginId}
              onChange={(e) => {
                setLoginId(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              placeholder="ログインIDを入力（例: i-lion）"
              className="w-full px-3.5 py-2.5 bg-slate-800 rounded-xl border border-slate-700 text-white text-xs sm:text-sm focus:border-amber-400 focus:outline-none placeholder:text-slate-500"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 block">パスワード</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder="パスワードを入力"
                className="w-full pl-3.5 pr-10 py-2.5 bg-slate-800 rounded-xl border border-slate-700 text-white text-xs sm:text-sm focus:border-amber-400 focus:outline-none placeholder:text-slate-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                title={showPassword ? 'パスワードを隠す' : 'パスワードを表示'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>管理画面へログイン</span>
            </button>
          </div>

          <div className="text-center pt-1">
            <button
              type="button"
              onClick={onClose}
              className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              キャンセル（参加者画面に戻る）
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

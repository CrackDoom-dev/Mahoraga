import React, { useState } from 'react';
import { Profile } from '../types';
import { NAMA_BULAN } from '../utils/formatters';
import { ShieldCheck, Calendar, Target, User, Sparkles } from 'lucide-react';

interface OnboardingProfileProps {
  onComplete: (profile: Profile) => void;
}

export const OnboardingProfile: React.FC<OnboardingProfileProps> = ({ onComplete }) => {
  const currentYear = new Date().getFullYear();
  const [nama, setNama] = useState('');
  const [targetTujuan, setTargetTujuan] = useState('');
  const [tanggal, setTanggal] = useState<number | ''>(new Date().getDate());
  const [bulan, setBulan] = useState<number | ''>(new Date().getMonth() + 1);
  const [tahun, setTahun] = useState<number | ''>(currentYear + 1);

  // Errors state
  const [errors, setErrors] = useState<{
    nama?: string;
    targetTujuan?: string;
    tanggalTarget?: string;
  }>({});

  const validate = (): boolean => {
    const newErrors: {
      nama?: string;
      targetTujuan?: string;
      tanggalTarget?: string;
    } = {};

    if (!nama.trim()) {
      newErrors.nama = 'Nama wajib diisi.';
    }

    if (!targetTujuan.trim()) {
      newErrors.targetTujuan = 'Target tujuan wajib diisi.';
    }

    if (!tanggal || !bulan || !tahun) {
      newErrors.tanggalTarget = 'Tanggal, bulan, dan tahun harus lengkap.';
    } else {
      const t = Number(tanggal);
      const b = Number(bulan);
      const y = Number(tahun);

      // Validate valid calendar date (e.g. 31 Februari check)
      const d = new Date(y, b - 1, t);
      const isValidDate =
        d.getFullYear() === y && d.getMonth() === b - 1 && d.getDate() === t;

      if (!isValidDate) {
        newErrors.tanggalTarget = 'Tanggal tidak valid dalam kalender.';
      } else {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (d <= today) {
          newErrors.tanggalTarget = 'Tanggal target harus setelah hari ini.';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const newProfile: Profile = {
      nama: nama.trim(),
      targetTujuan: targetTujuan.trim(),
      tanggalTarget: {
        tanggal: Number(tanggal),
        bulan: Number(bulan),
        tahun: Number(tahun),
      },
      avatar: '🌟',
      level: 1,
      rank: 'Perintis Finansial',
    };

    onComplete(newProfile);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-gradient-to-b from-[#1d1850] via-[#15132f] to-[#0e0d22] text-[#f2f0ff]">
      <div className="w-full max-w-md glass-card p-6 sm:p-8 rounded-[24px] border border-white/10 shadow-2xl animate-[fadeIn_0.4s_ease-out]">
        {/* Header Logo */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#7c6cf5] to-[#8f81ff] flex items-center justify-center shadow-[0_0_24px_rgba(124,108,245,0.4)] mb-3">
            <svg className="w-8 h-8 text-white" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="38"
                fill="none"
                stroke="rgba(255, 255, 255, 0.3)"
                strokeWidth="12"
              />
              <circle
                cx="50"
                cy="50"
                r="38"
                fill="none"
                stroke="#ffffff"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray="238"
                strokeDashoffset="60"
                transform="rotate(-90 50 50)"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-[#f2f0ff]">
            Buat profilmu
          </h2>
          <p className="text-xs text-[#a7a3c9] mt-1.5 leading-relaxed max-w-xs">
            Isi sekali saja. Profil tersimpan di HP dan dimuat otomatis setiap aplikasi dibuka.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nama */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#a7a3c9] mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#7c6cf5]" />
              Nama Lengkap <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={nama}
              onChange={(e) => {
                setNama(e.target.value);
                if (errors.nama) setErrors({ ...errors, nama: undefined });
              }}
              placeholder="Contoh: Arcksword atau Budi"
              className={`w-full min-h-[46px] px-4 rounded-xl bg-white/5 border text-sm text-[#f2f0ff] placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#7c6cf5] transition-all ${
                errors.nama ? 'border-red-400 bg-red-400/5' : 'border-white/10 focus:border-[#7c6cf5]'
              }`}
            />
            {errors.nama && (
              <p className="text-xs text-red-400 mt-1 pl-1">{errors.nama}</p>
            )}
          </div>

          {/* Target Tujuan */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#a7a3c9] mb-1.5 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-[#3fc9b0]" />
              Target Tujuan <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={targetTujuan}
              onChange={(e) => {
                setTargetTujuan(e.target.value);
                if (errors.targetTujuan) setErrors({ ...errors, targetTujuan: undefined });
              }}
              placeholder="Contoh: Beli Motor Baru / Bebas Utang 2027"
              className={`w-full min-h-[46px] px-4 rounded-xl bg-white/5 border text-sm text-[#f2f0ff] placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#7c6cf5] transition-all ${
                errors.targetTujuan ? 'border-red-400 bg-red-400/5' : 'border-white/10 focus:border-[#7c6cf5]'
              }`}
            />
            {errors.targetTujuan && (
              <p className="text-xs text-red-400 mt-1 pl-1">{errors.targetTujuan}</p>
            )}
          </div>

          {/* Tanggal Target */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#a7a3c9] mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#5aa9ff]" />
              Tanggal Target <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {/* Tanggal */}
              <div>
                <select
                  value={tanggal}
                  onChange={(e) => {
                    setTanggal(Number(e.target.value));
                    if (errors.tanggalTarget) setErrors({ ...errors, tanggalTarget: undefined });
                  }}
                  className="w-full min-h-[46px] px-2.5 rounded-xl bg-[#15132f] border border-white/10 text-xs text-[#f2f0ff] focus:outline-none focus:ring-2 focus:ring-[#7c6cf5]"
                >
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                    <option key={d} value={d} className="bg-[#15132f] text-white">
                      Tgl {d}
                    </option>
                  ))}
                </select>
              </div>

              {/* Bulan */}
              <div>
                <select
                  value={bulan}
                  onChange={(e) => {
                    setBulan(Number(e.target.value));
                    if (errors.tanggalTarget) setErrors({ ...errors, tanggalTarget: undefined });
                  }}
                  className="w-full min-h-[46px] px-2 rounded-xl bg-[#15132f] border border-white/10 text-xs text-[#f2f0ff] focus:outline-none focus:ring-2 focus:ring-[#7c6cf5]"
                >
                  {NAMA_BULAN.map((m, idx) => (
                    <option key={idx + 1} value={idx + 1} className="bg-[#15132f] text-white">
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tahun */}
              <div>
                <select
                  value={tahun}
                  onChange={(e) => {
                    setTahun(Number(e.target.value));
                    if (errors.tanggalTarget) setErrors({ ...errors, tanggalTarget: undefined });
                  }}
                  className="w-full min-h-[46px] px-2.5 rounded-xl bg-[#15132f] border border-white/10 text-xs text-[#f2f0ff] focus:outline-none focus:ring-2 focus:ring-[#7c6cf5]"
                >
                  {Array.from({ length: 10 }, (_, i) => currentYear + i).map((y) => (
                    <option key={y} value={y} className="bg-[#15132f] text-white">
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {errors.tanggalTarget && (
              <p className="text-xs text-red-400 mt-1 pl-1">{errors.tanggalTarget}</p>
            )}
          </div>

          {/* Kotak Info sesuai prompt */}
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-start gap-3 mt-4">
            <ShieldCheck className="w-4 h-4 text-[#7c6cf5] mt-0.5 shrink-0" />
            <p className="text-xs text-[#a7a3c9] leading-relaxed">
              Setelah profil dibuat, semua progres mulai dari 0% sampai kamu mencatat minggu pertama.
            </p>
          </div>

          {/* Tombol Buat Profil */}
          <button
            type="submit"
            className="w-full min-h-[50px] mt-6 flex items-center justify-center gap-2 rounded-xl font-semibold text-white bg-gradient-to-r from-[#7c6cf5] to-[#8f81ff] shadow-[0_4px_20px_rgba(124,108,245,0.4)] active:scale-[0.98] transition-all hover:brightness-110"
          >
            <Sparkles className="w-4 h-4" />
            <span>Buat profil dan mulai</span>
          </button>
        </form>
      </div>
    </div>
  );
};

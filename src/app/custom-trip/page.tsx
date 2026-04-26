'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { MessageCircle } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';

const tripDays = [
  { nights: 3, days: 4, label: '4天3夜' },
  { nights: 4, days: 5, label: '5天4夜' },
  { nights: 5, days: 6, label: '6天5夜' },
  { nights: 6, days: 7, label: '7天6夜' },
  { nights: 7, days: 8, label: '8天7夜' },
];

const budgets = [
  { value: 3000, label: '3,000' },
  { value: 4000, label: '4,000' },
  { value: 5000, label: '5,000' },
  { value: 6000, label: '6,000' },
  { value: 7000, label: '7,000+' },
];

const crowdTypes = [
  { value: 'couple', label: '情侣/蜜月', emoji: '💑' },
  { value: 'friends', label: '闺蜜', emoji: '👭' },
  { value: 'family', label: '家庭/亲子老小', emoji: '👨‍👩‍👧‍👦' },
  { value: 'diver', label: '深潜/海岛玩家', emoji: '🤿' },
  { value: 'party', label: '兄弟轰趴', emoji: '🍻' },
];

const preferences = [
  { value: 'show', label: '秀场', icon: '🎭' },
  { value: 'island', label: '跳岛', icon: '🏝️' },
  { value: 'nightlife', label: '夜生活', icon: '🌃' },
  { value: 'food', label: '美食', icon: '🍜' },
  { value: 'photo', label: '出片', icon: '📸' },
  { value: 'diving', label: '深潜', icon: '🤿' },
  { value: 'fishing', label: '海钓', icon: '🎣' },
  { value: 'party', label: '轰趴', icon: '🎉' },
  { value: 'shooting', label: '射击', icon: '🎯' },
];

// 生成订单号：CT + 时间戳后8位
function genOrderNo() {
  return 'CT' + Date.now().toString().slice(-8);
}

export default function CustomTripPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [selectedDays, setSelectedDays] = useState<number | null>(null);
  const [startDate, setStartDate] = useState('');
  const [selectedBudget, setSelectedBudget] = useState<number | null>(null);
  const [people, setPeople] = useState(2);
  const [crowdType, setCrowdType] = useState<string | null>(null);
  const [selectedPrefs, setSelectedPrefs] = useState<string[]>([]);
  // 固定一个订单号，整个组件生命周期不变
  const orderNo = useMemo(() => genOrderNo(), []);

  const togglePref = (value: string) => {
    setSelectedPrefs(prev =>
      prev.includes(value) ? prev.filter(p => p !== value) : [...prev, value]
    );
  };

  const canNext = () => {
    if (step === 1) return selectedDays !== null && startDate !== '';
    if (step === 2) return selectedBudget !== null;
    if (step === 3) return people > 0;
    if (step === 4) return crowdType !== null;
    return true;
  };

  // 生成微信跳转链接（weixin:// 在手机上可直接呼起微信）
  // 同时准备文字内容方便用户复制发给客服
  const buildWechatMsg = () => {
    const dayInfo = tripDays.find(d => d.nights === selectedDays);
    const budgetInfo = budgets.find(b => b.value === selectedBudget);
    const crowdInfo = crowdTypes.find(c => c.value === crowdType);
    const prefLabels = selectedPrefs
      .map(v => preferences.find(p => p.value === v)?.label)
      .filter(Boolean)
      .join('、');

    return [
      `🌴 普吉旅行定制需求`,
      `📋 订单号：${orderNo}`,
      `📅 行程天数：${dayInfo?.label ?? '-'}`,
      `🗓️ 出发日期：${startDate || '待定'}`,
      `💰 人均预算：¥${budgetInfo?.label ?? '-'}/天`,
      `👥 出行人数：${people}人`,
      `🎯 旅行类型：${crowdInfo ? `${crowdInfo.emoji} ${crowdInfo.label}` : '-'}`,
      `✨ 偏好体验：${prefLabels || '未选择'}`,
      ``,
      `请帮我定制专属行程，谢谢！🙏`,
    ].join('\n');
  };

  const steps = ['行程', '预算', '人数', '偏好', '完成'];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="relative h-48 md:h-64 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1920&q=80"
          alt="定制旅行"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-4 left-4 md:left-8 text-white">
          <h1 className="text-2xl md:text-4xl font-bold">定制旅行</h1>
          <p className="text-sm md:text-lg text-white/80 mt-1">告诉我们你的需求，专属定制普吉之旅</p>
        </div>
      </div>

      {/* Progress */}
      <div className="bg-white shadow-sm sticky top-14 md:top-16 z-40">
        <div className="max-w-xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {steps.map((s, i) => (
              <div key={s} className="flex items-center">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${step > i + 1 ? 'bg-ocean-500 text-white' : step === i + 1 ? 'bg-ocean-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                  {step > i + 1 ? '✓' : i + 1}
                </div>
                <span className="hidden sm:block ml-1 text-xs font-medium text-gray-500">{s}</span>
                {i < steps.length - 1 && (
                  <div className={`w-6 md:w-10 h-0.5 mx-1 ${step > i + 1 ? 'bg-ocean-500' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 步骤内容区：底部留足空间给固定 CTA */}
      <div className="max-w-xl mx-auto px-4 py-6 pb-36">

        {/* Step 1: 天数 + 出发日期 */}
        {step === 1 && (
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-1">选择你的行程</h2>
            <p className="text-sm text-gray-500 mb-5">想去普吉玩几天？</p>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
              {tripDays.map(day => (
                <button
                  key={day.nights}
                  onClick={() => setSelectedDays(day.nights)}
                  className={`py-4 rounded-xl text-center font-semibold transition-all ${selectedDays === day.nights ? 'bg-ocean-500 text-white shadow-lg scale-105' : 'bg-gray-50 text-gray-700 hover:bg-ocean-50'}`}
                >
                  <div className="text-sm">{day.label}</div>
                </button>
              ))}
            </div>
            <div className="mt-5">
              <label className="text-sm font-medium text-gray-700 mb-2 block">选择出发日期 <span className="text-red-500">*</span></label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-ocean-500"
              />
            </div>
          </div>
        )}

        {/* Step 2: 预算 */}
        {step === 2 && (
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-1">人均预算</h2>
            <p className="text-sm text-gray-500 mb-5">每人每天的预算（人民币）</p>
            <div className="grid grid-cols-5 gap-2">
              {budgets.map(b => (
                <button
                  key={b.value}
                  onClick={() => setSelectedBudget(b.value)}
                  className={`py-4 rounded-xl text-center transition-all ${selectedBudget === b.value ? 'bg-ocean-500 text-white shadow-lg scale-105' : 'bg-gray-50 text-gray-700 hover:bg-ocean-50'}`}
                >
                  <div className="text-xs font-medium">¥{b.label}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: 人数 */}
        {step === 3 && (
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-1">出行人数</h2>
            <p className="text-sm text-gray-500 mb-5">你们一共几个人？</p>
            <div className="flex items-center justify-center gap-6 py-6">
              <button
                onClick={() => setPeople(Math.max(1, people - 1))}
                className="w-14 h-14 rounded-full bg-gray-100 text-gray-700 text-2xl font-bold flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                −
              </button>
              <div className="w-24 h-24 rounded-2xl bg-ocean-50 flex items-center justify-center">
                <span className="text-4xl font-bold text-ocean-600">{people}</span>
                <span className="text-sm text-ocean-500 ml-1">人</span>
              </div>
              <button
                onClick={() => setPeople(people + 1)}
                className="w-14 h-14 rounded-full bg-ocean-500 text-white text-2xl font-bold flex items-center justify-center hover:bg-ocean-600 transition-colors"
              >
                +
              </button>
            </div>
          </div>
        )}

        {/* Step 4: 人群类型 */}
        {step === 4 && (
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-1">出行人群</h2>
            <p className="text-sm text-gray-500 mb-5">你们是什么类型的旅行？</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {crowdTypes.map(c => (
                <button
                  key={c.value}
                  onClick={() => setCrowdType(c.value)}
                  className={`flex items-center gap-3 p-4 rounded-xl transition-all ${crowdType === c.value ? 'bg-ocean-500 text-white shadow-lg' : 'bg-gray-50 text-gray-700 hover:bg-ocean-50'}`}
                >
                  <span className="text-2xl">{c.emoji}</span>
                  <span className="font-medium">{c.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 5: 喜好 */}
        {step === 5 && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-1">喜好选择</h2>
              <p className="text-sm text-gray-500 mb-5">可多选，告诉我们你想要的体验</p>
              <div className="grid grid-cols-3 gap-3">
                {preferences.map(p => (
                  <button
                    key={p.value}
                    onClick={() => togglePref(p.value)}
                    className={`flex flex-col items-center gap-1 p-4 rounded-xl transition-all ${selectedPrefs.includes(p.value) ? 'bg-ocean-500 text-white shadow-lg' : 'bg-gray-50 text-gray-700 hover:bg-ocean-50'}`}
                  >
                    <span className="text-2xl">{p.icon}</span>
                    <span className="text-xs font-medium text-center">{p.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 订单预览 */}
            <div className="bg-ocean-50 border border-ocean-200 rounded-2xl p-5">
              <h3 className="font-bold text-ocean-800 mb-3">📋 需求摘要</h3>
              <div className="space-y-1.5 text-sm text-gray-700">
                <div className="flex justify-between"><span className="text-gray-500">订单号</span><span className="font-mono font-bold text-ocean-700">{orderNo}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">行程天数</span><span>{tripDays.find(d => d.nights === selectedDays)?.label}</span></div>
                {startDate && <div className="flex justify-between"><span className="text-gray-500">出发日期</span><span>{startDate}</span></div>}
                <div className="flex justify-between"><span className="text-gray-500">人均预算</span><span>¥{budgets.find(b => b.value === selectedBudget)?.label}/天</span></div>
                <div className="flex justify-between"><span className="text-gray-500">出行人数</span><span>{people}人</span></div>
                <div className="flex justify-between"><span className="text-gray-500">旅行类型</span><span>{crowdTypes.find(c => c.value === crowdType)?.label}</span></div>
                {selectedPrefs.length > 0 && (
                  <div className="flex justify-between"><span className="text-gray-500">偏好</span><span>{selectedPrefs.map(v => preferences.find(p => p.value === v)?.icon).join(' ')}</span></div>
                )}
              </div>
            </div>

            {/* 提示文案 */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-700">
              <strong>点击下方按钮</strong>将自动打开微信，并复制需求内容，发给客服即可完成定制预约 🎉
            </div>
          </div>
        )}
      </div>

      {/* Bottom CTA - fixed，足够高的 bottom 兼容手机底部 Tab Bar */}
      <div className="fixed bottom-16 md:bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 z-50">
        <div className="max-w-xl mx-auto flex gap-3">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="flex-1 py-4 rounded-full border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
            >
              上一步
            </button>
          )}
          {step < 5 ? (
            <button
              onClick={() => {
                if (!canNext()) {
                  if (step === 1 && !startDate) {
                    alert('请选择出发日期');
                  }
                  return;
                }
                setStep(step + 1);
              }}
              disabled={!canNext()}
              className={`flex-1 py-4 rounded-full font-semibold transition-colors ${canNext() ? 'bg-ocean-500 text-white hover:bg-ocean-600' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
            >
              下一步
            </button>
          ) : (
            <button
              onClick={() => {
                if (!user) {
                  router.push('/auth/login?next=/custom-trip');
                  return;
                }
                const msg = buildWechatMsg();
                // 复制到剪贴板
                if (navigator.clipboard) {
                  navigator.clipboard.writeText(msg).catch(() => {});
                }
                // 跳转微信（手机端会呼起微信）
                window.location.href = 'weixin://';
              }}
              className="flex-1 py-4 rounded-full bg-green-500 text-white font-semibold hover:bg-green-600 transition-colors flex items-center justify-center gap-2 shadow-lg"
            >
              <MessageCircle className="w-5 h-5" />
              复制需求 · 打开微信
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

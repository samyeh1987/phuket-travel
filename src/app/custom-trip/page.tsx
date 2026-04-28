'use client';

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Loader2, MessageCircle, Check } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { createClient } from '@/lib/supabase';

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

const contactMethods = [
  { id: 'line', label: 'Line', icon: '📱', placeholder: '请输入您的 Line ID' },
  { id: 'wechat', label: '微信', icon: '💬', placeholder: '请输入您的微信号' },
  { id: 'whatsapp', label: 'WhatsApp', icon: '📲', placeholder: '请输入您的 WhatsApp 号码' },
  { id: 'telegram', label: 'Telegram', icon: '✈️', placeholder: '请输入您的 Telegram ID' },
];

// 生成订单号：CT + 时间戳后8位
function genOrderNo() {
  return 'CT' + Date.now().toString().slice(-8);
}

export default function CustomTripPage() {
  const router = useRouter();
  const { user } = useAuth();
  const supabase = createClient();
  const [step, setStep] = useState(1);
  const [selectedDays, setSelectedDays] = useState<number | null>(null);
  const [startDate, setStartDate] = useState('');
  const [selectedBudget, setSelectedBudget] = useState<number | null>(null);
  const [people, setPeople] = useState(2);
  const [crowdType, setCrowdType] = useState<string | null>(null);
  const [selectedPrefs, setSelectedPrefs] = useState<string[]>([]);

  // Step 5: 联系信息
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [contactValue, setContactValue] = useState('');

  // Step 6: 提交成功
  const [submitted, setSubmitted] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // 客服二维码
  const [serviceQrs, setServiceQrs] = useState<{ wechat?: string; line?: string }>({});

  // 固定一个订单号，整个组件生命周期不变
  const orderNo = useMemo(() => genOrderNo(), []);

  // 获取客服二维码
  useEffect(() => {
    const fetchQrs = async () => {
      const { data } = await supabase
        .from('system_settings')
        .select('key, value')
        .in('key', ['service_wechat_qr', 'service_line_qr']);

      if (data) {
        const qrs: any = {};
        data.forEach((item: any) => {
          if (item.key === 'service_wechat_qr') qrs.wechat = item.value;
          if (item.key === 'service_line_qr') qrs.line = item.value;
        });
        setServiceQrs(qrs);
      }
    };
    fetchQrs();
  }, []);

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
    if (step === 5) return true; // 喜好选择是可选的
    if (step === 6) return selectedContact !== null && contactValue.trim() !== '';
    return true;
  };

  const steps = ['行程', '预算', '人数', '偏好', '联系', '完成'];

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
      {!submitted && (
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
      )}

      {/* 步骤内容区 */}
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
              <div className="relative">
                <input
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:border-ocean-500 focus:ring-2 focus:ring-ocean-100 transition-colors bg-white appearance-none cursor-pointer"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">📅</span>
              </div>
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

            {/* 错误提示 */}
            {submitError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600">
                {submitError}
              </div>
            )}
          </div>
        )}

        {/* Step 6: 联系信息 */}
        {step === 6 && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-1">留下您的联系方式</h2>
              <p className="text-sm text-gray-500 mb-5">客服将添加您为好友进行沟通</p>

              {/* 联系选项 */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                {contactMethods.map(m => (
                  <button
                    key={m.id}
                    onClick={() => { setSelectedContact(m.id); setContactValue(''); }}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-all ${selectedContact === m.id ? 'bg-ocean-500 text-white shadow-lg' : 'bg-gray-50 text-gray-700 hover:bg-ocean-50'}`}
                  >
                    <span className="text-2xl">{m.icon}</span>
                    <span className="text-sm font-medium">{m.label}</span>
                  </button>
                ))}
              </div>

              {/* 输入框 */}
              {selectedContact && (
                <div className="animate-fadeIn">
                  <input
                    type="text"
                    value={contactValue}
                    onChange={e => setContactValue(e.target.value)}
                    placeholder={contactMethods.find(m => m.id === selectedContact)?.placeholder}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-ocean-500"
                  />
                  {contactValue.trim() && (
                    <div className="mt-3 flex items-center gap-2 text-green-600 text-sm">
                      <Check className="w-4 h-4" />
                      已填写 {contactMethods.find(m => m.id === selectedContact)?.label} ID
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 隐私提示 */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-start gap-2">
                <MessageCircle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-amber-700">
                  <p className="font-medium">隐私提示</p>
                  <p className="mt-1">您的联系方式仅用于客服与您沟通行程细节，不会用于其他用途。</p>
                </div>
              </div>
            </div>

            {/* 错误提示 */}
            {submitError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600">
                {submitError}
              </div>
            )}
          </div>
        )}

        {/* Step 7: 提交成功 - 显示客服二维码 */}
        {submitted && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-5 shadow-sm text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-500" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">提交成功！</h2>
              <p className="text-gray-500 text-sm mb-4">您的定制旅行需求已收到，客服将在 24 小时内联系您</p>
              <div className="bg-ocean-50 rounded-xl p-4 text-left">
                <p className="text-sm text-ocean-700"><span className="font-medium">订单号：</span><span className="font-mono">{orderNo}</span></p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">📱 添加客服好友</h3>
              <p className="text-sm text-gray-500 text-center mb-4">扫描下方二维码添加客服微信/Line，快速获得服务</p>

              <div className="grid grid-cols-2 gap-4">
                {/* 微信客服 */}
                {serviceQrs.wechat && (
                  <div className="text-center">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="w-20 h-20 mx-auto mb-2 bg-gray-200 rounded-lg overflow-hidden relative">
                        <img src={serviceQrs.wechat} alt="微信客服" className="w-full h-full object-contain" />
                      </div>
                      <p className="font-medium text-gray-700">微信客服</p>
                      <p className="text-xs text-gray-400 mt-1">长按识别二维码</p>
                    </div>
                  </div>
                )}

                {/* Line 客服 */}
                {serviceQrs.line && (
                  <div className="text-center">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="w-20 h-20 mx-auto mb-2 bg-gray-200 rounded-lg overflow-hidden relative">
                        <img src={serviceQrs.line} alt="Line客服" className="w-full h-full object-contain" />
                      </div>
                      <p className="font-medium text-gray-700">Line 客服</p>
                      <p className="text-xs text-gray-400 mt-1">长按识别二维码</p>
                    </div>
                  </div>
                )}

                {/* 如果没有设置二维码 */}
                {!serviceQrs.wechat && !serviceQrs.line && (
                  <div className="col-span-2 text-center py-8 text-gray-400">
                    <p>暂未设置客服二维码</p>
                    <p className="text-sm mt-1">请联系客服获取联系方式</p>
                  </div>
                )}
              </div>
            </div>

            {/* 返回首页 */}
            <button
              onClick={() => router.push('/')}
              className="w-full py-4 rounded-full bg-ocean-500 text-white font-semibold hover:bg-ocean-600 transition-colors"
            >
              返回首页
            </button>
          </div>
        )}
      </div>

      {/* Bottom CTA - fixed */}
      {!submitted && (
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
            {step < 6 ? (
              <button
                onClick={() => {
                  if (!canNext()) {
                    if (step === 1 && !startDate) {
                      alert('请选择出发日期');
                    }
                    if (step === 6 && !contactValue.trim()) {
                      alert('请填写您的联系方式');
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
                onClick={async () => {
                  if (!user) {
                    router.push('/auth/login?next=/custom-trip');
                    return;
                  }

                  setSubmitting(true);
                  setSubmitError('');

                  // 构建订单数据
                  const dayInfo = tripDays.find(d => d.nights === selectedDays);
                  const budgetInfo = budgets.find(b => b.value === selectedBudget);
                  const crowdInfo = crowdTypes.find(c => c.value === crowdType);
                  const contactMethod = contactMethods.find(m => m.id === selectedContact);

                  const orderData = {
                    user_id: user.id,
                    type: 'custom',
                    status: 'pending',
                    contact_status: 'pending_contact', // 定制旅行专用：待联系
                    travel_date: startDate || null,
                    quantity: people,
                    total_price: budgetInfo && dayInfo ? budgetInfo.value * dayInfo.days * people : 0,
                    contact_email: user.email,
                    contact_wechat: selectedContact === 'wechat' ? contactValue : null,
                    extra_data: {
                      trip_days: dayInfo?.label,
                      budget_per_day: selectedBudget,
                      crowd_type: crowdType,
                      crowd_label: crowdInfo ? `${crowdInfo.emoji} ${crowdInfo.label}` : null,
                      preferences: selectedPrefs.map(v => preferences.find(p => p.value === v)?.label).filter(Boolean),
                      contact_method: contactMethod?.label,
                      contact_value: contactValue,
                    },
                  };

                  // 保存到数据库
                  const { data, error } = await supabase.from('orders').insert(orderData).select('id').single();
                  if (error) {
                    console.error('订单保存失败:', error);
                    setSubmitError(`订单保存失败：${error.message}`);
                    setSubmitting(false);
                    return;
                  }

                  setOrderId(data.id);
                  setSubmitted(true);
                  setSubmitting(false);
                }}
                disabled={submitting}
                className="flex-1 py-4 rounded-full bg-ocean-500 text-white font-semibold hover:bg-ocean-600 transition-colors flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
              >
                {submitting && <Loader2 className="w-5 h-5 animate-spin" />}
                {submitting ? '提交中...' : '提交订单'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

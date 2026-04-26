'use client';

import { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { ChevronLeft, MessageCircle, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';

// 所有课程定义
const divingTypes = [
  { id: 'experience', title: '体验深潜', price: 1800, needEmail: false },
  { id: 'ow', title: '水肺OW考证', price: 2800, needEmail: true },
  { id: 'aow', title: '水肺AOW考证', price: 2500, needEmail: true },
  { id: 'free2', title: '自由潜2星', price: 2200, needEmail: true },
  { id: 'free3', title: '自由潜3星', price: 3000, needEmail: true },
];

interface DivingPerson {
  startDate: string;
  name: string;
  passportNo: string;
  gender: string;
  birthdate: string;
  height: string;
  weight: string;
  shoeSize: string;
  vision: string;
  email: string;
  hotel: string;
  hotelAddress: string;
  phone: string;
  allergy: string;
}

const emptyPerson = (): DivingPerson => ({
  startDate: '', name: '', passportNo: '', gender: '', birthdate: '',
  height: '', weight: '', shoeSize: '', vision: '',
  email: '', hotel: '', hotelAddress: '', phone: '', allergy: '',
});

function genOrderNo() {
  return 'DV' + Date.now().toString().slice(-8);
}

// 从 URL params 解析选课
function parseSelectedItems(search: string) {
  if (!search) return [];
  try {
    const params = new URLSearchParams(search);
    const itemsParam = params.get('items') || '';
    if (!itemsParam) return [];
    return itemsParam.split(',').map(token => {
      const [id, qtyStr] = token.split(':');
      const def = divingTypes.find(d => d.id === id);
      if (!def) return null;
      return { id, title: def.title, price: def.price, qty: parseInt(qtyStr) || 1, needEmail: def.needEmail };
    }).filter(Boolean) as { id: string; title: string; price: number; qty: number; needEmail: boolean }[];
  } catch {
    return [];
  }
}

export default function DivingBookPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-400">加载中...</div>}>
      <DivingBookContent />
    </Suspense>
  );
}

function DivingBookContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const selectedItems = useMemo(() => parseSelectedItems(searchParams.toString()), [searchParams]);
  const orderNo = useMemo(() => genOrderNo(), []);
  const totalPeople = selectedItems.reduce((s, i) => s + i.qty, 0);
  const totalPrice = selectedItems.reduce((s, i) => s + i.price * i.qty, 0);
  const needEmailCourses = selectedItems.filter(i => i.needEmail && i.qty > 0);

  const [persons, setPersons] = useState<DivingPerson[]>(
    Array.from({ length: totalPeople }, emptyPerson)
  );
  const [expanded, setExpanded] = useState<number[]>([0]);
  const [submitted, setSubmitted] = useState(false);

  const toggleExpand = (i: number) => {
    setExpanded(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);
  };

  const updatePerson = (index: number, field: keyof DivingPerson, value: string) => {
    setPersons(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const buildWechatMsg = () => {
    const lines = [
      `🤿 普吉深潜预订`,
      `📋 订单号：${orderNo}`,
      `📦 项目：${selectedItems.map(i => `${i.title}×${i.qty}`).join('、')}`,
      `💰 总价：¥${totalPrice.toLocaleString()}`,
      `👥 共 ${totalPeople} 人`,
      ``,
    ];
    persons.forEach((p, i) => {
      lines.push(`━━ 第${i + 1}人 ━━`);
      lines.push(`行程开始日期：${p.startDate || '-'}`);
      lines.push(`姓名：${p.name || '-'}`);
      lines.push(`护照：${p.passportNo || '-'}`);
      lines.push(`性别：${p.gender || '-'}  生日：${p.birthdate || '-'}`);
      lines.push(`身高：${p.height || '-'}cm  体重：${p.weight || '-'}kg  鞋码：${p.shoeSize || '-'}`);
      lines.push(`近视：${p.vision ? p.vision + '度' : '无'}`);
      if (needEmailCourses.length > 0) lines.push(`邮箱：${p.email || '-'}`);
      lines.push(`酒店：${p.hotel || '-'}`);
      if (p.hotelAddress) lines.push(`地址：${p.hotelAddress}`);
      lines.push(`电话：${p.phone || '未填写'}`);
      lines.push(`过敏：${p.allergy || '无'}`);
      lines.push('');
    });
    lines.push('请确认预订，谢谢！🙏');
    return lines.join('\n');
  };

  const handleSubmit = () => {
    if (!user) {
      router.push('/auth/login?next=/diving/book?' + searchParams.toString());
      return;
    }
    const msg = buildWechatMsg();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(msg).catch(() => {});
    }
    setSubmitted(true);
    setTimeout(() => {
      window.location.href = 'weixin://';
    }, 300);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8 text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">信息已复制！</h1>
        <p className="text-gray-500 mb-6">正在打开微信，请直接粘贴发送给客服</p>
        <div className="bg-white rounded-xl p-4 w-full max-w-xs shadow">
          <div className="text-sm text-gray-500 mb-1">订单号</div>
          <div className="font-mono font-bold text-ocean-600 text-lg">{orderNo}</div>
        </div>
        <Link href="/diving" className="mt-6 text-sm text-gray-400 hover:text-gray-600">← 返回深潜页面</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40 flex items-center gap-3 px-4 py-4">
        <Link href="/diving" className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="font-bold text-gray-900">深潜报名表</h1>
          <p className="text-xs text-gray-500">每人填写一份，信息需与护照一致</p>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 py-4 pb-36 space-y-4">

        {/* 订单摘要 */}
        <div className="bg-ocean-50 border border-ocean-200 rounded-2xl p-4">
          <div className="flex justify-between items-start mb-2">
            <h2 className="font-bold text-ocean-800">预订摘要</h2>
            <span className="font-mono text-xs text-ocean-600 bg-ocean-100 px-2 py-1 rounded-full">{orderNo}</span>
          </div>
          {selectedItems.map(item => (
            <div key={item.id} className="flex justify-between text-sm py-1">
              <span className="text-gray-700">{item.title} × {item.qty}人</span>
              <span className="font-medium text-ocean-700">¥{(item.price * item.qty).toLocaleString()}</span>
            </div>
          ))}
          <div className="flex justify-between font-bold text-base pt-2 mt-2 border-t border-ocean-200">
            <span>合计</span>
            <span className="text-ocean-700">¥{totalPrice.toLocaleString()}</span>
          </div>
        </div>

        {/* 邮箱提示 */}
        {needEmailCourses.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
            <Info className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-700">
              <strong>考证课程必须填写本人邮箱</strong>（{needEmailCourses.map(i => i.title).join('、')}），PADI证书将发送到此邮箱。体验潜水无需填写。
            </div>
          </div>
        )}

        {/* 每人表单 */}
        {persons.map((person, idx) => (
          <div key={idx} className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {/* 折叠标题 */}
            <button
              onClick={() => toggleExpand(idx)}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-ocean-500 text-white flex items-center justify-center font-bold text-sm">
                  {idx + 1}
                </div>
                <div className="text-left">
                  <div className="font-semibold text-gray-900">
                    {person.name || `第 ${idx + 1} 位出行人`}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {person.passportNo ? `护照：${person.passportNo}` : '点击填写信息'}
                  </div>
                </div>
              </div>
              {expanded.includes(idx) ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>

            {/* 展开内容 */}
            {expanded.includes(idx) && (
              <div className="px-5 pb-5 space-y-4 border-t border-gray-100">
                {/* 行程开始日期 */}
                <div className="pt-4">
                  <label className="text-xs font-medium text-gray-500 mb-1.5 block">行程开始日期 *</label>
                  <input
                    type="date"
                    value={person.startDate}
                    onChange={e => updatePerson(idx, 'startDate', e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500"
                  />
                </div>

                {/* 基本信息 */}
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1.5 block">姓名（与护照一致） *</label>
                  <input
                    type="text"
                    placeholder="例：张三 / ZHANG SAN"
                    value={person.name}
                    onChange={e => updatePerson(idx, 'name', e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1.5 block">护照号码 *</label>
                  <input
                    type="text"
                    placeholder="例：E12345678"
                    value={person.passportNo}
                    onChange={e => updatePerson(idx, 'passportNo', e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1.5 block">性别 *</label>
                    <select
                      value={person.gender}
                      onChange={e => updatePerson(idx, 'gender', e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500 bg-white"
                    >
                      <option value="">请选择</option>
                      <option value="男">男</option>
                      <option value="女">女</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1.5 block">出生日期 *</label>
                    <input
                      type="date"
                      value={person.birthdate}
                      onChange={e => updatePerson(idx, 'birthdate', e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500"
                    />
                  </div>
                </div>

                {/* 体型信息 */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1.5 block">身高（cm） *</label>
                    <input
                      type="number"
                      placeholder="170"
                      value={person.height}
                      onChange={e => updatePerson(idx, 'height', e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1.5 block">体重（kg） *</label>
                    <input
                      type="number"
                      placeholder="60"
                      value={person.weight}
                      onChange={e => updatePerson(idx, 'weight', e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1.5 block">鞋码（EU） *</label>
                    <input
                      type="number"
                      placeholder="42"
                      value={person.shoeSize}
                      onChange={e => updatePerson(idx, 'shoeSize', e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1.5 block">近视度数（无近视填 0） *</label>
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="0"
                      value={person.vision}
                      onChange={e => updatePerson(idx, 'vision', e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500 pr-12"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">度</span>
                  </div>
                </div>

                {/* 邮箱（考证课程必填） */}
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1.5 flex items-center gap-1 block">
                    邮箱
                    {needEmailCourses.length > 0 && (
                      <span className="text-red-500 font-bold">*（考证课程必填）</span>
                    )}
                  </label>
                  <input
                    type="email"
                    placeholder="用于接收PADI证书"
                    value={person.email}
                    onChange={e => updatePerson(idx, 'email', e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500"
                  />
                </div>

                {/* 住宿 */}
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1.5 block">预定酒店名字 *</label>
                  <input
                    type="text"
                    placeholder="例：普吉岛假日酒店"
                    value={person.hotel}
                    onChange={e => updatePerson(idx, 'hotel', e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1.5 block">详细地址 *</label>
                  <input
                    type="text"
                    placeholder="例：Patong Beach, Phuket 83150 或 Google Maps 链接"
                    value={person.hotelAddress}
                    onChange={e => updatePerson(idx, 'hotelAddress', e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500"
                  />
                </div>

                {/* 联系电话 */}
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1.5 block">
                    联系电话
                    <span className="text-gray-400 font-normal">（如未购买泰国电话卡可先不填）</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="+66 / +86"
                    value={person.phone}
                    onChange={e => updatePerson(idx, 'phone', e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500"
                  />
                </div>

                {/* 食物过敏 */}
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1.5 block">食品过敏源（无则留空）</label>
                  <input
                    type="text"
                    placeholder="例：海鲜、花生、乳制品"
                    value={person.allergy}
                    onChange={e => updatePerson(idx, 'allergy', e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500"
                  />
                </div>
              </div>
            )}
          </div>
        ))}

        {/* 提示 */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
          <strong>📌 温馨提示：</strong>每人一份表格。如有多项课程，客服会帮忙补充填写其他项目的信息，无需重复提交。
        </div>

        {/* 提交按钮 */}
        <div className="bg-ocean-500 text-white rounded-2xl p-5 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <div>
              <div className="text-sm opacity-80">合计 {totalPeople} 人 · {selectedItems.length} 项课程</div>
              <div className="text-3xl font-bold">¥{totalPrice.toLocaleString()}</div>
            </div>
            <div className="text-right text-xs opacity-70">
              <div>订单号</div>
              <div className="font-mono">{orderNo}</div>
            </div>
          </div>
          <button
            onClick={handleSubmit}
            className="w-full py-4 bg-white text-ocean-600 rounded-full font-bold text-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-5 h-5" />
            提交报名 · 发送给客服
          </button>
          <p className="text-xs text-center text-white/60 mt-2">将自动复制信息并打开微信</p>
        </div>
      </div>
    </div>
  );
}

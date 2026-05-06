'use client'

import { useState, useMemo, useEffect } from 'react'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import { Clock, Users, CheckCircle, ChevronLeft, Plus, MessageCircle, Loader2 } from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'
import { createClient } from '@/lib/supabase'
import ImageCarousel from '@/components/ImageCarousel'

// 通过后端 API 查询岛屿数据和船只套餐（使用 service role key 绕过 RLS）
async function fetchIslandDetail(slug: string) {
  const res = await fetch(`/api/packages/islands?slug=${encodeURIComponent(slug)}`)
  if (!res.ok) {
    const json = await res.json().catch(() => ({}))
    throw new Error(json.error || `HTTP ${res.status}`)
  }
  return res.json()
}

interface IslandInfo {
  id: string
  name: string
  slug: string
  description: string
  image_url: string
  images: string[]
}

interface BoatOption {
  id: string; name: string; description: string; itinerary: string; price: string; price_cny: string;
  departure_time: string; duration: string; includes: string[]; images: string[];
}

interface Traveler {
  nameCn: string; nameEn: string; passport: string; birthdate: string;
}

function genOrderNo() { return 'IS' + Date.now().toString().slice(-8); }

const fmtCny = (v: string | number | null | undefined) => {
  const n = Number(v);
  return isNaN(n) || n <= 0 ? null : n.toLocaleString();
};

export default function IslandDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const island = params.island as string

  const [islandInfo, setIslandInfo] = useState<IslandInfo | null>(null)
  const [boats, setBoats] = useState<BoatOption[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!island) return
    setLoading(true)
    setError(null)

    fetchIslandDetail(island)
      .then(json => {
        const { island: islandData, boats: boatList } = json.data
        // 确保 images 是数组，如果没有则用 image_url 作为第一个元素
        const processedIsland = {
          ...islandData,
          images: islandData.images && islandData.images.length > 0
            ? islandData.images
            : islandData.image_url
              ? [islandData.image_url]
              : ['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80']
        }
        setIslandInfo(processedIsland)
        setBoats((boatList || []).map((b: any) => ({
          ...b,
          includes: b.includes || [],
          images: b.images || [],
        })))
      })
      .catch(err => {
        console.error('获取岛屿数据失败:', err)
        setError(err.message || '加载失败')
      })
      .finally(() => setLoading(false))
  }, [island])

  const orderNo = useMemo(() => genOrderNo(), [])
  const [selectedBoat, setSelectedBoat] = useState<typeof boats[0] | null>(null)
  const [tab, setTab] = useState<'detail' | 'book'>('detail')
  const [people, setPeople] = useState(2)
  const [travelDate, setTravelDate] = useState('')
  const [hotelName, setHotelName] = useState('')
  const [hotelAddress, setHotelAddress] = useState('')
  const [contactNameCn, setContactNameCn] = useState('')
  const [contactNameEn, setContactNameEn] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [contactWechat, setContactWechat] = useState('')
  const [travelers, setTravelers] = useState<Traveler[]>([{ nameCn: '', nameEn: '', passport: '', birthdate: '' }])
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [showBackToTop, setShowBackToTop] = useState(false)

  // Track scroll position for back-to-top button
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // 加载中
  if (loading || !islandInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-ocean-500" />
      </div>
    )
  }

  // 错误显示
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">加载失败</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <a
            href="/island-tour"
            className="px-6 py-3 bg-ocean-500 text-white rounded-xl hover:bg-ocean-600 transition-colors"
          >
            返回岛屿列表
          </a>
        </div>
      </div>
    )
  }

  // 岛屿不存在
  if (!islandInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <div className="text-gray-400 text-6xl mb-4">🏝️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">岛屿不存在</h2>
          <p className="text-gray-600 mb-6">该岛屿可能已被删除或网址不正确</p>
          <a
            href="/island-tour"
            className="px-6 py-3 bg-ocean-500 text-white rounded-xl hover:bg-ocean-600 transition-colors"
          >
            返回岛屿列表
          </a>
        </div>
      </div>
    )
  }

  const addTraveler = () => {
    setTravelers([...travelers, { nameCn: '', nameEn: '', passport: '', birthdate: '' }])
  }

  const updateTraveler = (index: number, field: keyof Traveler, value: string) => {
    const updated = [...travelers]
    updated[index] = { ...updated[index], [field]: value }
    setTravelers(updated)
  }

  const buildWechatMsg = () => {
    const lines = [
      `🏝️ 跳岛游预订`,
      `📋 订单号：${orderNo}`,
      `📍 目的地：${islandInfo?.name || '-'}`,
      `🚢 船只：${selectedBoat?.name ?? '-'}`,
      `📅 出行日期：${travelDate || '待定'}`,
      `👥 人数：${people}人`,
      `💰 总金额：฿${selectedBoat ? (Number(selectedBoat.price) * people).toLocaleString() : '-'}（¥${selectedBoat ? (fmtCny((Number(selectedBoat.price_cny) || Number(selectedBoat.price)) * people) || '-') : '-'})`,
      ``,
      `🏨 酒店：${hotelName || '-'}`,
      `📍 地址：${hotelAddress || '-'}`,
      ``,
      `👤 联系人：${contactNameCn} / ${contactNameEn || '-'}`,
      `📞 电话：${contactPhone || '-'}`,
      `📧 邮箱：${contactEmail || '-'}`,
      `💬 微信：${contactWechat || '-'}`,
      ``,
    ]
    travelers.forEach((t, i) => {
      lines.push(`━━ 出行人 ${i + 1} ━━`)
      lines.push(`姓名：${t.nameCn} / ${t.nameEn || '-'}`)
      lines.push(`护照：${t.passport || '-'}`)
      lines.push(`生日：${t.birthdate || '-'}`)
      lines.push('')
    })
    lines.push('请确认预订，谢谢！🙏')
    return lines.join('\n')
  }

  const handleSubmit = async () => {
    if (!user) {
      router.push(`/auth/login?next=${encodeURIComponent(`/island-tour/${island}`)}`)
      return
    }
    if (!selectedBoat || !travelDate || !contactNameCn || !contactPhone) {
      alert('请填写必填信息（出行日期、姓名、联系电话）')
      return
    }

    setSubmitting(true)
    setSubmitError('')

    // Build order data
    const orderData = {
      order_number: orderNo,
      user_id: user.id,
      type: 'island',
      status: 'pending',
      payment_status: 'unpaid',
      travel_date: travelDate,
      quantity: people,
      total_price: selectedBoat ? Number(selectedBoat.price_cny || selectedBoat.price) * people : 0,
      contact_name_cn: contactNameCn,
      contact_name_en: contactNameEn,
      contact_phone: contactPhone,
      contact_email: contactEmail,
      contact_wechat: contactWechat,
      hotel_name: hotelName,
      hotel_address: hotelAddress,
      extra_data: {
        island: island,
        island_name: islandInfo?.name || '',
        boat: selectedBoat,
        travelers: travelers,
      },
    }

    // Save to database（orders 表用户自己插入，RLS 允许已登录用户写入自己的订单）
    const supabase = createClient()
    const { data, error } = await supabase.from('orders').insert(orderData).select('id').single()
    if (error) {
      console.error('订单保存失败:', error)
      setSubmitError('订单保存失败，请重试')
      setSubmitting(false)
      return
    }

    const msg = buildWechatMsg()
    if (navigator.clipboard) {
      navigator.clipboard.writeText(msg).catch(() => {})
    }

    // Redirect to payment page
    router.push(`/payment/${data.id}`)
    setSubmitting(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero with Carousel */}
      <div className="relative">
        <ImageCarousel
          images={islandInfo?.images && islandInfo.images.length > 0 ? islandInfo.images : islandInfo?.image_url ? [islandInfo.image_url] : ['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80']}
          alt={islandInfo?.name || '岛屿'}
          aspectRatio="hero"
          autoPlay={true}
          autoPlayInterval={5000}
          className="h-48 md:h-64"
        />
        <div className="absolute top-4 left-4 z-20 md:hidden">
          <a href="/island-tour" className="w-10 h-10 bg-white/80 rounded-full flex items-center justify-center">
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </a>
        </div>
        <div className="absolute bottom-4 left-4 md:left-8 text-white z-20">
          <h1 className="text-2xl md:text-4xl font-bold drop-shadow-lg">{islandInfo?.name}</h1>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white sticky top-14 md:top-16 z-40 shadow-sm">
        <div className="max-w-4xl mx-auto flex">
          {[['detail', '岛屿详情'], ['book', '立即预订']].map(([t, label]) => (
            <button
              key={t}
              onClick={() => {
                setTab(t as typeof tab)
                if (t === 'book') {
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }
              }}
              className={`flex-1 py-3.5 text-sm font-semibold border-b-2 transition-colors ${tab === t ? 'text-ocean-600 border-ocean-500' : 'text-gray-400 border-transparent'}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Detail Tab */}
      {tab === 'detail' && (
        <div className="max-w-4xl mx-auto px-4 py-6 pb-36 space-y-6">
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-2">关于{islandInfo?.name}</h2>
            <p className="text-sm text-gray-600 leading-relaxed">{islandInfo?.description || '暂无描述'}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-3">选择船只</h2>
            <div className="space-y-3">
              {boats.map(boat => (
                <div
                  key={boat.id}
                  onClick={() => setSelectedBoat(boat.id === selectedBoat?.id ? null : boat)}
                  className={`flex gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${selectedBoat?.id === boat.id ? 'border-ocean-500 bg-ocean-50' : 'border-gray-100 bg-gray-50 hover:border-ocean-200'}`}
                >
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                    <ImageCarousel
                      images={boat.images && boat.images.length > 0 ? boat.images : ['https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=80']}
                      alt={boat.name}
                      aspectRatio="square"
                      showArrows={boat.images && boat.images.length > 1}
                      showDots={false}
                      autoPlay={false}
                      className="w-full h-full"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-gray-900">{boat.name}</h3>
                      <div className="text-right">
                        <div className="text-ocean-600 font-bold">฿{Number(boat.price).toLocaleString()}</div>
                        <div className="text-green-600 font-semibold text-sm">¥{fmtCny(boat.price_cny) || '-'}</div>
                        <div className="text-xs text-gray-400">/人</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{boat.duration}</span>
                      {boat.departure_time && <span className="flex items-center gap-1">⏰ {boat.departure_time}出发</span>}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {(boat.includes || []).slice(0, 4).map((f: string) => (
                        <span key={f} className="px-1.5 py-0.5 bg-white rounded text-xs text-gray-600">{f}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Book Tab */}
      {tab === 'book' && (
        <div className="max-w-xl mx-auto px-4 py-6 pb-10 space-y-4">
          {!selectedBoat && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-700">
              请先在「岛屿详情」中选择船只
            </div>
          )}

          {/* Order Summary */}
          {selectedBoat && (
            <div className="bg-ocean-50 border border-ocean-200 rounded-2xl p-4">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm text-ocean-700 font-medium">{islandInfo?.name} · {selectedBoat.name}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{selectedBoat.duration}</div>
                </div>
                <span className="font-mono text-xs text-ocean-600 bg-ocean-100 px-2 py-1 rounded-full">{orderNo}</span>
              </div>
            </div>
          )}

          {/* Booking Info */}
          <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-900">预订信息</h3>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">出行日期 *</label>
              <div className="relative">
                <input
                  type="date"
                  value={travelDate}
                  onChange={e => setTravelDate(e.target.value)}
                  className="w-full px-3 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-ocean-500 focus:ring-2 focus:ring-ocean-100 transition-colors bg-white appearance-none cursor-pointer"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">📅</span>
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">人数</label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPeople(Math.max(1, people - 1))}
                  className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-600 hover:bg-gray-200 transition-colors"
                >
                  −
                </button>
                <span className="w-10 text-center font-semibold text-lg">{people}</span>
                <button
                  onClick={() => setPeople(people + 1)}
                  className="w-10 h-10 rounded-full bg-ocean-500 text-white flex items-center justify-center font-bold hover:bg-ocean-600 transition-colors"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Hotel Info */}
          <div className="bg-white rounded-2xl p-5 shadow-sm space-y-3">
            <h3 className="font-bold text-gray-900">酒店信息</h3>
            <input
              type="text"
              placeholder="入住酒店名称"
              value={hotelName}
              onChange={e => setHotelName(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500"
            />
            <input
              type="text"
              placeholder="粘贴地址或链接"
              value={hotelAddress}
              onChange={e => setHotelAddress(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500"
            />
          </div>

          {/* Contact Info */}
          <div className="bg-white rounded-2xl p-5 shadow-sm space-y-3">
            <h3 className="font-bold text-gray-900">联系人信息</h3>
            <input
              type="text"
              placeholder="姓名（中文）*"
              value={contactNameCn}
              onChange={e => setContactNameCn(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500"
            />
            <input
              type="text"
              placeholder="英文名（拼音）"
              value={contactNameEn}
              onChange={e => setContactNameEn(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500"
            />
            <input
              type="tel"
              placeholder="联系电话 *"
              value={contactPhone}
              onChange={e => setContactPhone(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500"
            />
            <input
              type="email"
              placeholder="电子邮箱"
              value={contactEmail}
              onChange={e => setContactEmail(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500"
            />
            <input
              type="text"
              placeholder="微信号（选填）"
              value={contactWechat}
              onChange={e => setContactWechat(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500"
            />
          </div>

          {/* Travelers */}
          <div className="bg-white rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-gray-900">出行人信息</h3>
              <button
                onClick={addTraveler}
                className="flex items-center gap-1 text-sm text-ocean-600 font-medium"
              >
                <Plus className="w-4 h-4" /> 添加出行人
              </button>
            </div>
            {travelers.map((traveler, index) => (
              <div key={index} className="border border-gray-200 rounded-xl p-3 space-y-2">
                <div className="text-xs font-medium text-gray-500">出行人 {index + 1}</div>
                <input
                  type="text"
                  placeholder="中文姓名 *"
                  value={traveler.nameCn}
                  onChange={e => updateTraveler(index, 'nameCn', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500"
                />
                <input
                  type="text"
                  placeholder="英文名（拼音）"
                  value={traveler.nameEn}
                  onChange={e => updateTraveler(index, 'nameEn', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500"
                />
                <input
                  type="text"
                  placeholder="护照号"
                  value={traveler.passport}
                  onChange={e => updateTraveler(index, 'passport', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500"
                />
                <input
                  type="date"
                  placeholder="出生日期"
                  value={traveler.birthdate}
                  onChange={e => updateTraveler(index, 'birthdate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500"
                />
              </div>
            ))}
          </div>

          {/* Submit */}
          {selectedBoat && (
            <div className="bg-gradient-to-r from-ocean-500 to-ocean-600 rounded-2xl p-6 text-white">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <div className="text-sm opacity-80">应付总额</div>
                  <div className="text-3xl font-bold">¥{fmtCny((Number(selectedBoat.price_cny) || Number(selectedBoat.price)) * people) || '-'}</div>
                  <div className="text-xs opacity-70 mt-1">{selectedBoat.name} × {people}人</div>
                </div>
                <div className="text-right text-xs opacity-70">
                  <div>订单号</div>
                  <div className="font-mono">{orderNo}</div>
                </div>
              </div>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full py-4 bg-white text-ocean-600 rounded-full font-bold text-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <MessageCircle className="w-5 h-5" />
                {submitting ? '提交中...' : '提交订单 · 前往支付'}
              </button>
              {submitError && (
                <p className="text-red-200 text-sm text-center mt-2">{submitError}</p>
              )}
              <p className="text-xs text-center text-white/60 mt-2">订单提交后将跳转至支付页面</p>
            </div>
          )}
        </div>
      )}

      {/* Bottom Fixed Bar - Only show on detail tab */}
      {selectedBoat && tab === 'detail' && (
        <div className="fixed bottom-16 md:bottom-0 left-0 right-0 bg-white border-t p-4 z-50 shadow-lg">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500">已选：{selectedBoat.name}</div>
              <div className="text-ocean-600 font-bold text-xl">฿{Number(selectedBoat.price).toLocaleString()}</div>
              <div className="text-green-600 font-semibold text-sm">¥{fmtCny(selectedBoat.price_cny)}起/人</div>
            </div>
            <button
              onClick={() => {
                setTab('book')
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
              className="px-8 py-4 bg-ocean-500 text-white rounded-full font-bold text-lg hover:bg-ocean-600 transition-colors"
            >
              立即预订
            </button>
          </div>
        </div>
      )}

      {/* Back to Top Button */}
      {tab === 'book' && showBackToTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-24 right-4 w-12 h-12 bg-white border border-gray-200 rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors z-40"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
      )}
    </div>
  )
}

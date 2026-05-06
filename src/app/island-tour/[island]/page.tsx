'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import { Clock, Users, CheckCircle, ChevronLeft, Plus, MessageCircle, Loader2, ChevronRight, Expand, X } from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'
import { createClient } from '@/lib/supabase'

// 通过后端 API 查询岛屿数据和船只套餐（使用 service role key 绕过 RLS）
async function fetchIslandDetail(slug: string) {
  const decodedSlug = decodeURIComponent(slug)
  const url = `/api/packages/islands?slug=${encodeURIComponent(decodedSlug)}`
  const res = await fetch(url)
  const text = await res.text()

  let json;
  try {
    json = JSON.parse(text)
  } catch {
    throw new Error(`[解析失败] URL: ${url}\n响应: ${text.substring(0, 500)}`)
  }

  if (!res.ok) {
    throw new Error(`[${res.status}] ${json.error || '未知错误'}\nURL: ${url}`)
  }

  if (!json.data || !json.data.island) {
    throw new Error(`[数据异常] 未找到岛屿\nURL: ${url}\n响应: ${JSON.stringify(json).substring(0, 200)}`)
  }

  return json
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

// 圖片畫廊組件 - 電商風格
function ImageGallery({ images, alt }: { images: string[]; alt: string }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const validImages = images && images.length > 0 ? images : ['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80']

  const goNext = useCallback(() => {
    setCurrentIndex(prev => (prev + 1) % validImages.length)
  }, [validImages.length])

  const goPrev = useCallback(() => {
    setCurrentIndex(prev => (prev - 1 + validImages.length) % validImages.length)
  }, [validImages.length])

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center">
        <button onClick={() => setIsFullscreen(false)} className="absolute top-4 right-4 p-2 text-white hover:bg-white/20 rounded-full z-10">
          <X className="w-6 h-6" />
        </button>
        <button onClick={goPrev} className="absolute left-4 p-3 text-white hover:bg-white/20 rounded-full">
          <ChevronLeft className="w-8 h-8" />
        </button>
        <div className="relative w-full h-full max-w-[90vw] max-h-[90vh]">
          <Image src={validImages[currentIndex]} alt={alt} fill className="object-contain" unoptimized />
        </div>
        <button onClick={goNext} className="absolute right-4 p-3 text-white hover:bg-white/20 rounded-full">
          <ChevronRight className="w-8 h-8" />
        </button>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm bg-black/50 px-3 py-1 rounded-full">
          {currentIndex + 1} / {validImages.length}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {/* 主圖 */}
      <div className="relative aspect-[4/3] md:aspect-[16/10] bg-gray-100 rounded-xl overflow-hidden group">
        <Image
          src={validImages[currentIndex]}
          alt={alt}
          fill
          className="object-cover"
          priority
          unoptimized
        />
        {/* 覆蓋層 */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
        {/* 導航箭頭 */}
        {validImages.length > 1 && (
          <>
            <button onClick={goPrev} className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity md:opacity-100">
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </button>
            <button onClick={goNext} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity md:opacity-100">
              <ChevronRight className="w-5 h-5 text-gray-700" />
            </button>
          </>
        )}
        {/* 全屏按鈕 */}
        <button onClick={() => setIsFullscreen(true)} className="absolute bottom-2 right-2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-lg transition-colors">
          <Expand className="w-4 h-4" />
        </button>
        {/* 計數器 */}
        <div className="absolute top-2 right-2 px-2 py-1 bg-black/50 text-white text-xs rounded-full md:hidden">
          {currentIndex + 1}/{validImages.length}
        </div>
      </div>
      {/* 縮圖導航 */}
      {validImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {validImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`relative w-16 h-12 md:w-20 md:h-14 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${
                idx === currentIndex ? 'border-ocean-500 ring-2 ring-ocean-200' : 'border-transparent hover:border-gray-300'
              }`}
            >
              <Image src={img} alt={`Thumbnail ${idx + 1}`} fill className="object-cover" unoptimized />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function IslandDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const island = params.island as string

  const [islandInfo, setIslandInfo] = useState<IslandInfo | null>(null)
  const [boats, setBoats] = useState<BoatOption[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedBoat, setSelectedBoat] = useState<BoatOption | null>(null)
  const [showBackToTop, setShowBackToTop] = useState(false)

  const orderNo = useMemo(() => genOrderNo(), [])
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

  useEffect(() => {
    if (!island) return
    setLoading(true)
    setError(null)

    fetchIslandDetail(island)
      .then(json => {
        const { island: islandData, boats: boatList } = json.data
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

  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 400)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-ocean-500 mx-auto mb-3" />
          <p className="text-gray-500">加载中...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-6 text-center">
          <div className="text-5xl mb-4">😕</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">加载失败</h2>
          <div className="bg-gray-100 rounded-xl p-4 mt-4 text-left">
            <p className="text-xs text-gray-500 mb-1">Slug:</p>
            <p className="text-sm font-mono break-all">{island}</p>
          </div>
          <div className="bg-red-50 rounded-xl p-4 mt-4">
            <p className="text-xs text-red-500 font-mono break-all">{error}</p>
          </div>
          <div className="flex gap-3 mt-6">
            <a href="/island-tour" className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200">返回列表</a>
            <button onClick={() => window.location.reload()} className="flex-1 py-3 bg-ocean-500 text-white rounded-xl font-medium hover:bg-ocean-600">重试</button>
          </div>
        </div>
      </div>
    )
  }

  if (!islandInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">🏝️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">岛屿不存在</h2>
          <a href="/island-tour" className="px-6 py-3 bg-ocean-500 text-white rounded-xl hover:bg-ocean-600">返回岛屿列表</a>
        </div>
      </div>
    )
  }

  const addTraveler = () => setTravelers([...travelers, { nameCn: '', nameEn: '', passport: '', birthdate: '' }])
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
      ``,
    ]
    travelers.forEach((t, i) => {
      if (t.nameCn) {
        lines.push(`━━ 出行人 ${i + 1} ━━`)
        lines.push(`姓名：${t.nameCn} / ${t.nameEn || '-'}`)
      }
    })
    lines.push('')
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

    const supabase = createClient()
    const { data, error } = await supabase.from('orders').insert(orderData).select('id').single()
    if (error) {
      console.error('订单保存失败:', error)
      setSubmitError('订单保存失败，请重试')
      setSubmitting(false)
      return
    }

    const msg = buildWechatMsg()
    if (navigator.clipboard) navigator.clipboard.writeText(msg).catch(() => {})

    router.push(`/payment/${data.id}`)
    setSubmitting(false)
  }

  const islandImages = islandInfo.images && islandInfo.images.length > 0
    ? islandInfo.images
    : islandInfo.image_url ? [islandInfo.image_url] : ['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80']

  return (
    <div className="min-h-screen bg-gray-50 pb-28 md:pb-0">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <a href="/island-tour" className="flex items-center gap-2 text-gray-700 hover:text-ocean-600">
            <ChevronLeft className="w-5 h-5" />
            <span className="font-medium">返回</span>
          </a>
          <h1 className="font-bold text-gray-900 truncate max-w-[60%]">{islandInfo.name}</h1>
          <div className="w-16" />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-4 space-y-4">
        {/* Image Gallery */}
        <ImageGallery images={islandImages} alt={islandInfo.name} />

        {/* Island Title & Description */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-2">{islandInfo.name}</h2>
          <p className="text-sm text-gray-600 leading-relaxed">{islandInfo.description || '暂无描述'}</p>
        </div>

        {/* Boat Selection */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span>🚤</span> 选择船只套餐
          </h2>
          <div className="space-y-3">
            {boats.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p>暂无船只套餐</p>
              </div>
            ) : boats.map(boat => (
              <div
                key={boat.id}
                onClick={() => setSelectedBoat(selectedBoat?.id === boat.id ? null : boat)}
                className={`relative rounded-2xl overflow-hidden cursor-pointer transition-all ${
                  selectedBoat?.id === boat.id
                    ? 'ring-2 ring-ocean-500 shadow-lg'
                    : 'border border-gray-200 hover:border-ocean-300 hover:shadow-md'
                }`}
              >
                {/* Selected Badge */}
                {selectedBoat?.id === boat.id && (
                  <div className="absolute top-3 right-3 z-10 bg-ocean-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    ✓ 已选择
                  </div>
                )}
                {/* Image */}
                <div className="relative h-40 md:h-48">
                  <Image
                    src={boat.images && boat.images.length > 0 ? boat.images[0] : 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80'}
                    alt={boat.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <div className="absolute bottom-3 left-3 text-white">
                    <h3 className="font-bold text-lg drop-shadow">{boat.name}</h3>
                  </div>
                </div>
                {/* Info */}
                <div className="p-4">
                  <div className="flex items-end justify-between">
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      {boat.duration && (
                        <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-lg">
                          <Clock className="w-4 h-4" />
                          {boat.duration}
                        </span>
                      )}
                      {boat.departure_time && (
                        <span className="bg-gray-100 px-2 py-1 rounded-lg">⏰ {boat.departure_time}</span>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-ocean-600">฿{Number(boat.price).toLocaleString()}</div>
                      <div className="text-sm text-green-600 font-medium">¥{fmtCny(boat.price_cny) || '-'}</div>
                    </div>
                  </div>
                  {boat.description && (
                    <p className="text-sm text-gray-500 mt-2 line-clamp-2">{boat.description}</p>
                  )}
                  {(boat.includes && boat.includes.length > 0) && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {boat.includes.slice(0, 4).map((item, i) => (
                        <span key={i} className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          {item}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fixed Bottom Bar - Mobile */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg md:hidden z-50">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div>
              {selectedBoat ? (
                <>
                  <p className="text-xs text-gray-500">{selectedBoat.name}</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold text-ocean-600">¥{fmtCny((Number(selectedBoat.price_cny) || Number(selectedBoat.price)) * people) || '-'}</span>
                    <span className="text-xs text-gray-400">/{people}人</span>
                  </div>
                </>
              ) : (
                <p className="text-gray-400">请选择船只</p>
              )}
            </div>
            <button
              onClick={() => setTab('book')}
              disabled={!selectedBoat}
              className={`px-6 py-3 rounded-full font-bold text-base transition-colors ${
                selectedBoat
                  ? 'bg-ocean-500 text-white hover:bg-ocean-600'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              立即预订
            </button>
          </div>
        </div>
      </div>

      {/* Booking Section - Desktop */}
      {tab === 'book' && (
        <div className="max-w-xl mx-auto px-4 py-6 space-y-4">
          {/* Back to detail hint */}
          <div className="flex items-center justify-between">
            <button onClick={() => setTab('detail')} className="flex items-center gap-1 text-ocean-600 hover:text-ocean-700">
              <ChevronLeft className="w-4 h-4" /> 返回详情
            </button>
            {selectedBoat && (
              <div className="bg-ocean-50 border border-ocean-200 rounded-xl px-4 py-2">
                <p className="text-sm text-ocean-700 font-medium">{selectedBoat.name}</p>
              </div>
            )}
          </div>

          {/* Order Summary */}
          {selectedBoat && (
            <div className="bg-gradient-to-r from-ocean-500 to-ocean-600 rounded-2xl p-5 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm opacity-80">应付总额</p>
                  <p className="text-3xl font-bold">¥{fmtCny((Number(selectedBoat.price_cny) || Number(selectedBoat.price)) * people) || '-'}</p>
                </div>
                <div className="text-right text-sm opacity-80">
                  <p>单价 ¥{fmtCny(selectedBoat.price_cny) || Number(selectedBoat.price).toLocaleString()}</p>
                  <p>{people}人</p>
                </div>
              </div>
            </div>
          )}

          {/* Booking Form */}
          <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-900">预订信息</h3>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">出行日期 *</label>
              <input
                type="date"
                value={travelDate}
                onChange={e => setTravelDate(e.target.value)}
                className="w-full px-3 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-ocean-500 bg-white"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">人数</label>
              <div className="flex items-center gap-3">
                <button onClick={() => setPeople(Math.max(1, people - 1))} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-600 hover:bg-gray-200">−</button>
                <span className="w-12 text-center font-semibold text-xl">{people}</span>
                <button onClick={() => setPeople(people + 1)} className="w-10 h-10 rounded-full bg-ocean-500 text-white flex items-center justify-center font-bold hover:bg-ocean-600">+</button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm space-y-3">
            <h3 className="font-bold text-gray-900">酒店信息</h3>
            <input type="text" placeholder="入住酒店名称" value={hotelName} onChange={e => setHotelName(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500" />
            <input type="text" placeholder="地址或链接" value={hotelAddress} onChange={e => setHotelAddress(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500" />
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm space-y-3">
            <h3 className="font-bold text-gray-900">联系人 *</h3>
            <input type="text" placeholder="姓名（中文）*" value={contactNameCn} onChange={e => setContactNameCn(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500" />
            <input type="tel" placeholder="联系电话 *" value={contactPhone} onChange={e => setContactPhone(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500" />
            <input type="text" placeholder="微信号（选填）" value={contactWechat} onChange={e => setContactWechat(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500" />
          </div>

          {selectedBoat && (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full py-4 bg-ocean-500 text-white rounded-2xl font-bold text-lg hover:bg-ocean-600 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <MessageCircle className="w-5 h-5" />
              {submitting ? '提交中...' : '提交订单 · 前往支付'}
            </button>
          )}
          {submitError && <p className="text-red-500 text-sm text-center">{submitError}</p>}
        </div>
      )}

      {/* Back to Top */}
      {showBackToTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-24 right-4 w-12 h-12 bg-white border border-gray-200 rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:bg-gray-50 z-40 md:bottom-4"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
      )}
    </div>
  )
}

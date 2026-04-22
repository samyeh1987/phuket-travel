import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-8xl font-bold text-ocean-500 mb-4">404</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">页面不存在</h1>
        <p className="text-gray-500 mb-8">抱歉，您访问的页面不存在或已被移除。</p>
        <Link href="/" className="px-6 py-3 bg-ocean-500 text-white rounded-full font-medium hover:bg-ocean-600 transition-colors">
          返回首页
        </Link>
      </div>
    </div>
  );
}

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">CTS</span>
              </div>
              <span className="text-xl font-bold text-white">Магазин</span>
            </div>
            <p className="text-sm">
              Расходные материалы для принтеров и копировальной техники высокого качества.
            </p>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-white font-semibold mb-4">Категории</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/products?category=toner" className="hover:text-white transition-colors">
                  Тонеры
                </Link>
              </li>
              <li>
                <Link href="/products?category=cartridges" className="hover:text-white transition-colors">
                  Картриджи
                </Link>
              </li>
              <li>
                <Link href="/products?category=drums" className="hover:text-white transition-colors">
                  Фотобарабаны
                </Link>
              </li>
              <li>
                <Link href="/products?category=parts" className="hover:text-white transition-colors">
                  Запчасти
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-semibold mb-4">Поддержка</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Контакты
                </Link>
              </li>
              <li>
                <Link href="/delivery" className="hover:text-white transition-colors">
                  Доставка
                </Link>
              </li>
              <li>
                <Link href="/warranty" className="hover:text-white transition-colors">
                  Гарантия
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Контакты</h3>
            <ul className="space-y-2 text-sm">
              <li>📞 +7 (XXX) XXX-XX-XX</li>
              <li>📧 info@example.com</li>
              <li>📍 г. Москва, ул. Примерная, д. 1</li>
              <li className="pt-2">
                <span className="text-xs text-gray-500">Пн-Пт: 9:00 - 18:00</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} CTS Магазин. Все права защищены.</p>
        </div>
      </div>
    </footer>
  );
}

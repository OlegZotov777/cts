import Link from 'next/link';
import { Package, Truck, Shield, HeadphonesIcon, ArrowRight } from 'lucide-react';

const categories = [
  { name: 'Тонеры', slug: 'toner', icon: '🖨️', description: 'Качественные тонеры для всех типов принтеров' },
  { name: 'Картриджи', slug: 'cartridges', icon: '📦', description: 'Оригинальные и совместимые картриджи' },
  { name: 'Фотобарабаны', slug: 'drums', icon: '🔧', description: 'Фотобарабаны высокого качества' },
  { name: 'Запчасти', slug: 'parts', icon: '⚙️', description: 'Запасные части для принтеров' },
  { name: 'Чернила', slug: 'ink', icon: '🎨', description: 'Чернила для струйных принтеров' },
  { name: 'Бумага', slug: 'paper', icon: '📄', description: 'Бумага и пленки для печати' },
];

const features = [
  {
    icon: Package,
    title: 'Широкий ассортимент',
    description: 'Более 10 000 товаров для принтеров и копировальной техники',
  },
  {
    icon: Truck,
    title: 'Быстрая доставка',
    description: 'Доставка по всей России от 1 дня',
  },
  {
    icon: Shield,
    title: 'Гарантия качества',
    description: 'Только сертифицированная продукция от проверенных поставщиков',
  },
  {
    icon: HeadphonesIcon,
    title: 'Поддержка 24/7',
    description: 'Наши специалисты всегда готовы помочь вам с выбором',
  },
];

export default function Home() {
  return (
    <div className="font-[var(--font-inter)]">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 text-white">
        <div className="container mx-auto px-4 py-20 md:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Расходные материалы для{' '}
              <span className="text-yellow-300">принтеров</span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-10">
              Качественные тонеры, картриджи и запчасти по доступным ценам. Специальные условия для дилеров.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/products"
                className="inline-flex items-center justify-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-50 transition-colors shadow-lg"
              >
                Перейти в каталог
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/10 transition-colors"
              >
                Стать дилером
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Категории товаров</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Выберите нужную категорию или воспользуйтесь поиском для быстрого нахождения товара
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/products?category=${category.slug}`}
                className="group p-6 bg-gray-50 rounded-2xl hover:bg-blue-50 hover:shadow-lg transition-all duration-300"
              >
                <div className="text-4xl mb-4">{category.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {category.name}
                </h3>
                <p className="text-gray-600">{category.description}</p>
                <div className="mt-4 flex items-center text-blue-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  Смотреть товары <ArrowRight className="w-4 h-4 ml-2" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Почему выбирают нас</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Мы предлагаем лучшие условия для наших клиентов
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="w-7 h-7 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Готовы сделать заказ?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Зарегистрируйтесь сейчас и получите доступ к специальным ценам для дилеров
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-50 transition-colors"
            >
              Смотреть каталог
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/10 transition-colors"
            >
              Регистрация
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

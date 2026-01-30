'use client';

import { Product } from '@/types';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { ShoppingCart, Check, Package } from 'lucide-react';
import { useState } from 'react';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const { isDealer } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  const price = isDealer ? product.dealerPrice : product.retailPrice;
  const isAvailable = product.availability === 'В наличии' || product.availability === 'Есть';

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      productName: product.name,
      quantity,
      price,
    });
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const getAvailabilityColor = () => {
    if (product.availability === 'Нет' || product.availability === 'Нет в наличии') {
      return 'text-red-500 bg-red-50';
    }
    if (product.availability === 'Есть' || product.availability === 'В наличии') {
      return 'text-green-600 bg-green-50';
    }
    return 'text-yellow-600 bg-yellow-50';
  };

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden group">
      {/* Image placeholder */}
      <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative overflow-hidden">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <Package className="w-16 h-16 text-gray-400" />
        )}
        {isDealer && (
          <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
            Дилерская цена
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <h3 className="font-medium text-gray-900 line-clamp-2 min-h-[48px]">{product.name}</h3>

        {product.description && (
          <p className="text-sm text-gray-500 line-clamp-2">{product.description}</p>
        )}

        {/* Availability badge */}
        <div
          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getAvailabilityColor()}`}
        >
          {product.availability}
        </div>

        {/* Price */}
        <div className="flex items-baseline justify-between">
          <div>
            <span className="text-2xl font-bold text-gray-900">
              {price.toLocaleString('ru-RU')}
            </span>
            <span className="text-gray-500 ml-1">₽</span>
          </div>
          {isDealer && (
            <span className="text-sm text-gray-400 line-through">
              {product.retailPrice.toLocaleString('ru-RU')} ₽
            </span>
          )}
        </div>

        {/* Add to cart */}
        <div className="flex items-center gap-2 pt-2">
          <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="px-3 py-2 hover:bg-gray-100 transition-colors"
              disabled={!isAvailable}
            >
              -
            </button>
            <input
              type="number"
              value={quantity}
              onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-12 text-center border-x border-gray-300 py-2 focus:outline-none"
              min="1"
              disabled={!isAvailable}
            />
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="px-3 py-2 hover:bg-gray-100 transition-colors"
              disabled={!isAvailable}
            >
              +
            </button>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={!isAvailable || isAdded}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-medium transition-all ${
              isAdded
                ? 'bg-green-500 text-white'
                : isAvailable
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isAdded ? (
              <>
                <Check className="w-5 h-5" />
                Добавлено
              </>
            ) : (
              <>
                <ShoppingCart className="w-5 h-5" />
                В корзину
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

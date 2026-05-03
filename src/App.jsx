import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const ITEMS_PER_PAGE = 40;

export default function App() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(0);
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchItems();
  }, [page]);

  async function fetchItems() {
    setLoading(true);
    const from = page * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;

    const { data, error } = await supabase
      .from('serums')
      .select('*')
      .range(from, to)
      .order('name');

    if (!error) setItems(data || []);
    setLoading(false);
    window.scrollTo(0, 0); // Прокрутка вверх при смене страницы
  }

  async function handleUpdate(e) {
    e.preventDefault();
    const { error } = await supabase
      .from('serums')
      .update({
        descr: editingItem.descr,
        price: editingItem.price,
        'img_src': editingItem['img_src']
      })
      .eq('name', editingItem.name);

    if (!error) {
      setEditingItem(null);
      fetchItems();
    } else {
      alert("Ошибка: " + error.message);
    }
  }

  return (
    <div className="p-4 md:p-8 bg-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-black text-slate-800">SERUMS ADMIN</h1>
          <p className="text-sm text-slate-500">Страница {page + 1}</p>
        </div>

        {loading ? (
          <div className="text-center py-20 text-xl text-gray-500">Загрузка...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {items.map((item) => (
              <div key={item.name} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                <div className="h-48 bg-gray-200">
                  <img src={item['img_src']} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="p-4 flex flex-col flex-grow">
                  <h2 className="font-bold text-gray-800 mb-2 truncate">{item.name}</h2>
                  <p className="text-gray-500 text-xs line-clamp-3 mb-4 flex-grow">
                    {item.descr}
                  </p>
                  <div className="flex justify-between items-center mt-auto">
                    <span className="font-bold text-blue-600">{item.price} ₽</span>
                    <button 
                      onClick={() => setEditingItem(item)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1 rounded-md text-sm transition-colors"
                    >
                      Правка
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Пагинация */}
        <div className="flex justify-center items-center gap-4 mt-12 mb-8">
          <button 
            disabled={page === 0}
            onClick={() => setPage(p => p - 1)}
            className="px-6 py-2 bg-white border rounded-lg disabled:opacity-30 hover:bg-gray-50 transition-colors"
          >
            Назад
          </button>
          <span className="font-medium">Страница {page + 1}</span>
          <button 
            disabled={items.length < ITEMS_PER_PAGE}
            onClick={() => setPage(p => p + 1)}
            className="px-6 py-2 bg-white border rounded-lg disabled:opacity-30 hover:bg-gray-50 transition-colors"
          >
            Вперед
          </button>
        </div>
      </div>

      {/* Модальное окно (Широкое) */}
      {editingItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form 
            onSubmit={handleUpdate} 
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-2xl font-bold text-slate-800">Редактирование товара</h3>
                <button type="button" onClick={() => setEditingItem(null)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Левая колонка - превью и ссылки */}
                <div>
                  <div className="mb-4">
                    <label className="block text-sm font-semibold mb-1 text-gray-600">Название (ID)</label>
                    <input disabled className="w-full border p-2 rounded bg-gray-50 text-gray-400" value={editingItem.name} />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-semibold mb-1 text-gray-600">Цена</label>
                    <input 
                      type="number"
                      className="w-full border p-2 rounded focus:ring-2 ring-blue-500 outline-none"
                      value={editingItem.price}
                      onChange={e => setEditingItem({...editingItem, price: e.target.value})}
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-semibold mb-1 text-gray-600">URL изображения</label>
                    <input 
                      className="w-full border p-2 rounded focus:ring-2 ring-blue-500 outline-none"
                      value={editingItem['img_src']}
                      onChange={e => setEditingItem({...editingItem, 'img_src': e.target.value})}
                    />
                  </div>
                  <div className="mt-4 border rounded-lg overflow-hidden h-40 bg-gray-100">
                     <img src={editingItem['img_src']} className="w-full h-full object-contain" alt="Preview" />
                  </div>
                </div>

                {/* Правая колонка - большое описание */}
                <div className="flex flex-col">
                  <label className="block text-sm font-semibold mb-1 text-gray-600">Описание</label>
                  <textarea 
                    className="w-full border p-4 rounded-lg focus:ring-2 ring-blue-500 outline-none flex-grow min-h-[300px] resize-none"
                    value={editingItem.descr}
                    onChange={e => setEditingItem({...editingItem, descr: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors">
                  Сохранить изменения
                </button>
                <button type="button" onClick={() => setEditingItem(null)} className="px-8 py-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors">
                  Отмена
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

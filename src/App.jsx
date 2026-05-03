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


      
      {/* Модальное окно (Экстра-широкое) */}
{editingItem && (
  <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4 z-50">
    <form 
      onSubmit={handleUpdate} 
      className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-y-auto"
    >
      <div className="p-10">
        <div className="flex justify-between items-start mb-8 border-b pb-4">
          <div>
            <h3 className="text-3xl font-black text-slate-800 uppercase tracking-tight">Редактирование</h3>
            <p className="text-slate-400 text-sm mt-1 flex items-center gap-2">
              <span className="bg-slate-100 px-2 py-0.5 rounded border font-mono">{editingItem.name}</span>
            </p>
          </div>
          <button type="button" onClick={() => setEditingItem(null)} className="text-gray-300 hover:text-rose-500 text-2xl transition-colors">✕</button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Левая колонка (Превью и цена) - 4 колонки из 12 */}
          <div className="lg:col-span-4 space-y-6">
            <div className="rounded-2xl overflow-hidden border-4 border-slate-50 shadow-inner bg-gray-50 aspect-square">
               <img src={editingItem.img_src} className="w-full h-full object-contain" alt="Preview" />
            </div>
            
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-slate-500">Цена товара (₽)</label>
              <div className="relative">
                <input 
                  type="number"
                  className="w-full border-2 border-slate-200 p-4 rounded-xl text-2xl font-bold focus:border-blue-500 focus:ring-0 outline-none transition-all"
                  value={editingItem.price}
                  onChange={e => setEditingItem({...editingItem, price: e.target.value})}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">RUB</span>
              </div>
            </div>
          </div>

          {/* Правая колонка (Описание) - 8 колонок из 12 */}
          <div className="lg:col-span-8 flex flex-col">
            <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-slate-500">Полное описание</label>
            <textarea 
              className="w-full border-2 border-slate-100 p-6 rounded-2xl focus:border-blue-500 focus:ring-0 outline-none flex-grow min-h-[500px] text-lg leading-relaxed shadow-sm resize-none"
              placeholder="Введите описание..."
              value={editingItem.descr}
              onChange={e => setEditingItem({...editingItem, descr: e.target.value})}
            />
          </div>
        </div>

        <div className="flex gap-4 mt-10">
          <button type="submit" className="flex-[2] bg-slate-900 hover:bg-blue-600 text-white font-black py-5 rounded-2xl transition-all shadow-lg hover:shadow-blue-200 uppercase tracking-widest">
            Обновить данные
          </button>
          <button type="button" onClick={() => setEditingItem(null)} className="flex-1 bg-gray-100 text-gray-500 font-bold py-5 rounded-2xl hover:bg-gray-200 transition-colors uppercase tracking-widest">
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

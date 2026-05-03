import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// Инициализация клиента
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function App() {
  const [items, setItems] = useState([]);
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    const { data } = await supabase.from('serums').select('*').order('id');
    setItems(data || []);
  }

  async function handleUpdate(e) {
    e.preventDefault();
    const { error } = await supabase
      .from('serums')
      .update({
        descr: editingItem.descr,
        price: editingItem.price,
        'img-src': editingItem['img_src']
      })
      .eq('name', editingItem.name);

    if (!error) {
      setEditingItem(null);
      fetchItems();
    }
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Управление товарами</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {items.map((item) => (
          <div key={item.name} className="bg-white p-4 rounded-lg shadow border">
            <img src={item['img-src']} alt={item.name} className="w-full h-40 object-cover rounded mb-4" />
            <h2 className="font-bold text-lg">{item.name}</h2>
            <p className="text-gray-600 text-sm mb-2">{item.descr}</p>
            <p className="text-blue-600 font-semibold mb-4">{item.price} ₽</p>
            <button 
              onClick={() => setEditingItem(item)}
              className="w-full bg-slate-800 text-white py-2 rounded hover:bg-slate-700"
            >
              Редактировать
            </button>
          </div>
        ))}
      </div>

      {/* Модальное окно редактирования */}
      {editingItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <form onSubmit={handleUpdate} className="bg-white p-6 rounded-xl max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Редактировать {editingItem.name}</h3>
            <label className="block mb-2 text-sm">Описание</label>
            <textarea 
              className="w-full border p-2 mb-4 rounded"
              value={editingItem.descr}
              onChange={e => setEditingItem({...editingItem, descr: e.target.value})}
            />
            <label className="block mb-2 text-sm">Цена</label>
            <input 
              type="number"
              className="w-full border p-2 mb-4 rounded"
              value={editingItem.price}
              onChange={e => setEditingItem({...editingItem, price: e.target.value})}
            />
            <label className="block mb-2 text-sm">URL картинки</label>
            <input 
              className="w-full border p-2 mb-6 rounded"
              value={editingItem['img-src']}
              onChange={e => setEditingItem({...editingItem, 'img-src': e.target.value})}
            />
            <div className="flex gap-2">
              <button type="submit" className="flex-1 bg-green-600 text-white py-2 rounded">Сохранить</button>
              <button onClick={() => setEditingItem(null)} className="flex-1 bg-gray-200 py-2 rounded">Отмена</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

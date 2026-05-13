"use client";
import React, { useState, useEffect, useMemo } from 'react';
import StorePreview from './StorePreview';

export default function TemplateDemo(){
  const [templateId, setTemplateId] = useState('noir');

  // Immediate input state (fast updates while typing)
  const [storeNameInput, setStoreNameInput] = useState('Adaeze');
  const [ownerNameInput, setOwnerNameInput] = useState('Adaeze');
  const [categoryInput, setCategoryInput] = useState('Handmade');
  const [locationInput, setLocationInput] = useState('Lagos');
  const [whatsappNumberInput, setWhatsappNumberInput] = useState('2348012345678');
  const [currencySymbolInput, setCurrencySymbolInput] = useState('₦');
  const [taglineInput, setTaglineInput] = useState('Made with intention');

  // Debounced preview state (updates less frequently to avoid heavy rerenders)
  const [storeName, setStoreName] = useState(storeNameInput);
  const [ownerName, setOwnerName] = useState(ownerNameInput);
  const [category, setCategory] = useState(categoryInput);
  const [location, setLocation] = useState(locationInput);
  const [whatsappNumber, setWhatsAppNumber] = useState(whatsappNumberInput);
  const [currencySymbol, setCurrencySymbol] = useState(currencySymbolInput);
  const [tagline, setTagline] = useState(taglineInput);

  const [showDuplicatePreview, setShowDuplicatePreview] = useState(false);

  // Generic debounce effect: update preview state 300ms after user stops typing
  function useDebounceInput(inputValue, setPreviewValue, delay = 300){
    useEffect(() => {
      const t = setTimeout(() => setPreviewValue(inputValue), delay);
      return () => clearTimeout(t);
    }, [inputValue, setPreviewValue, delay]);
  }

  useDebounceInput(storeNameInput, setStoreName);
  useDebounceInput(ownerNameInput, setOwnerName);
  useDebounceInput(categoryInput, setCategory);
  useDebounceInput(locationInput, setLocation);
  useDebounceInput(whatsappNumberInput, setWhatsAppNumber);
  useDebounceInput(currencySymbolInput, setCurrencySymbol);
  useDebounceInput(taglineInput, setTagline);
  const [products, setProducts] = useState([
    { name: 'Cowrie shell necklace', price:8500, description:'Hand-strung on gold-filled chain', featured:true },
    { name: 'Ankara bead bracelet', price:3200, description:'Handmade · 3 colourways', featured:false },
  ]);

  const [newProd, setNewProd] = useState({name:'',price:'',description:'',featured:false});

  function addProduct(e){
    e.preventDefault();
    const p = { ...newProd, price: Number(newProd.price || 0) };
    setProducts(prev => [...prev, p]);
    setNewProd({name:'',price:'',description:'',featured:false});
  }

  // Memoize the props passed to the preview so references stay stable when values don't change
  const sharedProps = useMemo(() => ({ storeName, ownerName, category, location, whatsappNumber: whatsappNumber || whatsappNumberInput, currencySymbol, tagline, products }), [storeName, ownerName, category, location, whatsappNumber, currencySymbol, tagline, products, whatsappNumberInput]);

  return (
    <div className="flex h-screen">
      <aside className="w-80 p-4 border-r overflow-auto">
        <h3 className="text-lg font-semibold mb-2">Template Demo</h3>
        <label className="block text-sm mt-2">Template</label>
        <select value={templateId} onChange={e=>setTemplateId(e.target.value)} className="w-full p-2 border rounded mt-1">
          <option value="noir">Noir</option>
          <option value="cream">Cream</option>
          <option value="minimal">Minimal</option>
          <option value="bold">Bold</option>
          <option value="luxury">Luxury</option>
        </select>

        <label className="block text-sm mt-3">Store name</label>
        <input value={storeNameInput} onChange={e=>setStoreNameInput(e.target.value)} className="w-full p-2 border rounded mt-1" />

        <label className="block text-sm mt-3">Owner name</label>
        <input value={ownerNameInput} onChange={e=>setOwnerNameInput(e.target.value)} className="w-full p-2 border rounded mt-1" />

        <label className="block text-sm mt-3">Category</label>
        <input value={categoryInput} onChange={e=>setCategoryInput(e.target.value)} className="w-full p-2 border rounded mt-1" />

        <label className="block text-sm mt-3">Location</label>
        <input value={locationInput} onChange={e=>setLocationInput(e.target.value)} className="w-full p-2 border rounded mt-1" />

        <label className="block text-sm mt-3">WhatsApp number</label>
        <input value={whatsappNumberInput} onChange={e=>setWhatsappNumberInput(e.target.value)} className="w-full p-2 border rounded mt-1" />

        <label className="block text-sm mt-3">Currency</label>
        <input value={currencySymbolInput} onChange={e=>setCurrencySymbolInput(e.target.value)} className="w-full p-2 border rounded mt-1" />

        <label className="block text-sm mt-3">Tagline</label>
        <input value={taglineInput} onChange={e=>setTaglineInput(e.target.value)} className="w-full p-2 border rounded mt-1" />

        <label className="flex items-center gap-2 mt-3"><input type="checkbox" checked={showDuplicatePreview} onChange={e=>setShowDuplicatePreview(e.target.checked)} /> Show second preview</label>

        <div className="mt-4">
          <h4 className="font-semibold">Products</h4>
          {products.map((p,i)=> (
            <div key={i} className="text-sm p-2 border rounded mt-2">
              <div className="font-medium">{p.name} {p.featured? <span className="text-xs text-green-600">(featured)</span>:null}</div>
              <div className="text-gray-600">{p.description}</div>
              <div className="text-gray-800">{currencySymbolInput}{p.price}</div>
            </div>
          ))}
        </div>

        <form onSubmit={addProduct} className="mt-4">
          <h5 className="font-semibold">Add product</h5>
          <input placeholder="Name" value={newProd.name} onChange={e=>setNewProd({...newProd,name:e.target.value})} className="w-full p-2 border rounded mt-2" />
          <input placeholder="Price" value={newProd.price} onChange={e=>setNewProd({...newProd,price:e.target.value})} className="w-full p-2 border rounded mt-2" />
          <input placeholder="Description" value={newProd.description} onChange={e=>setNewProd({...newProd,description:e.target.value})} className="w-full p-2 border rounded mt-2" />
          <label className="flex items-center gap-2 mt-2"><input type="checkbox" checked={newProd.featured} onChange={e=>setNewProd({...newProd,featured:e.target.checked})}/> Featured</label>
          <button className="mt-2 w-full bg-blue-600 text-white p-2 rounded" type="submit">Add</button>
        </form>
      </aside>

      <main className="flex-1 p-4 overflow-auto">
        <div className="flex gap-4">
          <div className="w-[390px] shadow-lg">
            <StorePreview templateId={templateId} {...sharedProps} />
          </div>
          {showDuplicatePreview && (
            <div className="w-[390px] shadow-lg">
              <StorePreview templateId={templateId} {...sharedProps} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

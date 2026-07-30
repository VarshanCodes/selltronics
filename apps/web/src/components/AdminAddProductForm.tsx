"use client";

import { useState, useRef, useEffect } from "react";

interface Product {
  id: string;
  category: string;
  brand: string;
  deviceName: string;
  storage: string;
  specs: string;
  price: number;
  deviceImageCode?: string | null;
  deviceImages?: string[];
  status: string;
}

export default function AdminAddProductForm() {
  const [category, setCategory] = useState("Smartphone");
  const [deviceName, setDeviceName] = useState("");
  const [brand, setBrand] = useState("");
  const [storage, setStorage] = useState("");
  const [specs, setSpecs] = useState("");
  const [price, setPrice] = useState("");
  const [images, setImages] = useState<string[]>([]);
  
  const [products, setProducts] = useState<Product[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch all products
  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/admin/products', { cache: 'no-store' });
      if (!response.ok) throw new Error('Could not load products');
      const { products: list } = await response.json();
      setProducts(list as Product[]);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Convert uploaded images to Base64
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const remainingCount = 6 - images.length;
      const filesToProcess = Array.from(files).slice(0, remainingCount);
      
      filesToProcess.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImages(prev => {
            if (prev.length >= 6) return prev;
            return [...prev, reader.result as string];
          });
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleEditInit = (p: Product) => {
    setEditingId(p.id);
    setCategory(p.category);
    setDeviceName(p.deviceName);
    setBrand(p.brand);
    setStorage(p.storage);
    setSpecs(p.specs);
    setPrice(String(p.price));
    setImages(p.deviceImages || (p.deviceImageCode ? [p.deviceImageCode] : []));
    setSuccessMessage("");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      const response = await fetch(`/api/admin/products?id=${encodeURIComponent(productId)}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Could not delete product');
      setProducts(prev => prev.filter(p => p.id !== productId));
      setSuccessMessage("Product deleted successfully.");
    } catch (err) {
      console.error("Error deleting product:", err);
      alert("Failed to delete product.");
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setDeviceName("");
    setBrand("");
    setStorage("");
    setSpecs("");
    setPrice("");
    setImages([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deviceName || !price || images.length === 0) {
      return alert("Device name, price, and at least 1 image are required!");
    }

    setIsSubmitting(true);
    setSuccessMessage("");

    const productPayload = {
      category,
      brand,
      deviceName,
      storage,
      specs,
      price: Number(price),
      deviceImageCode: images[0] || null, // First image for backwards compatibility
      deviceImages: images, // Store all images
      status: "Available",
    };

    try {
      if (editingId) {
        const response = await fetch('/api/admin/products', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: editingId, ...productPayload }) });
        if (!response.ok) throw new Error('Could not update product');
        setSuccessMessage(`${deviceName} has been updated successfully!`);
        setEditingId(null);
      } else {
        const response = await fetch('/api/admin/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(productPayload) });
        if (!response.ok) throw new Error('Could not publish product');
        setSuccessMessage(`${deviceName} has been published successfully!`);
      }
      
      // Reset form
      setDeviceName("");
      setBrand("");
      setStorage("");
      setSpecs("");
      setPrice("");
      setImages([]);
      fetchProducts();
    } catch (error) {
      console.error("Error saving product: ", error);
      alert("Failed to save product.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-10 max-w-4xl mx-auto font-space">
      <div className="bg-white p-6 sm:p-10 rounded-3xl shadow-sm border-[1.5px] border-[#EFE9FB]">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-[#1E1B29]">
            {editingId ? "Edit Published Device" : "Publish New Device to Shop"}
          </h2>
          <p className="text-[#6E6683] text-sm mt-1">
            {editingId ? "Modify details of the selected device." : "Add a new listing for buyers to purchase."}
          </p>
        </div>

        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl font-semibold">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          
          {/* Top Row: Category & Brand */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[0.85rem] font-bold text-[#1E1B29] mb-2">Category</label>
              <select 
                value={category} 
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-[1.5px] border-[#E3D9F9] focus:border-[#7C3AED] outline-none text-[#1E1B29] bg-[#FAF7FF]"
              >
                <option value="Smartphone">Smartphone</option>
                <option value="Tablet">Tablet</option>
                <option value="Laptop">Laptop</option>
                <option value="Mac">Mac</option>
                <option value="Smartwatch">Smartwatch</option>
              </select>
            </div>
            <div>
              <label className="block text-[0.85rem] font-bold text-[#1E1B29] mb-2">Brand</label>
              <input 
                type="text" 
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g. Apple, Samsung, Dell" 
                className="w-full px-4 py-3 rounded-xl border-[1.5px] border-[#E3D9F9] focus:border-[#7C3AED] outline-none text-[#1E1B29]"
              />
            </div>
          </div>

          {/* Middle Row: Device Name & Storage */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[0.85rem] font-bold text-[#1E1B29] mb-2">Device Name / Model</label>
              <input 
                type="text" 
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
                placeholder="e.g. iPhone 14 Pro" 
                className="w-full px-4 py-3 rounded-xl border-[1.5px] border-[#E3D9F9] focus:border-[#7C3AED] outline-none text-[#1E1B29]"
              />
            </div>
            <div>
              <label className="block text-[0.85rem] font-bold text-[#1E1B29] mb-2">Storage</label>
              <input 
                type="text" 
                value={storage}
                onChange={(e) => setStorage(e.target.value)}
                placeholder="e.g. 256GB" 
                className="w-full px-4 py-3 rounded-xl border-[1.5px] border-[#E3D9F9] focus:border-[#7C3AED] outline-none text-[#1E1B29]"
              />
            </div>
          </div>

          {/* Specs / Description Area */}
          <div>
            <label className="block text-[0.85rem] font-bold text-[#1E1B29] mb-2">Key Specs & Condition</label>
            <textarea 
              value={specs}
              onChange={(e) => setSpecs(e.target.value)}
              placeholder="e.g. A16 Bionic chip, 99% Battery Health, Flawless display..." 
              rows={3}
              className="w-full px-4 py-3 rounded-xl border-[1.5px] border-[#E3D9F9] focus:border-[#7C3AED] outline-none text-[#1E1B29] resize-none"
            />
          </div>

          {/* Price & Image Upload */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
            <div>
              <label className="block text-[0.85rem] font-bold text-[#1E1B29] mb-2">Quoted Offer Price (₹ or $)</label>
              <input 
                type="number" 
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. 45000" 
                className="w-full px-4 py-3 rounded-xl border-[1.5px] border-[#E3D9F9] focus:border-[#7C3AED] outline-none text-[#1E1B29] text-xl font-bold"
              />
            </div>

            <div>
              <label className="block text-[0.85rem] font-bold text-[#1E1B29] mb-2">Device Images (Upload 1 to 6 images)</label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-24 border-2 border-dashed border-[#E3D9F9] rounded-xl flex items-center justify-center cursor-pointer hover:border-[#7C3AED] hover:bg-[#FAF7FF] transition-colors relative"
              >
                <span className="text-[#6E6683] text-sm font-semibold">
                  {images.length >= 6 ? "Maximum 6 images reached" : "+ Upload Images"}
                </span>
                <input 
                  type="file" 
                  accept="image/*" 
                  ref={fileInputRef} 
                  onChange={handleImageUpload} 
                  multiple 
                  disabled={images.length >= 6} 
                  className="hidden" 
                />
              </div>
            </div>
          </div>

          {/* Images Previews */}
          {images.length > 0 && (
            <div>
              <label className="block text-[0.85rem] font-bold text-[#1E1B29] mb-2">Image Previews ({images.length}/6)</label>
              <div className="flex flex-wrap gap-4">
                {images.map((img, idx) => (
                  <div key={idx} className="relative w-20 h-20 border border-[#E3D9F9] rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center">
                    <img src={img} alt="Upload preview" className="max-w-full max-h-full object-contain" />
                    <button 
                      type="button" 
                      onClick={() => removeImage(idx)}
                      className="absolute -top-1 -right-1 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center font-bold text-xs shadow-md hover:bg-red-700 cursor-pointer"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-4">
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="flex-1 bg-[#1E1B29] text-white py-4 rounded-xl font-bold mt-4 hover:bg-[#3D1E7A] transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Saving Product..." : editingId ? "Update Product" : "Publish Product"}
            </button>
            {editingId && (
              <button 
                type="button"
                onClick={handleCancelEdit}
                className="bg-gray-100 text-gray-700 px-6 py-4 rounded-xl font-bold mt-4 hover:bg-gray-200 transition-colors"
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Existing Products Section */}
      <div className="bg-white p-6 sm:p-10 rounded-3xl shadow-sm border-[1.5px] border-[#EFE9FB]">
        <h3 className="text-xl font-bold text-[#1E1B29] mb-6">Manage Published Devices</h3>
        {products.length === 0 ? (
          <p className="text-gray-500 text-center py-6">No products published yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {products.map(p => (
              <div key={p.id} className="p-4 border border-[#EFE9FB] rounded-2xl flex items-center justify-between gap-4 bg-[#FAF7FF]">
                <div className="flex items-center gap-4">
                  {p.deviceImageCode ? (
                    <img src={p.deviceImageCode} alt="" className="w-12 h-12 object-contain bg-white rounded-lg border border-[#E3D9F9]" />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center text-xs text-gray-400">No Image</div>
                  )}
                  <div>
                    <h4 className="font-bold text-[#1E1B29] text-sm">{p.brand} {p.deviceName}</h4>
                    <p className="text-xs text-gray-500">{p.category} · {p.storage || "No Storage"}</p>
                    <p className="text-sm font-black text-[#7C3AED] mt-1">₹{p.price.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleEditInit(p)}
                    className="px-3 py-1.5 bg-indigo-50 text-[#7C3AED] rounded-lg text-xs font-bold hover:bg-indigo-100 transition-colors"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(p.id)}
                    className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

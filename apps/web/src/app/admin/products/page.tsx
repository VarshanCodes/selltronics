'use client';

import { useEffect, useState } from 'react';
import AdminNav from '@/app/components/AdminNav';
import { db } from '@/firebase';
import { addDoc, collection, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { imageFileToDataUrl } from '@/utils/imageData';
import AdminGate from '@/components/AdminGate';

type Product = { id: string; name?: string; type?: string; brand?: string; storage?: string; price?: string | number; condition?: string; specs?: string; image?: string; deviceImageCode?: string; };
type ProductForm = { name: string; type: string; brand: string; storage: string; price: string; condition: string; specs: string; image: string; };

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductForm>({
    name: '',
    type: '',
    brand: '', storage: '',
    price: '',
    condition: '',
    specs: '',
    image: '',
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'products'));
        const productsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        } as Product));
        setProducts(productsData);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      type: product.type || '',
      brand: product.brand || '', storage: product.storage || '',
      price: String(product.price || ''),
      condition: product.condition || '',
      specs: product.specs || '',
      image: product.image || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (productId: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteDoc(doc(db, 'products', productId));
        setProducts(products.filter(p => p.id !== productId));
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  const handleSave = async () => {
    if (editingProduct) {
      try {
        const productData = { ...formData, price: Number(formData.price), deviceName: formData.name, category: formData.type, deviceImageCode: formData.image, status: 'Available' };
        await updateDoc(doc(db, 'products', editingProduct.id), productData);
        setProducts(products.map(p => p.id === editingProduct.id ? { ...p, ...formData } : p));
      } catch (error) {
        console.error('Error updating product:', error);
      }
    } else {
      try {
        const productData = { ...formData, price: Number(formData.price), deviceName: formData.name, category: formData.type, deviceImageCode: formData.image, status: 'Available' };
        const created = await addDoc(collection(db, 'products'), productData);
        setProducts((current) => [...current, { id: created.id, ...formData, price: Number(formData.price) }]);
      } catch (error) { console.error('Error adding product:', error); }
    }
    setShowModal(false);
    setEditingProduct(null);
  };

  return (
    <AdminGate>
      <div style={{ background: '#FAF7FF', minHeight: '100vh' }}>
        <AdminNav />
        <div className="admin-container">
          <div className="admin-header">
            <div>
              <h1>Product Management</h1>
              <p style={{ color: 'var(--gray)', marginTop: '4px' }}>Manage your inventory</p>
          </div>
          <button className="btn-primary" onClick={() => {
            setEditingProduct(null);
            setFormData({ name: '', type: '', brand: '', storage: '', price: '', condition: '', specs: '', image: '' });
            setShowModal(true);
          }}>
            + Add Product
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--gray)' }}>
            Loading products...
          </div>
        ) : products.length === 0 ? (
          <div style={{
            border: '2px dashed #E3D9F9',
            borderRadius: '16px',
            padding: '60px 20px',
            textAlign: 'center',
            background: 'var(--lavender-50)',
          }}>
            <p style={{ color: 'var(--gray)', marginBottom: '20px' }}>No products yet</p>
            <button className="btn-primary" onClick={() => {
              setEditingProduct(null);
              setFormData({ name: '', type: '', brand: '', storage: '', price: '', condition: '', specs: '', image: '' });
              setShowModal(true);
            }}>
              Add Your First Product
            </button>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: '20px',
          }}>
            {products.map(product => (
              <div key={product.id} className="card" style={{ padding: '20px' }}>
                {(product.image || product.deviceImageCode) && (
                  <img
                    src={product.image || product.deviceImageCode}
                    alt={product.name}
                    style={{
                      width: '100%',
                      height: '150px',
                      objectFit: 'cover',
                      borderRadius: '12px',
                      marginBottom: '12px',
                    }}
                  />
                )}
                <h3 style={{ fontSize: '1.05rem', marginBottom: '4px' }}>{product.name}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--gray)' }}>{product.type}</p>
                <p style={{
                  fontSize: '1.3rem',
                  fontWeight: '700',
                  color: 'var(--violet-700)',
                  margin: '12px 0',
                }}>
                  ₹{product.price}
                </p>
                <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
                  <button
                    onClick={() => handleEdit(product)}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      background: 'var(--lavender-100)',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '0.85rem',
                      color: 'var(--violet-700)',
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      background: '#FEE2E2',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '0.85rem',
                      color: '#991B1B',
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit/Add Product Modal */}
      {showModal && (
        <div className="overlay open">
          <div className="modal">
            <button
              className="modal-close"
              onClick={() => setShowModal(false)}
              style={{ color: 'var(--ink)' }}
            >
              ✕
            </button>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '6px' }}>
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h3>
            <p style={{ fontSize: '0.86rem', color: 'var(--gray)', marginBottom: '22px' }}>
              Fill in the product details below.
            </p>

            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
              <div className="field">
                <label>Product Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="field">
                <label>Type</label>
                <input
                  type="text"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  placeholder="e.g. Phone, Laptop"
                />
              </div>
              <div className="field">
                <label>Brand</label>
                <input type="text" value={formData.brand} onChange={(e) => setFormData({ ...formData, brand: e.target.value })} placeholder="e.g. Apple" />
              </div>
              <div className="field">
                <label>Storage</label>
                <input type="text" value={formData.storage} onChange={(e) => setFormData({ ...formData, storage: e.target.value })} placeholder="e.g. 128 GB" />
              </div>
              <div className="field">
                <label>Price (₹)</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
              </div>
              <div className="field">
                <label>Condition</label>
                <select
                  value={formData.condition}
                  onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                >
                  <option value="">Select condition</option>
                  <option value="like-new">Like New</option>
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                </select>
              </div>
              <div className="field">
                <label>Specifications</label>
                <textarea
                  value={formData.specs}
                  onChange={(e) => setFormData({ ...formData, specs: e.target.value })}
                  style={{ minHeight: '80px', fontFamily: 'Inter, sans-serif' }}
                  placeholder="Enter product specifications..."
                />
              </div>
              <div className="field">
                <label>Device image</label>
                <input type="file" accept="image/*" onChange={async (e) => { const file = e.target.files?.[0]; if (!file) return; try { setFormData({ ...formData, image: await imageFileToDataUrl(file) }); } catch (error) { alert(error instanceof Error ? error.message : 'Unable to read image.'); } }} />
                {formData.image && <img src={formData.image} alt="Product preview" style={{ width: 96, height: 96, objectFit: 'cover', borderRadius: 8, marginTop: 8 }} />}
              </div>

              <button
                type="submit"
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', marginTop: '12px' }}
              >
                {editingProduct ? 'Update Product' : 'Add Product'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
    </AdminGate>
  );
}

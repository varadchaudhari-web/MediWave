import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { medicines, medicineCategories } from '@/data/medicines';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { LoginRequiredModal } from '@/components/features/Modal';
import {
  Search, ShoppingCart, Star, AlertCircle, X, Plus, Minus, CheckCircle,
  Truck, Shield, Clock, FileText, Upload
} from 'lucide-react';
import { Medicine } from '@/types';
import { toast } from 'sonner';
import Modal from '@/components/features/Modal';
import MedicineProductImage from '@/components/features/MedicineProductImage';
import { sanitizeSearch } from '@/lib/validation';

export default function Medicines() {
  const { items, addItem, removeItem, updateQty, totalPrice, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [selectedMed, setSelectedMed] = useState<Medicine | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [loginModal, setLoginModal] = useState(false);
  const [rxBlockModal, setRxBlockModal] = useState<Medicine | null>(null);

  const filtered = medicines.filter(m => {
    const matchSearch = !search || m.name.toLowerCase().includes(search.toLowerCase()) || m.genericName.toLowerCase().includes(search.toLowerCase()) || m.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
    const matchCat = category === 'All' || m.category === category;
    return matchSearch && matchCat;
  });

  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0);

  const handleAddToCart = (med: Medicine) => {
    if (med.requiresPrescription) {
      setRxBlockModal(med);
      return;
    }
    if (!isAuthenticated) {
      setLoginModal(true);
      return;
    }
    addItem({
      id: med.id,
      name: med.name,
      price: med.price,
      quantity: 1,
      image: med.image,
      type: 'medicine',
    });
  };

  const handlePlaceOrder = () => {
    setTimeout(() => {
      setOrderPlaced(true);
      clearCart();
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-r from-sky-700 to-sky-600 pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white font-sora">Medicine Store</h1>
              <p className="text-sky-200 text-sm mt-1">Genuine medicines delivered in 24 hours</p>
            </div>
            <button
              onClick={() => setCartOpen(true)}
              className="relative flex items-center gap-2 px-4 py-2.5 bg-white text-sky-700 rounded-xl font-semibold text-sm hover:bg-sky-50 shadow"
            >
              <ShoppingCart size={16} />
              Cart
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

          <div className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3 shadow-sm max-w-2xl">
            <Search size={16} className="text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(sanitizeSearch(e.target.value))}
              placeholder="Search medicine by name, generic name or condition..."
              className="flex-1 text-sm focus:outline-none"
            />
            {search && <button onClick={() => setSearch('')}><X size={14} className="text-slate-400" /></button>}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Trust badges */}
        <div className="grid grid-cols-4 gap-3 mb-8">
          {[
            { icon: <Shield size={18} className="text-sky-600" />, title: '100% Genuine', desc: 'Verified products' },
            { icon: <Truck size={18} className="text-emerald-600" />, title: '24hr Delivery', desc: 'Express available' },
            { icon: <Clock size={18} className="text-amber-600" />, title: '24/7 Support', desc: 'Always available' },
            { icon: <CheckCircle size={18} className="text-purple-600" />, title: 'Easy Returns', desc: '7-day return policy' },
          ].map(b => (
            <div key={b.title} className="medical-card p-3 flex items-center gap-2">
              {b.icon}
              <div>
                <p className="font-semibold text-slate-800 text-xs">{b.title}</p>
                <p className="text-slate-400 text-xs">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Category pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
          {medicineCategories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`shrink-0 px-4 py-2 rounded-full text-xs font-medium transition-all border ${
                category === cat ? 'bg-sky-600 text-white border-sky-600' : 'bg-white border-slate-200 text-slate-600 hover:border-sky-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Medicine grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filtered.map(med => {
            const inCart = items.find(i => i.id === med.id);
            return (
              <div key={med.id} className="medical-card p-4 cursor-pointer group" onClick={() => setSelectedMed(med)}>
                <div className="relative mb-3">
                  <MedicineProductImage medicine={med} className="h-32 w-full" />
                  <span className="absolute top-2 right-2 bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full font-medium">{med.discount}% off</span>
                  {med.requiresPrescription && (
                    <span className="absolute top-2 left-2 bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full font-medium">Rx</span>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 text-sm leading-tight group-hover:text-sky-600 transition-colors">{med.name}</h3>
                  <p className="text-slate-400 text-xs mt-0.5">{med.genericName}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Star size={11} className="text-amber-400 fill-amber-400" />
                    <span className="text-xs text-slate-600 font-medium">{med.rating}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="font-bold text-sky-600">₹{med.price}</span>
                    <span className="text-slate-400 text-xs line-through">₹{med.mrp}</span>
                  </div>
                </div>
                <div className="mt-3">
                  {med.requiresPrescription ? (
                    <button
                      onClick={e => { e.stopPropagation(); setRxBlockModal(med); }}
                      className="w-full py-2 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl text-xs font-semibold hover:bg-amber-100 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <FileText size={12} />
                      Upload Rx
                    </button>
                  ) : inCart ? (
                    <div className="flex items-center justify-between border border-sky-200 rounded-xl overflow-hidden">
                      <button onClick={e => { e.stopPropagation(); updateQty(med.id, inCart.quantity - 1); }} className="px-3 py-2 text-sky-600 hover:bg-sky-50 transition-colors"><Minus size={14} /></button>
                      <span className="text-sm font-semibold text-slate-800">{inCart.quantity}</span>
                      <button onClick={e => { e.stopPropagation(); updateQty(med.id, inCart.quantity + 1); }} className="px-3 py-2 text-sky-600 hover:bg-sky-50 transition-colors"><Plus size={14} /></button>
                    </div>
                  ) : (
                    <button
                      onClick={e => { e.stopPropagation(); handleAddToCart(med); }}
                      className="w-full py-2 bg-sky-600 text-white rounded-xl text-xs font-semibold hover:bg-sky-700 transition-colors"
                    >
                      Add to Cart
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Medicine Detail Modal */}
      {selectedMed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop" onClick={() => setSelectedMed(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800">{selectedMed.name}</h3>
              <button onClick={() => setSelectedMed(null)} className="p-2 rounded-xl hover:bg-slate-100"><X size={18} className="text-slate-400" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex gap-4">
                <MedicineProductImage medicine={selectedMed} className="h-24 w-24 rounded-2xl" compact />
                <div>
                  <p className="text-sky-600 text-sm font-medium">{selectedMed.genericName}</p>
                  <p className="text-slate-500 text-xs">{selectedMed.manufacturer}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="font-bold text-sky-600 text-xl">₹{selectedMed.price}</span>
                    <span className="text-slate-400 text-sm line-through">₹{selectedMed.mrp}</span>
                    <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full font-medium">{selectedMed.discount}% off</span>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <Star size={12} className="text-amber-400 fill-amber-400" />
                    <span className="text-xs font-medium">{selectedMed.rating}</span>
                  </div>
                </div>
              </div>

              {selectedMed.requiresPrescription && (
                <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700">
                  <AlertCircle size={14} className="shrink-0" />
                  This medicine requires a valid prescription from a registered doctor. Upload your prescription to proceed.
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Description</p>
                  <p className="text-sm text-slate-600">{selectedMed.description}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Dosage & How to Use</p>
                  <p className="text-sm text-slate-600">{selectedMed.dosage}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Category</p>
                  <span className="bg-sky-100 text-sky-700 text-xs font-medium px-2.5 py-0.5 rounded-full">{selectedMed.category}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setSelectedMed(null)} className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-medium">Close</button>
                {selectedMed.requiresPrescription ? (
                  <button onClick={() => { setSelectedMed(null); setRxBlockModal(selectedMed); }} className="flex-1 py-2.5 bg-amber-500 text-white rounded-xl text-sm font-semibold hover:bg-amber-600">
                    Upload Prescription
                  </button>
                ) : (
                  <button onClick={() => { handleAddToCart(selectedMed); setSelectedMed(null); setCartOpen(true); }} className="flex-1 py-2.5 bg-sky-600 text-white rounded-xl text-sm font-semibold hover:bg-sky-700">
                    Add to Cart
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Prescription Required Modal */}
      <Modal isOpen={!!rxBlockModal} onClose={() => setRxBlockModal(null)} size="sm" title="Prescription Required">
        <div className="p-6">
          <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText size={28} className="text-amber-600" />
          </div>
          {rxBlockModal && (
            <div className="text-center mb-5">
              <h3 className="font-bold text-slate-800 text-base mb-1">{rxBlockModal.name}</h3>
              <p className="text-amber-600 text-sm font-medium">This is a prescription-only medicine (Rx)</p>
            </div>
          )}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5">
            <p className="text-sm text-amber-800 font-medium mb-1">Why is a prescription required?</p>
            <p className="text-xs text-amber-700 leading-relaxed">
              This medicine requires a valid doctor's prescription before purchase. This is for your safety — these medicines can have serious side effects if taken without medical supervision.
            </p>
          </div>
          <div className="space-y-2 mb-5">
            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">You can:</p>
            <div className="flex items-start gap-2 text-sm text-slate-600">
              <CheckCircle size={14} className="text-emerald-500 mt-0.5 shrink-0" />
              Consult a doctor on MediWave and get an online prescription
            </div>
            <div className="flex items-start gap-2 text-sm text-slate-600">
              <Upload size={14} className="text-sky-500 mt-0.5 shrink-0" />
              Upload an existing prescription from your doctor
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setRxBlockModal(null)} className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-medium">Cancel</button>
            <button onClick={() => { setRxBlockModal(null); navigate('/doctors'); }} className="flex-1 py-2.5 bg-sky-600 text-white rounded-xl text-sm font-semibold hover:bg-sky-700">
              Consult Doctor
            </button>
          </div>
        </div>
      </Modal>

      {/* Cart Drawer */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex" onClick={() => setCartOpen(false)}>
          <div className="flex-1" />
          <div className="w-full max-w-md bg-white shadow-2xl flex flex-col h-full" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800">Shopping Cart ({cartCount})</h3>
              <button onClick={() => setCartOpen(false)} className="p-2 rounded-xl hover:bg-slate-100"><X size={18} className="text-slate-400" /></button>
            </div>
            {orderPlaced ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle size={40} className="text-emerald-500" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Order Placed!</h3>
                <p className="text-slate-500 mb-1">Your medicines will be delivered within 24 hours.</p>
                <p className="text-xs text-slate-400">Order ID: MW{Date.now().toString().slice(-8)}</p>
                <button onClick={() => { setOrderPlaced(false); setCartOpen(false); }} className="mt-6 px-6 py-3 bg-sky-600 text-white rounded-xl font-semibold hover:bg-sky-700">
                  Continue Shopping
                </button>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto p-5 space-y-3">
                  {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center py-16">
                      <ShoppingCart size={48} className="text-slate-200 mb-4" />
                      <p className="text-slate-500 font-medium">Your cart is empty</p>
                      <button onClick={() => setCartOpen(false)} className="mt-3 text-sky-600 text-sm font-medium hover:underline">Browse medicines</button>
                    </div>
                  ) : (
                    items.map(item => (
                      <div key={item.id} className="flex items-center gap-3 bg-slate-50 rounded-xl p-3">
                        {(() => {
                          const medicine = medicines.find(m => m.id === item.id);
                          return medicine ? (
                            <MedicineProductImage medicine={medicine} className="h-12 w-12" compact />
                          ) : (
                            <img src={item.image} alt={item.name} className="w-12 h-12 rounded-xl object-cover" />
                          );
                        })()}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-800 text-sm truncate">{item.name}</p>
                          <p className="text-sky-600 text-xs font-semibold">₹{item.price}</p>
                        </div>
                        <div className="flex items-center gap-1 border border-slate-200 rounded-xl">
                          <button onClick={() => updateQty(item.id, item.quantity - 1)} className="px-2 py-1 text-slate-600 hover:text-sky-600"><Minus size={12} /></button>
                          <span className="text-xs font-semibold w-5 text-center">{item.quantity}</span>
                          <button onClick={() => updateQty(item.id, item.quantity + 1)} className="px-2 py-1 text-slate-600 hover:text-sky-600"><Plus size={12} /></button>
                        </div>
                        <button onClick={() => removeItem(item.id)} className="text-slate-400 hover:text-red-500 p-1"><X size={14} /></button>
                      </div>
                    ))
                  )}
                </div>
                {items.length > 0 && (
                  <div className="p-5 border-t border-slate-100">
                    <div className="flex justify-between mb-4">
                      <span className="font-semibold text-slate-800">Total</span>
                      <span className="font-bold text-sky-600 text-lg">₹{totalPrice}</span>
                    </div>
                    <p className="text-xs text-slate-400 text-center mb-3">Free delivery on orders above ₹299</p>
                    <button onClick={handlePlaceOrder} className="w-full py-3.5 bg-sky-600 text-white rounded-xl font-bold hover:bg-sky-700 transition-colors shadow-sm">
                      Place Order
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      <LoginRequiredModal
        isOpen={loginModal}
        onClose={() => setLoginModal(false)}
        featureName="Order Medicines"
        description="Please login to add medicines to cart and place orders."
        onLogin={() => { setLoginModal(false); navigate('/login'); }}
      />
    </div>
  );
}

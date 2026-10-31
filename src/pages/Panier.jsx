// src/pages/Panier.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Panier = () => {
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      const cart = JSON.parse(savedCart);
      setCartItems(cart);
      calculateTotal(cart);
    }
  }, []);

  const calculateTotal = (cart) => {
    const sum = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    setTotal(sum);
  };

  const updateQuantity = (id, change) => {
    const updatedCart = cartItems.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + change);
        return { ...item, quantity: newQty };
      }
      return item;
    });
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    calculateTotal(updatedCart);
  };

  const removeItem = (id) => {
    const updatedCart = cartItems.filter(item => item.id !== id);
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    calculateTotal(updatedCart);
  };

  const whatsappNumber = "21699477391";
  const sendWhatsAppOrder = () => {
    const message = cartItems.map(item => 
      `• ${item.name} x ${item.quantity} = ${item.price * item.quantity}€`
    ).join('\n');
    
    const fullMessage = `
🛍️ NOUVELLE COMMANDE - BOUTIQUE ULYSSE DEZIGN
━━━━━━━━━━━━━━━━━━━━━

📦 PRODUITS COMMANDÉS:
${message}

💰 TOTAL: ${total}€
━━━━━━━━━━━━━━━━━━━━━
    `.trim();
    
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(fullMessage)}`, '_blank');
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="text-center">
          <span className="text-6xl block mb-4">🛒</span>
          <h2 className="text-2xl font-['Playfair_Display'] text-[#1A3A6B] mb-2">Votre panier est vide</h2>
          <p className="text-[#43474f] mb-6 font-['Montserrat']">Découvrez notre collection de produits premium</p>
          <Link to="/boutique" className="bg-[#1A3A6B] text-white px-6 py-3 rounded-lg font-['Montserrat'] hover:bg-[#0D1F3C] transition">
            Explorer la boutique
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-20 px-6 md:px-12">
      <div className="max-w-[1280px] mx-auto">
        <h1 className="font-['Playfair_Display'] text-3xl text-[#1A3A6B] mb-8 font-semibold">Votre Panier</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map(item => (
              <div key={item.id} className="bg-white border border-[#c4c6d0] p-4 flex items-center gap-4">
                <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded" />
                <div className="flex-1">
                  <h3 className="font-['Playfair_Display'] text-[#1A3A6B] font-semibold">{item.name}</h3>
                  <p className="text-sm text-[#43474f]">{item.price}€</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => updateQuantity(item.id, -1)} className="w-8 h-8 border border-[#c4c6d0] hover:bg-[#f1f3ff] rounded">-</button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, 1)} className="w-8 h-8 border border-[#c4c6d0] hover:bg-[#f1f3ff] rounded">+</button>
                </div>
                <div className="text-right min-w-[80px]">
                  <p className="font-semibold text-[#1A3A6B]">{item.price * item.quantity}€</p>
                  <button onClick={() => removeItem(item.id)} className="text-red-500 text-sm hover:text-red-700">Supprimer</button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="bg-white border border-[#c4c6d0] p-6 h-fit sticky top-24">
            <h3 className="font-['Playfair_Display'] text-xl text-[#1A3A6B] mb-4 font-semibold">Récapitulatif</h3>
            <div className="space-y-2 border-b border-[#c4c6d0] pb-4">
              <div className="flex justify-between">
                <span>Sous-total</span>
                <span>{total}€</span>
              </div>
              <div className="flex justify-between">
                <span>Livraison</span>
                <span>Gratuite</span>
              </div>
              <div className="flex justify-between">
                <span>TVA (20%)</span>
                <span>{(total * 0.2).toFixed(2)}€</span>
              </div>
            </div>
            <div className="flex justify-between py-4 text-lg font-bold">
              <span>Total TTC</span>
              <span>{(total * 1.2).toFixed(2)}€</span>
            </div>
            <button onClick={sendWhatsAppOrder} className="w-full bg-[#25D366] text-white py-3 rounded-lg font-semibold hover:opacity-90 transition">
              💬 Commander sur WhatsApp
            </button>
            <Link to="/boutique" className="block text-center mt-4 text-[#1A3A6B] hover:text-[#F0C75E] transition font-['Montserrat'] text-sm">
              ← Continuer mes achats
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Panier;
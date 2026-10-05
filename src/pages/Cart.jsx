import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useCart } from '../context/CartContext'

export default function Cart() {
  const { items, removeFromCart, updateQty, totalPrice, clearCart } = useCart()
  const navigate = useNavigate()

  if (items.length === 0) {
    return (
      <div className="page">
        <Navbar />
        <main className="cart">
          <h1>🛒 עגלת הקניות</h1>
          <div className="cart__empty">
            <div className="cart__empty-icon">🛒</div>
            <p>העגלה שלך ריקה</p>
            <button className="btn btn--primary" onClick={() => navigate('/')}>
              המשך לקנות
            </button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="page">
      <Navbar />
      <main className="cart">
        <div className="cart__header">
          <h1>🛒 עגלת הקניות ({items.length} פריטים)</h1>
          <button className="btn btn--outline btn--sm" onClick={clearCart}>נקה עגלה</button>
        </div>

        <div className="cart__layout">
          <div className="cart__items">
            {items.map(item => (
              <div key={item.id} className="cart-item">
                <img src={item.image} alt={item.title} className="cart-item__img" />
                <div className="cart-item__info">
                  <h3>{item.title}</h3>
                  <p>{item.author}</p>
                  <span className="cart-item__price">₪{item.price} ליחידה</span>
                </div>
                <div className="cart-item__controls">
                  <button
                    className="qty-btn"
                    onClick={() => updateQty(item.id, item.qty - 1)}
                    disabled={item.qty <= 1}
                  >−</button>
                  <span className="qty-value">{item.qty}</span>
                  <button
                    className="qty-btn"
                    onClick={() => updateQty(item.id, item.qty + 1)}
                  >+</button>
                </div>
                <div className="cart-item__subtotal">
                  ₪{(item.price * item.qty).toFixed(2)}
                </div>
                <button
                  className="btn btn--danger btn--sm cart-item__remove"
                  onClick={() => removeFromCart(item.id)}
                >🗑️</button>
              </div>
            ))}
          </div>

          <div className="cart__summary">
            <h2>סיכום הזמנה</h2>
            <div className="cart__summary-rows">
              {items.map(item => (
                <div key={item.id} className="cart__summary-row">
                  <span>{item.title} × {item.qty}</span>
                  <span>₪{(item.price * item.qty).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="cart__summary-total">
              <span>סה"כ לתשלום</span>
              <span>₪{totalPrice.toFixed(2)}</span>
            </div>
            <button
              className="btn btn--primary btn--full"
              onClick={() => navigate('/checkout')}
            >
              מעבר לתשלום ←
            </button>
            <button
              className="btn btn--outline btn--full"
              onClick={() => navigate('/')}
            >
              המשך לקנות
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

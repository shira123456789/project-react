import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import axios from 'axios'

const API = 'http://localhost:3001'

export default function BookCard({ book, onDelete }) {
  const { user } = useAuth()
  const { addToCart } = useCart()
  const navigate = useNavigate()

  const handleDelete = async (e) => {
    e.stopPropagation()
    if (!window.confirm(`למחוק את "${book.title}"?`)) return
    await axios.delete(`${API}/products/${book.id}`)
    onDelete(book.id)
  }

  const handleAddToCart = (e) => {
    e.stopPropagation()
    addToCart(book)
  }

  return (
    <div className="book-card" onClick={() => navigate(`/book/${book.id}`)}>
      <div className="book-card__img-wrap">
        <img
          src={book.image}
          alt={book.title}
          loading="lazy"
          onError={(e) => { e.target.src = `https://picsum.photos/seed/fallback${book.id}/400/600` }}
        />
      </div>
      <div className="book-card__body">
        <h3>{book.title}</h3>
        <p className="book-card__author">{book.author}</p>
        <div className="book-card__meta">
          <span className="book-card__category">{book.category}</span>
          <span className="book-card__rating">⭐ {book.rating}</span>
        </div>
        <div className="book-card__footer">
          <span className="book-card__price">₪{book.price}</span>
          <div className="book-card__actions">
            <button className="btn btn--primary btn--sm" onClick={handleAddToCart}>🛒 הוסף</button>
            {user?.isAdmin && (
              <button className="btn btn--danger btn--sm" onClick={handleDelete}>🗑️</button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

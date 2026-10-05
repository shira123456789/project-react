import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

const API = 'http://localhost:3001'

const reviewSchema = Yup.object({
  rating: Yup.number().min(1).max(5).required('בחר דירוג'),
  comment: Yup.string().min(10, 'חוות דעת חייבת להכיל לפחות 10 תווים').required('שדה חובה'),
})

function StarRating({ value, onChange }) {
  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map(star => (
        <span
          key={star}
          className={`star ${star <= value ? 'star--active' : ''}`}
          onClick={() => onChange(star)}
        >★</span>
      ))}
    </div>
  )
}

export default function BookDetails() {
  const { id } = useParams()
  const { user } = useAuth()
  const { addToCart, items } = useCart()
  const navigate = useNavigate()
  const [book, setBook] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [addedMsg, setAddedMsg] = useState(false)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [bookRes, reviewsRes] = await Promise.all([
          axios.get(`${API}/products/${id}`),
          axios.get(`${API}/reviews?productId=${id}`),
        ])
        setBook(bookRes.data)
        setReviews(reviewsRes.data)
      } catch {
        setError('הספר לא נמצא')
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [id])

  const handleAddToCart = () => {
    addToCart(book)
    setAddedMsg(true)
    setTimeout(() => setAddedMsg(false), 2000)
  }

  const formik = useFormik({
    initialValues: { rating: 0, comment: '' },
    validationSchema: reviewSchema,
    onSubmit: async (values, { resetForm, setSubmitting }) => {
      try {
        const newReview = {
          productId: parseInt(id),
          userId: user.id,
          userName: user.name,
          rating: values.rating,
          comment: values.comment,
          date: new Date().toISOString().split('T')[0],
        }
        const { data } = await axios.post(`${API}/reviews`, newReview)
        setReviews(prev => [...prev, data])
        resetForm()
      } finally {
        setSubmitting(false)
      }
    },
  })

  const handleDeleteReview = async (reviewId) => {
    await axios.delete(`${API}/reviews/${reviewId}`)
    setReviews(prev => prev.filter(r => r.id !== reviewId))
  }

  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null

  const inCart = items.find(i => i.id === book?.id)

  if (loading) return <div className="page"><Navbar /><div className="loader center"><div className="loader__spinner" />טוען...</div></div>
  if (error) return <div className="page"><Navbar /><div className="error-state">{error}</div></div>

  return (
    <div className="page">
      <Navbar />
      <main className="book-details">
        <button className="btn btn--ghost back-btn" onClick={() => navigate(-1)}>← חזור לקטלוג</button>

        <div className="book-details__hero">
          <div className="book-details__img-wrap">
            <img
              src={book.image}
              alt={book.title}
              className="book-details__img"
              onError={(e) => { e.target.src = `https://picsum.photos/seed/fallback${book.id}/400/600` }}
            />
            {book.rating >= 4.7 && (
              <span className="book-details__img-badge">⭐ בסטסלר</span>
            )}
          </div>

          <div className="book-details__info">
            <span className="book-card__category">{book.category}</span>
            <h1>{book.title}</h1>
            <p className="book-details__author">מאת {book.author}</p>
            <p className="book-details__desc">{book.description}</p>

            <div className="book-details__stats">
              <div className="book-details__stat">💰 ₪{book.price}</div>
              <div className="book-details__stat">🛒 {book.purchases.toLocaleString()} רכישות</div>
              <div className="book-details__stat">⭐ {avgRating || book.rating} ({reviews.length} ביקורות)</div>
            </div>

            <div className="book-details__cart-actions">
              <button className="btn btn--primary btn--lg" onClick={handleAddToCart}>
                🛒 הוסף לעגלה
              </button>
              {inCart && <span className="in-cart-msg">✅ בעגלה ({inCart.qty})</span>}
              {addedMsg && <span className="added-msg">✨ נוסף לעגלה!</span>}
            </div>
          </div>
        </div>

        <section className="reviews">
          <h2>חוות דעת ({reviews.length})</h2>

          <div className="reviews__list">
            {reviews.length === 0 && (
              <div className="empty-state">
                <div className="empty-state__icon">💬</div>
                <p>אין עדיין חוות דעת. היה הראשון!</p>
              </div>
            )}
            {reviews.map(review => (
              <div key={review.id} className="review-card">
                <div className="review-card__header">
                  <div className="review-card__avatar">{review.userName[0]}</div>
                  <span className="review-card__name">{review.userName}</span>
                  <span className="review-card__stars">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                  <span className="review-card__date">{review.date}</span>
                  {review.userId === user.id && (
                    <button className="btn btn--danger btn--sm" onClick={() => handleDeleteReview(review.id)}>🗑️</button>
                  )}
                </div>
                <p>{review.comment}</p>
              </div>
            ))}
          </div>

          <div className="reviews__form">
            <h3>✍️ הוסף חוות דעת</h3>
            <form onSubmit={formik.handleSubmit} noValidate>
              <div className="form-group">
                <label>דירוג</label>
                <StarRating value={formik.values.rating} onChange={(val) => formik.setFieldValue('rating', val)} />
                {formik.touched.rating && formik.errors.rating && <span className="error-msg">{formik.errors.rating}</span>}
              </div>
              <div className="form-group">
                <label>חוות דעת</label>
                <textarea
                  name="comment"
                  rows={4}
                  placeholder="שתף את דעתך על הספר..."
                  {...formik.getFieldProps('comment')}
                  className={formik.touched.comment && formik.errors.comment ? 'input--error' : ''}
                />
                {formik.touched.comment && formik.errors.comment && <span className="error-msg">{formik.errors.comment}</span>}
              </div>
              <button type="submit" className="btn btn--primary" disabled={formik.isSubmitting}>
                {formik.isSubmitting ? 'שולח...' : 'פרסם חוות דעת'}
              </button>
            </form>
          </div>
        </section>
      </main>
    </div>
  )
}

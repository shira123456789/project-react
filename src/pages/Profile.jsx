import { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'

const API = 'http://localhost:3001'

export default function Profile() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get(`${API}/reviews?userId=${user.id}`)
      .then(({ data }) => setReviews(data))
      .finally(() => setLoading(false))
  }, [user.id])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : '—'

  return (
    <div className="page">
      <Navbar />
      <main className="profile">

        <div className="profile__hero">
          <div className="profile__avatar-wrap">
            <img src={user.avatar} alt={user.name} className="profile__avatar" />
            <div className="profile__avatar-ring" />
          </div>
          <h1 className="profile__name">{user.name}</h1>
          <p className="profile__email">📧 {user.email}</p>
          {user.isAdmin && <span className="badge badge--admin">👑 מנהל מערכת</span>}
          <div className="profile__actions">
            <button className="btn btn--outline" onClick={handleLogout}>התנתק</button>
            {user.isAdmin && (
              <button className="btn btn--primary" onClick={() => navigate('/add-book')}>
                ➕ הוסף ספר
              </button>
            )}
          </div>
        </div>

        <div className="profile__stats">
          <div className="profile__stat-card">
            <div className="profile__stat-card-value">{reviews.length}</div>
            <div className="profile__stat-card-label">חוות דעת</div>
          </div>
          <div className="profile__stat-card">
            <div className="profile__stat-card-value">{avgRating}</div>
            <div className="profile__stat-card-label">דירוג ממוצע</div>
          </div>
          <div className="profile__stat-card">
            <div className="profile__stat-card-value">{user.isAdmin ? '👑' : '👤'}</div>
            <div className="profile__stat-card-label">{user.isAdmin ? 'מנהל' : 'משתמש'}</div>
          </div>
        </div>

        <div className="profile__reviews">
          <h2>חוות הדעת שלי ({reviews.length})</h2>
          {loading && <div className="loader"><div className="loader__spinner" />טוען...</div>}
          {!loading && reviews.length === 0 && (
            <div className="empty-state">
              <div className="empty-state__icon">✍️</div>
              <p>עדיין לא כתבת חוות דעת</p>
            </div>
          )}
          {reviews.map(review => (
            <div key={review.id} className="review-card">
              <div className="review-card__header">
                <div className="review-card__avatar">{user.name[0]}</div>
                <span className="review-card__name">{user.name}</span>
                <span className="review-card__stars">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                <span className="review-card__date">{review.date}</span>
              </div>
              <p>{review.comment}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

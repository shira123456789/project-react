import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { totalItems } = useCart()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="navbar">
      <Link to="/" className="navbar__logo">📚 חנות ספרים</Link>
      <div className="navbar__links">
        <Link to="/">דף הבית</Link>
        {user?.isAdmin && <Link to="/add-book">➕ הוסף ספר</Link>}
        <Link to="/profile">👤 {user?.name}</Link>
        <Link to="/cart" className="cart-icon">
          🛒
          {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
        </Link>
        <button onClick={handleLogout} className="btn btn--outline">התנתק</button>
      </div>
    </nav>
  )
}

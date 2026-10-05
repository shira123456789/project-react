import { useState, useEffect, useRef, useCallback } from 'react'
import axios from 'axios'
import Navbar from '../components/Navbar'
import BookCard from '../components/BookCard'

const API = 'http://localhost:3001'
const PAGE_SIZE = 20

export default function Home() {
  const [books, setBooks] = useState([])
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const searchTimeout = useRef(null)

  const fetchBooks = useCallback(async (searchTerm, pageNum, replace = false) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ _page: pageNum, _limit: PAGE_SIZE })
      if (searchTerm) params.append('title_like', searchTerm)
      const { data, headers } = await axios.get(`${API}/products?${params}`)
      const t = parseInt(headers['x-total-count'] || '0')
      setTotal(t)
      setBooks(prev => replace ? data : [...prev, ...data])
      setHasMore(pageNum * PAGE_SIZE < t)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchBooks('', 1, true) }, [fetchBooks])

  const handleSearchChange = (e) => {
    const val = e.target.value
    setSearch(val)
    clearTimeout(searchTimeout.current)
    searchTimeout.current = setTimeout(() => {
      setPage(1)
      fetchBooks(val, 1, true)
    }, 400)
  }

  const loadMore = () => {
    const next = page + 1
    setPage(next)
    fetchBooks(search, next, false)
  }

  const handleDelete = (id) => setBooks(prev => prev.filter(b => b.id !== id))

  return (
    <div className="page">
      <Navbar />

      <div className="home__hero">
        <h1>📚 חנות הספרים הדיגיטלית</h1>
        <p>גלה את הספר הבא שלך מתוך אלפי כותרים</p>
        <div className="home__search-wrap">
          <span className="home__search-icon">🔍</span>
          <input
            type="search"
            className="search-input"
            placeholder="חפש ספר לפי שם..."
            value={search}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      <div className="home__body">
        <div className="home__toolbar">
          <span className="home__count">
            {total > 0 && `${books.length} מתוך ${total} ספרים`}
          </span>
        </div>

        {books.length === 0 && !loading && (
          <div className="empty-state">
            <div className="empty-state__icon">🔍</div>
            <p>לא נמצאו ספרים התואמים לחיפוש</p>
          </div>
        )}

        <div className="books-grid">
          {books.map(book => (
            <BookCard key={book.id} book={book} onDelete={handleDelete} />
          ))}
        </div>

        {loading && (
          <div className="loader">
            <div className="loader__spinner" />
            טוען ספרים...
          </div>
        )}

        {hasMore && !loading && (
          <div className="load-more">
            <button className="btn btn--outline btn--lg" onClick={loadMore}>
              טען עוד ספרים ↓
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

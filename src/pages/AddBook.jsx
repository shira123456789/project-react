import { useFormik } from 'formik'
import * as Yup from 'yup'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'

const API = 'http://localhost:3001'

const validationSchema = Yup.object({
  title: Yup.string().min(2, 'שם חייב להכיל לפחות 2 תווים').required('שדה חובה'),
  author: Yup.string().min(2).required('שדה חובה'),
  price: Yup.number().positive('מחיר חייב להיות חיובי').required('שדה חובה'),
  category: Yup.string().required('שדה חובה'),
  description: Yup.string().min(20, 'תיאור חייב להכיל לפחות 20 תווים').required('שדה חובה'),
  image: Yup.string().url('כתובת URL לא תקינה').required('שדה חובה'),
})

const CATEGORIES = ['פנטזיה', 'דיסטופיה', 'ספרות', 'ספרות ישראלית', 'קלאסיקה', 'הרפתקאות', 'ילדים', 'מסתורין', 'ריאליזם קסום']

export default function AddBook() {
  const navigate = useNavigate()

  const formik = useFormik({
    initialValues: {
      title: '', author: '', price: '', category: '', description: '', image: '',
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await axios.post(`${API}/products`, {
          ...values,
          price: parseFloat(values.price),
          purchases: 0,
          rating: 0,
        })
        navigate('/')
      } finally {
        setSubmitting(false)
      }
    },
  })

  const fields = [
    { name: 'title', label: 'שם הספר', type: 'text', placeholder: 'שם הספר' },
    { name: 'author', label: 'מחבר', type: 'text', placeholder: 'שם המחבר' },
    { name: 'price', label: 'מחיר (₪)', type: 'number', placeholder: '49.90' },
    { name: 'image', label: 'קישור לתמונה (URL)', type: 'url', placeholder: 'https://...' },
  ]

  return (
    <div className="page">
      <Navbar />
      <main className="add-book">
        <h1>➕ הוספת ספר חדש</h1>
        <form onSubmit={formik.handleSubmit} noValidate className="add-book__form">
          {fields.map(({ name, label, type, placeholder }) => (
            <div className="form-group" key={name}>
              <label>{label}</label>
              <input
                type={type}
                name={name}
                placeholder={placeholder}
                {...formik.getFieldProps(name)}
                className={formik.touched[name] && formik.errors[name] ? 'input--error' : ''}
              />
              {formik.touched[name] && formik.errors[name] && (
                <span className="error-msg">{formik.errors[name]}</span>
              )}
            </div>
          ))}

          <div className="form-group">
            <label>קטגוריה</label>
            <select name="category" {...formik.getFieldProps('category')}
              className={formik.touched.category && formik.errors.category ? 'input--error' : ''}>
              <option value="">בחר קטגוריה</option>
              {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            {formik.touched.category && formik.errors.category && (
              <span className="error-msg">{formik.errors.category}</span>
            )}
          </div>

          <div className="form-group">
            <label>תיאור</label>
            <textarea
              name="description"
              rows={4}
              placeholder="תיאור הספר..."
              {...formik.getFieldProps('description')}
              className={formik.touched.description && formik.errors.description ? 'input--error' : ''}
            />
            {formik.touched.description && formik.errors.description && (
              <span className="error-msg">{formik.errors.description}</span>
            )}
          </div>

          {formik.values.image && (
            <div className="image-preview">
              <img src={formik.values.image} alt="תצוגה מקדימה" onError={(e) => e.target.style.display = 'none'} />
            </div>
          )}

          <div className="form-actions">
            <button type="button" className="btn btn--outline" onClick={() => navigate('/')}>ביטול</button>
            <button type="submit" className="btn btn--primary" disabled={formik.isSubmitting}>
              {formik.isSubmitting ? 'שומר...' : 'הוסף ספר'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}

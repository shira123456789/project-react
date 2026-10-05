import { useFormik } from 'formik'
import * as Yup from 'yup'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const API = 'http://localhost:3001'

const validationSchema = Yup.object({
  email: Yup.string().email('אימייל לא תקין').required('שדה חובה'),
  password: Yup.string().required('שדה חובה'),
})

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const formik = useFormik({
    initialValues: { email: '', password: '' },
    validationSchema,
    onSubmit: async (values, { setFieldError, setSubmitting }) => {
      try {
        const { data: users } = await axios.get(`${API}/users?email=${values.email}`)
        if (users.length === 0) {
          setFieldError('email', 'אימייל לא קיים במערכת')
          return
        }
        const user = users[0]
        if (user.password !== values.password) {
          setFieldError('password', 'סיסמה שגויה')
          return
        }
        login(user)
        navigate('/')
      } catch {
        setFieldError('email', 'שגיאת שרת, נסה שוב')
      } finally {
        setSubmitting(false)
      }
    },
  })

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>📚 כניסה לחנות</h1>
        <form onSubmit={formik.handleSubmit} noValidate>
          <div className="form-group">
            <label>אימייל</label>
            <input
              type="email"
              name="email"
              placeholder="your@email.com"
              {...formik.getFieldProps('email')}
              className={formik.touched.email && formik.errors.email ? 'input--error' : ''}
            />
            {formik.touched.email && formik.errors.email && (
              <span className="error-msg">{formik.errors.email}</span>
            )}
          </div>

          <div className="form-group">
            <label>סיסמה</label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              {...formik.getFieldProps('password')}
              className={formik.touched.password && formik.errors.password ? 'input--error' : ''}
            />
            {formik.touched.password && formik.errors.password && (
              <span className="error-msg">{formik.errors.password}</span>
            )}
          </div>

          <button type="submit" className="btn btn--primary" disabled={formik.isSubmitting}>
            {formik.isSubmitting ? 'מתחבר...' : 'כניסה'}
          </button>
        </form>
        <p className="auth-link">
          אין לך חשבון? <Link to="/register">הירשם כאן</Link>
        </p>

      </div>
    </div>
  )
}

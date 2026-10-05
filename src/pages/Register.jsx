import { useFormik } from 'formik'
import * as Yup from 'yup'
import axios from 'axios'
import { Link } from 'react-router-dom'
import { useState } from 'react'

const API = 'http://localhost:3001'

const validationSchema = Yup.object({
  name: Yup.string().min(2, 'שם חייב להכיל לפחות 2 תווים').required('שדה חובה'),
  email: Yup.string().email('אימייל לא תקין').required('שדה חובה'),
  password: Yup.string()
    .min(8, 'סיסמה חייבת להכיל לפחות 8 תווים')
    .matches(/[A-Z]/, 'חייב להכיל אות גדולה אחת לפחות')
    .matches(/[a-z]/, 'חייב להכיל אות קטנה אחת לפחות')
    .matches(/[0-9]/, 'חייב להכיל ספרה אחת לפחות')
    .matches(/[!@#$%^&*]/, 'חייב להכיל תו מיוחד אחד לפחות (!@#$%^&*)')
    .required('שדה חובה'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'הסיסמאות אינן תואמות')
    .required('שדה חובה'),
})

export default function Register() {
  const [success, setSuccess] = useState(false)

  const formik = useFormik({
    initialValues: { name: '', email: '', password: '', confirmPassword: '' },
    validationSchema,
    onSubmit: async (values, { setFieldError, setSubmitting }) => {
      try {
        const { data: existing } = await axios.get(`${API}/users?email=${values.email}`)
        if (existing.length > 0) {
          setFieldError('email', 'אימייל זה כבר רשום במערכת')
          return
        }
        await axios.post(`${API}/users`, {
          name: values.name,
          email: values.email,
          password: values.password,
          isAdmin: false,
          avatar: `https://i.pravatar.cc/150?u=${values.email}`,
        })
        setSuccess(true)
      } catch {
        setFieldError('email', 'שגיאת שרת, נסה שוב')
      } finally {
        setSubmitting(false)
      }
    },
  })

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-card auth-card--success">
          <div className="success-icon">✅</div>
          <h2>ההרשמה הצליחה!</h2>
          <p>החשבון שלך נוצר בהצלחה.</p>
          <Link to="/login" className="btn btn--primary">עבור לדף הכניסה</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>📚 הרשמה לחנות</h1>
        <form onSubmit={formik.handleSubmit} noValidate>
          {[
            { name: 'name', label: 'שם מלא', type: 'text', placeholder: 'ישראל ישראלי' },
            { name: 'email', label: 'אימייל', type: 'email', placeholder: 'your@email.com' },
            { name: 'password', label: 'סיסמה', type: 'password', placeholder: '••••••••' },
            { name: 'confirmPassword', label: 'אימות סיסמה', type: 'password', placeholder: '••••••••' },
          ].map(({ name, label, type, placeholder }) => (
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

          <button type="submit" className="btn btn--primary" disabled={formik.isSubmitting}>
            {formik.isSubmitting ? 'נרשם...' : 'הרשמה'}
          </button>
        </form>
        <p className="auth-link">
          כבר יש לך חשבון? <Link to="/login">כניסה</Link>
        </p>
      </div>
    </div>
  )
}

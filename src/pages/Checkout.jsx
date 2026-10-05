import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import axios from 'axios'
import Navbar from '../components/Navbar'
import { useCart } from '../context/CartContext'

const API = 'http://localhost:3001'

const checkoutSchema = Yup.object({
  fullName: Yup.string().min(2, 'שם חייב להכיל לפחות 2 תווים').required('שדה חובה'),
  address: Yup.string().min(5, 'כתובת חייבת להכיל לפחות 5 תווים').required('שדה חובה'),
  city: Yup.string().required('שדה חובה'),
  cardNumber: Yup.string()
    .matches(/^\d{16}$/, 'מספר כרטיס חייב להכיל 16 ספרות')
    .required('שדה חובה'),
  expiry: Yup.string()
    .matches(/^(0[1-9]|1[0-2])\/\d{2}$/, 'פורמט: MM/YY')
    .required('שדה חובה'),
  cvv: Yup.string()
    .matches(/^\d{3,4}$/, 'CVV חייב להכיל 3-4 ספרות')
    .required('שדה חובה'),
})

export default function Checkout() {
  const { items, totalPrice, clearCart } = useCart()
  const navigate = useNavigate()
  const [orderSuccess, setOrderSuccess] = useState(false)
  const [orderSummary, setOrderSummary] = useState(null)

  const formik = useFormik({
    initialValues: {
      fullName: '', address: '', city: '',
      cardNumber: '', expiry: '', cvv: '',
    },
    validationSchema: checkoutSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        // עדכון purchases לכל ספר שנרכש
        await Promise.all(
          items.map(item =>
            axios.patch(`${API}/products/${item.id}`, {
              purchases: item.purchases + item.qty,
            })
          )
        )
        setOrderSummary({ items: [...items], total: totalPrice, address: values.address, city: values.city, name: values.fullName })
        clearCart()
        setOrderSuccess(true)
      } finally {
        setSubmitting(false)
      }
    },
  })

  if (items.length === 0 && !orderSuccess) {
    navigate('/cart')
    return null
  }

  if (orderSuccess) {
    return (
      <div className="page">
        <Navbar />
        <main className="checkout">
          <div className="order-success">
            <div className="order-success__icon">🎉</div>
            <h1>ההזמנה אושרה!</h1>
            <p>תודה {orderSummary.name}, הזמנתך התקבלה בהצלחה.</p>
            <div className="order-success__summary">
              <h3>סיכום הזמנה</h3>
              {orderSummary.items.map(item => (
                <div key={item.id} className="order-success__row">
                  <span>{item.title} × {item.qty}</span>
                  <span>₪{(item.price * item.qty).toFixed(2)}</span>
                </div>
              ))}
              <div className="order-success__total">
                <strong>סה"כ שולם</strong>
                <strong>₪{orderSummary.total.toFixed(2)}</strong>
              </div>
              <p className="order-success__address">
                📦 משלוח אל: {orderSummary.address}, {orderSummary.city}
              </p>
            </div>
            <button className="btn btn--primary btn--lg" onClick={() => navigate('/')}>
              חזור לחנות
            </button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="page">
      <Navbar />
      <main className="checkout">
        <h1>💳 תשלום</h1>
        <div className="checkout__layout">
          <form onSubmit={formik.handleSubmit} noValidate className="checkout__form">

            <div className="checkout__section">
              <h2>פרטי משלוח</h2>
              {[
                { name: 'fullName', label: 'שם מלא', placeholder: 'ישראל ישראלי' },
                { name: 'address', label: 'כתובת', placeholder: 'רחוב הרצל 1' },
                { name: 'city', label: 'עיר', placeholder: 'תל אביב' },
              ].map(({ name, label, placeholder }) => (
                <div className="form-group" key={name}>
                  <label>{label}</label>
                  <input
                    type="text"
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
            </div>

            <div className="checkout__section">
              <h2>פרטי תשלום</h2>
              <div className="form-group">
                <label>מספר כרטיס אשראי</label>
                <input
                  type="text"
                  name="cardNumber"
                  placeholder="1234567890123456"
                  maxLength={16}
                  {...formik.getFieldProps('cardNumber')}
                  className={formik.touched.cardNumber && formik.errors.cardNumber ? 'input--error' : ''}
                />
                {formik.touched.cardNumber && formik.errors.cardNumber && (
                  <span className="error-msg">{formik.errors.cardNumber}</span>
                )}
              </div>
              <div className="checkout__card-row">
                <div className="form-group">
                  <label>תוקף (MM/YY)</label>
                  <input
                    type="text"
                    name="expiry"
                    placeholder="12/27"
                    maxLength={5}
                    {...formik.getFieldProps('expiry')}
                    className={formik.touched.expiry && formik.errors.expiry ? 'input--error' : ''}
                  />
                  {formik.touched.expiry && formik.errors.expiry && (
                    <span className="error-msg">{formik.errors.expiry}</span>
                  )}
                </div>
                <div className="form-group">
                  <label>CVV</label>
                  <input
                    type="text"
                    name="cvv"
                    placeholder="123"
                    maxLength={4}
                    {...formik.getFieldProps('cvv')}
                    className={formik.touched.cvv && formik.errors.cvv ? 'input--error' : ''}
                  />
                  {formik.touched.cvv && formik.errors.cvv && (
                    <span className="error-msg">{formik.errors.cvv}</span>
                  )}
                </div>
              </div>
            </div>

            <button type="submit" className="btn btn--primary btn--full btn--lg" disabled={formik.isSubmitting}>
              {formik.isSubmitting ? 'מעבד תשלום...' : `✅ אישור רכישה - ₪${totalPrice.toFixed(2)}`}
            </button>
          </form>

          <div className="checkout__summary">
            <h2>סיכום הזמנה</h2>
            {items.map(item => (
              <div key={item.id} className="checkout__summary-row">
                <img src={item.image} alt={item.title} />
                <div>
                  <p>{item.title}</p>
                  <small>כמות: {item.qty}</small>
                </div>
                <span>₪{(item.price * item.qty).toFixed(2)}</span>
              </div>
            ))}
            <div className="checkout__summary-total">
              <span>סה"כ לתשלום</span>
              <strong>₪{totalPrice.toFixed(2)}</strong>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

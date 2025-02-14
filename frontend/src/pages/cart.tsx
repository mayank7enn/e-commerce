import { useEffect, useState } from 'react'
import { VscError } from 'react-icons/vsc'
import CartItem from '../components/cart-item'
import { Link } from 'react-router-dom'

const cartItems = [
  {
    productID: '1',
    photo: 'https://via.placeholder.com/150',
    name: 'Product 1',
    price: 1000,
    stock: 10,
  },
  {
    productID: '2',
    photo: 'https://via.placeholder.com/150',
    name: 'Product 2',
    price: 2000,
    stock: 5,
  },
  {
    productID: '3',
    photo: 'https://via.placeholder.com/150',
    name: 'Product 3',
    price: 1000,
    stock: 2,
  },
  {
    productID: '4',
    photo: 'https://via.placeholder.com/150',
    name: 'Product 4',
    price: 1000,
    stock: 1,
  }
]
const subtotal = 4000
const tax = Math.round(subtotal * 0.18)
const shippingCharges = 200
const discount = 500
const total = subtotal + tax + shippingCharges
const Cart = () => {

  const [couponCode, setCouponCode] = useState<string>('')
  const [isvalidcouponCode, setIsValidCouponCode] = useState<boolean>(false)

  useEffect(() => {
    // if (couponCode === 'DISCOUNT') {
    //   setIsValidCouponCode(true)
    // } else {
    //   setIsValidCouponCode(false)
    // }
    const timeOutID = setTimeout(() => {
      if(Math.random() > 0.5) {
        setIsValidCouponCode(true)
      } else {
        setIsValidCouponCode(false)
      }

      return  () => {
        clearTimeout(timeOutID)
        setIsValidCouponCode(false)
      }
    }, 1000)
  }, [couponCode])

  return (
    <div>
      <div className="cart">
        <main>

          {
            cartItems.length > 0 ? (
              cartItems.map((cartItem) => (
                <CartItem key={cartItem.productID} cartItem={cartItem} />
              ))
            ) : (
              <div>
                <h1>Your cart is empty</h1>
                <Link to="/">Go to Home</Link>
              </div>
            )
          }

        </main>
        <aside>
          <p>Subtotal: ₹{subtotal}</p>
          <p>Shipping Charges: ₹{shippingCharges}</p>
          <p>Tax: ₹{tax}</p>
          <p>
            Discount: <em>- ₹{discount}</em>
          </p>
          <p>
            <b>Total: ₹{total}</b>
          </p>

          <input
            type="text"
            placeholder="Coupon Code"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
          />

          {couponCode && (
            isvalidcouponCode ? (
              <span className="green">₹{discount} off using the <code>{couponCode}</code></span>
              ) : (
              <span className="red">
                Invalid Coupon Code <VscError />
              </span>
              )
          )}

          {
            cartItems.length > 0 && <Link to="/shipping">Proceed to Checkout</Link>
          }
        </aside>
      </div>
    </div>
  )
}

export default Cart
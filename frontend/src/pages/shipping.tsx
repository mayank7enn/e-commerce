import { useState, ChangeEvent } from "react"
import { BiArrowBack } from "react-icons/bi"

const Shipping = () => {
    const [shippingInfo, setShippingInfo]= useState({
        address: "",
        city: "",
        state: "",
        country: "",
        pinCode: "",
    })
    const changeHandler = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        // const { name, value } = e.target;
        // setShippingInfo(prev => ({ ...prev, [name]: value }));

        setShippingInfo((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    }

  return (
    <div>
        <div className="shipping">
            <button className="back-btn" onClick={() => window.history.back()}>
                <BiArrowBack />
            </button>

            <form action="">
                <h1>Shipping Address</h1>
                <input
                    type="text" 
                    placeholder="City" 
                    name="city"
                    value={shippingInfo.city}
                    onChange={changeHandler}
                />
                <input
                    type="text" 
                    placeholder="State" 
                    name="state"
                    value={shippingInfo.state}
                    onChange={changeHandler}
                />
                <select 
                    name="country" 
                    required value={shippingInfo.country}
                    onChange={changeHandler}
                    >
                    <option value="">Select Country</option>
                    <option value="india">India</option>
                    </select>
                <input
                    type="number" 
                    placeholder="Pin Code" 
                    name="pinCode"
                    value={shippingInfo.pinCode}
                    onChange={changeHandler}
                />
                <button type="submit">Proceed to Payment</button>
            </form>
        </div>
    </div>
  )
}

export default Shipping
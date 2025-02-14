import { FcGoogle } from "react-icons/fc"
import { useState } from "react"

const login = () => {

  const [gender, setGender] = useState("")
  const [date, setDate] = useState("")
  return (
    <div>
      <div className="login">
        <main>
          <h1 className="heading">Login</h1>

          <div>
            <label>Gender</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="others">Others</option>
            </select>
          </div>

          <div>
            <label>Date of birth</label>
            <input 
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div>
            <p>Already signed in?</p>
            <button>
              <FcGoogle />
              <span>Sign in with google</span>
            </button>
          </div>
        </main>
      </div>
    </div>
  )
}

export default login
import { Link } from "react-router-dom"
import { FaSearch, FaShoppingBag, FaSignInAlt, FaSignOutAlt } from "react-icons/fa"
import { FaUser } from "react-icons/fa6"
import { useState } from "react"

const user = {_id: "hgf", role: "admin"}

const Header = () => {
    const [isOpen, setIsOpen] = useState<boolean>(false)

    const logoutHandler = () => {
        setIsOpen(false)
    }

  return (
    <nav className="header">
        <Link onClick={() => setIsOpen(false)} to={"/"}>Home</Link>
        <Link onClick={() => setIsOpen(false)} to={"/search"}><FaSearch /></Link>
        <Link onClick={() => setIsOpen(false)} to={"/cart"}><FaShoppingBag /></Link>

{
    user?._id ? (
    <>
        <button onClick={() => setIsOpen((prev) => !prev)}>
            <FaUser />
        </button>
        <dialog open={isOpen}>
            <div>
                {user.role === 'admin' &&(
                    <Link onClick={() => setIsOpen(false)} to={"/admin/dashboard"}>Admin</Link>
                )}
                <Link onClick={logoutHandler} to={"/orders"}>Orders</Link>
                <button>
                    <FaSignOutAlt />
                </button>
            </div>
        </dialog>
    </>) : (<Link to={"/login"}><FaSignInAlt /></Link>)
}
    </nav>
  )
}

export default Header
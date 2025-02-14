// import React from 'react'
import { Link } from 'react-router-dom'
import ProductCard from '../components/product-cart'
const Home = () => {
  const addToCartHandler = () => {}
  
  return (
    <div className="home">
      <section></section>

      <h1>
        Latest products
        <Link to="/search" className="findmore">More</Link>
      </h1>
      <main>
        <ProductCard
          productID="hjg"
          name = "Product 1"
          price = {8787}
          stock = {10}
          handler = {addToCartHandler}
          photo = "https://m.media-amazon.com/images/I/71jG+e7roXL._SX522_.jpg"
        />
      </main>
    </div>
  )
}

export default Home
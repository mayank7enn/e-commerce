import { useState } from 'react';
import ProductCard from '../components/product-cart';


const Search = () => {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("");
  const [maxPrice, setMaxPrice] = useState(0);
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);

  const addToCartHandler = () => {}

  const isNextPage = page < 4;
  const isPrevPage = page > 1;

  return (
    <div>
      <div className="product-search-page">
        <aside>
          <h2>Filters</h2>
          <div>
            <h4>Sort</h4>
            <select value={sort} onChange={e => setSort(e.target.value)}>
              <option value="">None</option>
              <option value="asc">Price(Low to High)</option>
              <option value="dec">Price(High to Low)</option>
            </select>
          </div>

          <div>
            <h4>Max Price: {maxPrice || ""}</h4>
            <input
              type="range"
              min={100}
              max={100000}
              value={maxPrice}
              onChange={e => setMaxPrice(Number(e.target.value))} 
            />
          </div>

          <div>
            <h4>Category</h4>
            <select 
              value={category}
              onChange={e => setCategory(e.target.value)}>
                <option value="">All</option>
                <option value="">Sample1</option>
                <option value="">Sample2</option>
              </select>
          </div>
        </aside>
        <main>
          <h1>Products</h1>
          <input 
            type="text" 
            placeholder="Search ny name..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <div className="search-product-list">
            <ProductCard
              productID="hjg"
              name = "Product 1"
              price = {8787}
              stock = {10}
              handler = {addToCartHandler}
              photo = "https://m.media-amazon.com/images/I/71jG+e7roXL._SX522_.jpg"
            />
          </div>

          <article>
            <button 
              disabled={!isPrevPage}
              onClick={()=> setPage((prev) => prev - 1)}
            >
              prev
            </button>
            <span>{page} of {4}</span>
            <button 
              disabled={!isNextPage}
              onClick={()=> setPage((prev) => prev + 1)}
            >
              next
            </button>
          </article>
        </main>
      </div>
    </div>
  )
}

export default Search
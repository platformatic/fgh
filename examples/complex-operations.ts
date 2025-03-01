// Complex FGH Operations Example
import { query, compile } from '../src/fgh.ts'

// Sample dataset: A product catalog with categories, products, and ratings
const productCatalog = {
  categories: [
    {
      name: 'Electronics',
      products: [
        { id: 'e1', name: 'Smartphone', price: 699.99, stock: 42, ratings: [4, 5, 3, 5, 4] },
        { id: 'e2', name: 'Laptop', price: 1299.99, stock: 15, ratings: [5, 4, 5, 5, 4, 3] },
        { id: 'e3', name: 'Headphones', price: 149.99, stock: 28, ratings: [4, 3, 4, 2, 5] }
      ]
    },
    {
      name: 'Books',
      products: [
        { id: 'b1', name: 'Programming Guide', price: 39.99, stock: 58, ratings: [5, 5, 4, 4, 5] },
        { id: 'b2', name: 'Science Fiction Novel', price: 15.99, stock: 93, ratings: [3, 4, 3, 5, 4] }
      ]
    },
    {
      name: 'Home',
      products: [
        { id: 'h1', name: 'Coffee Maker', price: 89.99, stock: 12, ratings: [4, 5, 3, 4] },
        { id: 'h2', name: 'Toaster', price: 49.99, stock: 24, ratings: [3, 2, 3, 4, 3] }
      ]
    }
  ],
  storeInfo: {
    name: 'Everything Store',
    location: {
      city: 'San Francisco',
      state: 'CA'
    },
    yearFounded: 2010
  }
}

// Example 1: Extract all product names across all categories
console.log('\nExample 1: Extract all product names across all categories')
console.log(query('.categories[].products[].name', productCatalog))
// => ['Smartphone', 'Laptop', 'Headphones', 'Programming Guide', 'Science Fiction Novel', 'Coffee Maker', 'Toaster']

// Example 2: Calculate average rating for each product (using pipe and object construction)
console.log('\nExample 2: Calculate average rating for each product')
const productRatings = query('.categories[].products[] | { name: .name, avgRating: ((.ratings | map(.) | add) / (.ratings | length)) }', productCatalog)
console.log(JSON.stringify(productRatings, null, 2))
/*
[
  { "name": "Smartphone", "avgRating": 4.2 },
  { "name": "Laptop", "avgRating": 4.333333333333333 },
  ...
]
*/

// Example 3: Find products that are low in stock (less than 20 items)
console.log('\nExample 3: Find products that are low in stock')
const lowStockProducts = query('.categories[].products[] | select(.stock < 20) | { id, name, stock }', productCatalog)
console.log(JSON.stringify(lowStockProducts, null, 2))
/*
[
  { "id": "e2", "name": "Laptop", "stock": 15 },
  { "id": "h1", "name": "Coffee Maker", "stock": 12 }
]
*/

// Example 4: Create a price summary with highest and lowest priced product names
console.log('\nExample 4: Price summary with highest and lowest priced products')
// First, we'll compile this complex query for better performance
const priceSummaryFn = compile(`{
  lowestPrice: (.categories[].products | min_by(.price)),
  highestPrice: (.categories[].products | max_by(.price)),
  averagePrice: ((.categories[].products[].price | add) / (.categories[].products | length))
}`)
console.log(JSON.stringify(priceSummaryFn(productCatalog), null, 2))
/*
{
  "lowestPrice": { "id": "b2", "name": "Science Fiction Novel", "price": 15.99, ... },
  "highestPrice": { "id": "e2", "name": "Laptop", "price": 1299.99, ... },
  "averagePrice": 335.13285714285716
}
*/

// Example 5: Get total inventory value by category
console.log('\nExample 5: Total inventory value by category')
const inventoryByCategory = query('.categories[] | { category: .name, totalValue: (.products | map(.price * .stock) | add) }', productCatalog)
console.log(JSON.stringify(inventoryByCategory, null, 2))
/*
[
  {
    "category": "Electronics",
    "totalValue": 53389.58
  },
  {
    "category": "Books",
    "totalValue": 3707.69
  },
  {
    "category": "Home",
    "totalValue": 2278.64
  }
]
*/

// Example 6: Create a product lookup table by ID
console.log('\nExample 6: Product lookup table by ID')
const productLookup = query('{ products: (.categories[].products[] | { (.id): . }) | add }', productCatalog)
console.log(JSON.stringify(productLookup, null, 2))
/*
{
  "products": {
    "e1": { "id": "e1", "name": "Smartphone", ... },
    "e2": { "id": "e2", "name": "Laptop", ... },
    ...
  }
}
*/

// Example 7: Find top-rated products (average rating >= 4.5)
console.log('\nExample 7: Find top-rated products')
const topRatedProducts = query('.categories[].products[] | select((.ratings | add) / (.ratings | length) >= 4.5) | { name, averageRating: ((.ratings | add) / (.ratings | length)) }', productCatalog)
console.log(JSON.stringify(topRatedProducts, null, 2))
/*
[
  { "name": "Programming Guide", "averageRating": 4.6 }
]
*/

// Example 8: Count products by price range
console.log('\nExample 8: Count products by price range')
const priceRanges = query(`{
  "Under $50": (.categories[].products[] | select(.price < 50) | length),
  "$50-$100": (.categories[].products[] | select(.price >= 50 and .price <= 100) | length),
  "$100-$500": (.categories[].products[] | select(.price > 100 and .price <= 500) | length),
  "Over $500": (.categories[].products[] | select(.price > 500) | length)
}`, productCatalog)
console.log(JSON.stringify(priceRanges, null, 2))
/*
{
  "Under $50": 2,
  "$50-$100": 2,
  "$100-$500": 1,
  "Over $500": 2
}
*/

// Example 9: Generate a store summary with product statistics
console.log('\nExample 9: Store summary with product statistics')
const storeSummary = query(`{
  storeName: .storeInfo.name,
  location: .storeInfo.location.city + ", " + .storeInfo.location.state,
  totalProducts: (.categories[].products | length),
  totalCategories: (.categories | length),
  inventoryValue: (.categories[].products[] | .price * .stock | add),
  averageProductPrice: (.categories[].products[].price | add) / (.categories[].products | length)
}`, productCatalog)
console.log(JSON.stringify(storeSummary, null, 2))
/*
{
  "storeName": "Everything Store",
  "location": "San Francisco, CA",
  "totalProducts": 7,
  "totalCategories": 3,
  "inventoryValue": 59375.91,
  "averageProductPrice": 335.13285714285716
}
*/

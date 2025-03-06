import { test, describe } from 'node:test'
import assert from 'node:assert'
import { query } from '../src/fgh.ts'

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

describe('complex operations', async (t) => {
  test('should extract all product names across all categories', () => {
    const result = query('.categories[].products[].name', productCatalog)
    assert.deepEqual(
      result,
      ['Smartphone', 'Laptop', 'Headphones', 'Programming Guide', 'Science Fiction Novel', 'Coffee Maker', 'Toaster']
    )
  })

  test('should find products that are low in stock', () => {
    const result = query('.categories[].products[] | select(.stock < 20) | { id, name, stock }', productCatalog)

    assert.equal(result.length, 2)

    const ids = result.map(item => item.id)
    assert.ok(ids.includes('e2'))
    assert.ok(ids.includes('h1'))

    // Check stock values
    const laptop = result.find(item => item.id === 'e2')
    const coffeeMaker = result.find(item => item.id === 'h1')

    assert.equal(laptop.stock, 15)
    assert.equal(coffeeMaker.stock, 12)
  })
})

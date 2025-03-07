// This file contains data sets for benchmarking FGH

// Small flat object
export const SIMPLE_OBJECT = {
  name: 'John',
  age: 30,
  city: 'New York',
  active: true,
  score: 42,
  tags: ['developer', 'javascript']
}

// Small array of objects
export const ARRAY_OF_OBJECTS = [
  { id: 1, name: 'Alice', age: 25, city: 'Boston', active: true },
  { id: 2, name: 'Bob', age: 30, city: 'Seattle', active: false },
  { id: 3, name: 'Charlie', age: 35, city: 'Portland', active: true },
  { id: 4, name: 'Diana', age: 28, city: 'Austin', active: true },
  { id: 5, name: 'Edward', age: 42, city: 'Chicago', active: false }
]

// Nested object with arrays
export const NESTED_OBJECT = {
  user: {
    personal: {
      name: 'John Doe',
      age: 32,
      contact: {
        email: 'john.doe@example.com',
        phone: '555-1234'
      }
    },
    preferences: {
      theme: 'dark',
      notifications: true,
      privacy: {
        showEmail: false,
        showPhone: true
      }
    }
  },
  posts: [
    {
      id: 1,
      title: 'Hello World',
      tags: ['intro', 'welcome'],
      comments: [
        { author: 'Alice', text: 'Nice post!', likes: 5 },
        { author: 'Bob', text: 'Welcome aboard!', likes: 3 }
      ]
    },
    {
      id: 2,
      title: 'FGH vs JQ',
      tags: ['comparison', 'benchmark'],
      comments: [
        { author: 'Charlie', text: 'Interesting comparison!', likes: 8 },
        { author: 'Diana', text: 'Nice benchmark results', likes: 4 }
      ]
    }
  ]
}

// Medium-sized array (100 items)
export const MEDIUM_ARRAY = Array.from({ length: 100 }, (_, i) => ({
  id: i,
  value: `value-${i}`,
  active: i % 2 === 0,
  priority: (i % 3) + 1,
  nested: {
    level1: {
      level2: {
        data: i * 10,
        metadata: {
          created: new Date().toISOString(),
          source: `source-${i % 5}`
        }
      }
    }
  }
}))

// Large-sized array (1000 items)
export const LARGE_ARRAY = Array.from({ length: 1000 }, (_, i) => ({
  id: i,
  value: `value-${i}`,
  active: i % 2 === 0,
  priority: (i % 3) + 1,
  tags: [
    `tag-${i % 5}`,
    `tag-${i % 10}`,
    `tag-${i % 15}`
  ],
  nested: {
    level1: {
      level2: {
        data: i * 10,
        metadata: {
          created: new Date().toISOString(),
          lastModified: new Date().toISOString(),
          source: `source-${i % 5}`
        }
      }
    }
  }
}))

// Deep nested structure
export const DEEP_NESTED = {
  level1: {
    level2: {
      level3: {
        level4: {
          level5: {
            level6: {
              level7: {
                level8: {
                  value: 'deep-nested-value',
                  array: [1, 2, 3, 4, 5]
                }
              }
            }
          }
        }
      }
    }
  }
}

// Complex data structure with a mix of arrays and objects
export const COMPLEX_DATA = {
  company: {
    name: 'Acme Inc.',
    founded: 1985,
    locations: [
      {
        city: 'San Francisco',
        employees: 250,
        departments: ['Engineering', 'Sales', 'Marketing']
      },
      {
        city: 'New York',
        employees: 180,
        departments: ['Finance', 'Legal', 'HR']
      }
    ]
  },
  products: [
    {
      id: 'prod-1',
      name: 'Widget',
      price: 29.99,
      categories: ['Hardware', 'Tools'],
      variants: [
        { id: 'var-1', color: 'Red', inventory: 25 },
        { id: 'var-2', color: 'Blue', inventory: 15 }
      ],
      reviews: [
        { user: 'user123', rating: 4.5, comment: 'Great product!' },
        { user: 'user456', rating: 3.8, comment: 'Good value for money' }
      ]
    },
    {
      id: 'prod-2',
      name: 'Gadget',
      price: 49.99,
      categories: ['Electronics', 'Smart Home'],
      variants: [
        { id: 'var-3', color: 'Black', inventory: 42 },
        { id: 'var-4', color: 'White', inventory: 30 }
      ],
      reviews: [
        { user: 'user789', rating: 5.0, comment: 'Amazing gadget!' },
        { user: 'user101', rating: 4.2, comment: 'Works as expected' }
      ]
    }
  ],
  analytics: {
    visitors: [
      { date: '2023-01-01', count: 1245, sources: { direct: 600, search: 400, social: 245 } },
      { date: '2023-01-02', count: 1350, sources: { direct: 700, search: 450, social: 200 } },
      { date: '2023-01-03', count: 1190, sources: { direct: 550, search: 380, social: 260 } }
    ],
    sales: {
      '2023-Q1': {
        total: 125000,
        byProduct: {
          'prod-1': 75000,
          'prod-2': 50000
        },
        byRegion: {
          'North America': 80000,
          Europe: 35000,
          Asia: 10000
        }
      }
    }
  }
}

// JQ expressions to benchmark - only including supported operations
export const TEST_EXPRESSIONS = {
  // Simple expressions
  simple: '.name',
  multiProperty: '.name, .age',

  // Array expressions
  arrayAll: '.[].name',
  arrayIndex: '.[2]',
  arraySlice: '.[1:3]',

  // Nested access
  nested: '.user.personal.name',
  deepNested: '.[] | .level1.level2.level3.level4.level5.level6.level7.level8.value',
  arrayNested: '.posts[].comments[].author',

  // Transformations
  objectConstruction: '.user | {name: .personal.name, email: .personal.contact.email}',
  arrayConstruction: '.posts[] | [.id, .title]',

  // Complex operations
  complex: '.posts[].comments[] | {author: .author, text: .text, likes: .likes}',

  // Simple math operation
  math: '.products[] | .price + 1'
}

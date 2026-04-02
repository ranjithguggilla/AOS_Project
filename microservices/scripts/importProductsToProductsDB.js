import mongoose from 'mongoose'
import dotenv from 'dotenv'
import products from '../../backend/data/products.js'

dotenv.config()

const importProducts = async () => {
  const mongoUri = process.env.PRODUCT_DB_URI
  const dbName = 'products'

  if (!mongoUri) {
    throw new Error('Missing PRODUCT_DB_URI in .env')
  }

  await mongoose.connect(mongoUri, {
    dbName,
    useNewUrlParser: true,
    useUnifiedTopology: true
  })

  const normalizedProducts = products.map((product) => ({
    name: product.name,
    description: product.description,
    category: Array.isArray(product.category) ? product.category : [product.category || 'General'],
    sizes: Array.isArray(product.sizes) ? product.sizes : [],
    price: product.price ?? 0,
    countInStock: product.countInStock ?? 0,
    images: Array.isArray(product.images) ? product.images : [],
    rating: product.rating ?? 0,
    numReviews: product.numReviews ?? 0,
    reviews: []
  }))

  const collection = mongoose.connection.db.collection('products')
  await collection.deleteMany({})
  await collection.insertMany(normalizedProducts)

  console.log(`Imported ${normalizedProducts.length} products into ${dbName}.products`)
  await mongoose.connection.close()
}

importProducts().catch(async (error) => {
  console.error(error)
  await mongoose.connection.close()
  process.exit(1)
})

import mongoose from 'mongoose'

const connectDB = async (mongoUri, dbName) => {
  if (!mongoUri) {
    throw new Error(`Missing Mongo URI for ${dbName}`)
  }

  const conn = await mongoose.connect(mongoUri, { dbName })
  const actualDbName = conn.connection.name
  if (actualDbName !== dbName) {
    throw new Error(`Connected to unexpected DB. expected=${dbName}, actual=${actualDbName}`)
  }

  console.log(`[${dbName}] MongoDB connected: ${conn.connection.host}`)
}

export default connectDB

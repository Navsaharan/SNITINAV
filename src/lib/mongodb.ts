import mongoose from 'mongoose'

// MongoDB connection configuration
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/snpitc'

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local')
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

async function connectMongoDB() {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    }

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose
    })
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    throw e
  }

  return cached.conn
}

export default connectMongoDB

// MongoDB Schema Definitions for Future Migration

// User Schema
export const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['ADMIN', 'STUDENT'], required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

// Email Account Schema
export const EmailAccountSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  type: { type: String, enum: ['STUDENT', 'ADMIN'], required: true },
  isActive: { type: Boolean, default: true },
  quota: { type: Number, default: 1073741824 }, // 1GB in bytes
  usedQuota: { type: Number, default: 0 },
  profile: {
    firstName: String,
    lastName: String,
    displayName: String,
    department: String,
    studentId: String
  },
  settings: {
    signature: String,
    autoReply: { type: Boolean, default: false },
    autoReplyMessage: String,
    forwardingEmail: String
  },
  security: {
    lastLogin: Date,
    loginAttempts: { type: Number, default: 0 },
    lockedUntil: Date
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

// Email Schema
export const EmailSchema = new mongoose.Schema({
  messageId: { type: String, required: true, unique: true },
  fromAccountId: { type: mongoose.Schema.Types.ObjectId, ref: 'EmailAccount', required: true },
  subject: { type: String, required: true },
  body: { type: String, required: true },
  bodyText: String,
  recipients: [{
    email: { type: String, required: true },
    name: String,
    type: { type: String, enum: ['TO', 'CC', 'BCC'], required: true }
  }],
  attachments: [{
    filename: String,
    size: Number,
    mimeType: String,
    path: String
  }],
  folders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'EmailFolder' }],
  status: { 
    type: String, 
    enum: ['DRAFT', 'SENT', 'DELIVERED', 'BOUNCED', 'FAILED'], 
    default: 'DRAFT' 
  },
  priority: { type: String, enum: ['LOW', 'NORMAL', 'HIGH'], default: 'NORMAL' },
  isRead: { type: Boolean, default: false },
  isStarred: { type: Boolean, default: false },
  sentAt: Date,
  deliveredAt: Date,
  readAt: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

// Email Folder Schema
export const EmailFolderSchema = new mongoose.Schema({
  accountId: { type: mongoose.Schema.Types.ObjectId, ref: 'EmailAccount', required: true },
  name: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['INBOX', 'SENT', 'DRAFTS', 'TRASH', 'SPAM', 'CUSTOM'], 
    required: true 
  },
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'EmailFolder' },
  isSystem: { type: Boolean, default: false },
  emailCount: { type: Number, default: 0 },
  unreadCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

// Payment Catalog Item Schema
export const PaymentCatalogItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  feeType: { 
    type: String, 
    enum: ['ADMISSION', 'SEMESTER', 'EXAM', 'LIBRARY', 'HOSTEL', 'TRANSPORT', 'OTHER'], 
    required: true 
  },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  category: String,
  subcategory: String,
  isActive: { type: Boolean, default: true },
  isRecurring: { type: Boolean, default: false },
  recurringInterval: String,
  lateFee: { type: Number, default: 0 },
  discountPercentage: { type: Number, default: 0 },
  dueDate: Date,
  applicableFor: { type: String, default: 'STUDENT' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  deletedAt: Date
})

// Payment Schema
export const PaymentSchema = new mongoose.Schema({
  transactionId: { type: String, required: true, unique: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  catalogItem: {
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'PaymentCatalogItem' },
    name: String,
    feeType: String,
    amount: Number
  },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  feeType: String,
  description: String,
  gateway: String,
  gatewayTxnId: String,
  gatewayResponse: mongoose.Schema.Types.Mixed,
  additionalFee: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['PENDING', 'SUCCESS', 'FAILED', 'CANCELLED'], 
    default: 'PENDING' 
  },
  failureReason: String,
  receiptNumber: String,
  receiptUrl: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  completedAt: Date
})

// Settings Schema
export const SettingsSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: String, required: true },
  type: { type: String, enum: ['STRING', 'NUMBER', 'BOOLEAN', 'JSON'], default: 'STRING' },
  description: String,
  category: String,
  isPublic: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

// Create Models (for future use)
export const MongoUser = mongoose.models.User || mongoose.model('User', UserSchema)
export const MongoEmailAccount = mongoose.models.EmailAccount || mongoose.model('EmailAccount', EmailAccountSchema)
export const MongoEmail = mongoose.models.Email || mongoose.model('Email', EmailSchema)
export const MongoEmailFolder = mongoose.models.EmailFolder || mongoose.model('EmailFolder', EmailFolderSchema)
export const MongoPaymentCatalogItem = mongoose.models.PaymentCatalogItem || mongoose.model('PaymentCatalogItem', PaymentCatalogItemSchema)
export const MongoPayment = mongoose.models.Payment || mongoose.model('Payment', PaymentSchema)
export const MongoSettings = mongoose.models.Settings || mongoose.model('Settings', SettingsSchema)

// Migration utilities
export class MigrationService {
  static async exportSQLiteData() {
    // This will be implemented when migration is needed
    console.log('SQLite data export not implemented yet')
  }

  static async importToMongoDB(data: any) {
    // This will be implemented when migration is needed
    console.log('MongoDB data import not implemented yet')
  }

  static async validateDataConsistency() {
    // This will be implemented when migration is needed
    console.log('Data consistency validation not implemented yet')
  }
}

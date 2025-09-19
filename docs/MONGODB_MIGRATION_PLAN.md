# MongoDB Migration Plan for SNPITC System

## 🎯 **Migration Overview**

**Current State**: Prisma ORM + SQLite Database  
**Target State**: Mongoose ODM + MongoDB Database  
**Migration Type**: Phased migration with zero downtime  

## 📊 **Current Database Analysis**

### **Tables to Migrate**
1. **Users** (Admin/Student accounts)
2. **EmailAccounts** (Student email accounts)
3. **Emails** (Email messages)
4. **EmailRecipients** (Email recipients)
5. **EmailFolders** (Email organization)
6. **EmailAttachments** (File attachments)
7. **PaymentCatalogItems** (Fee catalog)
8. **Payments** (Payment transactions)
9. **PaymentGatewayConfigs** (Gateway settings)
10. **Settings** (System configuration)

### **Relationship Mapping**
- **One-to-Many**: User → EmailAccounts, Email → EmailRecipients
- **Many-to-Many**: Email ↔ EmailFolders (via junction table)
- **Foreign Keys**: All relationships need to be converted to MongoDB references

## 🔄 **Migration Strategy: Dual Database Approach**

### **Phase 1: Setup MongoDB Infrastructure**
1. Install MongoDB and Mongoose
2. Create MongoDB schemas equivalent to Prisma models
3. Set up connection and configuration
4. Create data migration scripts

### **Phase 2: Parallel Operation**
1. Write to both SQLite and MongoDB
2. Read from SQLite (primary)
3. Validate data consistency
4. Monitor performance

### **Phase 3: Gradual Switchover**
1. Switch read operations to MongoDB
2. Continue dual writes
3. Validate all functionality
4. Performance testing

### **Phase 4: Complete Migration**
1. Switch to MongoDB-only operations
2. Remove Prisma dependencies
3. Clean up SQLite database
4. Update all API endpoints

## 🛠️ **Technical Implementation**

### **MongoDB Schema Design**

#### **Users Collection**
```javascript
{
  _id: ObjectId,
  email: String,
  name: String,
  password: String, // bcrypt hashed
  role: String, // ADMIN, STUDENT
  createdAt: Date,
  updatedAt: Date
}
```

#### **EmailAccounts Collection**
```javascript
{
  _id: ObjectId,
  userId: ObjectId, // Reference to Users
  email: String,
  password: String,
  type: String, // STUDENT, ADMIN
  isActive: Boolean,
  quota: Number,
  usedQuota: Number,
  profile: {
    firstName: String,
    lastName: String,
    displayName: String,
    department: String,
    studentId: String
  },
  settings: {
    signature: String,
    autoReply: Boolean,
    autoReplyMessage: String,
    forwardingEmail: String
  },
  security: {
    lastLogin: Date,
    loginAttempts: Number,
    lockedUntil: Date
  },
  createdAt: Date,
  updatedAt: Date
}
```

#### **Emails Collection**
```javascript
{
  _id: ObjectId,
  messageId: String,
  fromAccountId: ObjectId, // Reference to EmailAccounts
  subject: String,
  body: String,
  bodyText: String,
  recipients: [{
    email: String,
    name: String,
    type: String // TO, CC, BCC
  }],
  attachments: [{
    filename: String,
    size: Number,
    mimeType: String,
    path: String
  }],
  folders: [ObjectId], // References to EmailFolders
  status: String, // DRAFT, SENT, DELIVERED, etc.
  priority: String,
  isRead: Boolean,
  isStarred: Boolean,
  sentAt: Date,
  deliveredAt: Date,
  readAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

#### **Payments Collection**
```javascript
{
  _id: ObjectId,
  transactionId: String,
  studentId: ObjectId, // Reference to Users
  catalogItem: {
    id: ObjectId,
    name: String,
    feeType: String,
    amount: Number
  },
  amount: Number,
  currency: String,
  gateway: String,
  gatewayTxnId: String,
  gatewayResponse: Object,
  status: String,
  receiptNumber: String,
  receiptUrl: String,
  createdAt: Date,
  completedAt: Date
}
```

### **Migration Scripts**

#### **Data Export from SQLite**
```javascript
// Export all data from SQLite to JSON
const exportData = async () => {
  const users = await prisma.user.findMany()
  const emailAccounts = await prisma.emailAccount.findMany()
  const emails = await prisma.email.findMany({
    include: {
      recipients: true,
      attachments: true,
      folders: true
    }
  })
  const payments = await prisma.payment.findMany()
  
  return { users, emailAccounts, emails, payments }
}
```

#### **Data Import to MongoDB**
```javascript
// Import data to MongoDB with relationship mapping
const importData = async (data) => {
  // Create ID mapping for relationships
  const userIdMap = new Map()
  const emailAccountIdMap = new Map()
  
  // Import users first
  for (const user of data.users) {
    const mongoUser = await User.create({
      email: user.email,
      name: user.name,
      password: user.password,
      role: user.role,
      createdAt: user.createdAt
    })
    userIdMap.set(user.id, mongoUser._id)
  }
  
  // Import email accounts with user references
  for (const account of data.emailAccounts) {
    const mongoAccount = await EmailAccount.create({
      userId: userIdMap.get(account.createdById),
      email: account.email,
      // ... other fields
    })
    emailAccountIdMap.set(account.id, mongoAccount._id)
  }
  
  // Continue with other collections...
}
```

## 🔧 **Implementation Steps**

### **Step 1: Install Dependencies**
```bash
npm install mongoose
npm install @types/mongoose
```

### **Step 2: Create MongoDB Schemas**
- Create `src/models/` directory
- Define Mongoose schemas for all collections
- Set up connection configuration

### **Step 3: Create Migration Service**
- Data export utilities
- Data transformation logic
- Import validation
- Rollback capabilities

### **Step 4: Update API Layer**
- Create MongoDB service layer
- Implement dual-write functionality
- Add data consistency checks
- Update error handling

### **Step 5: Testing & Validation**
- Unit tests for MongoDB operations
- Integration tests for API endpoints
- Performance benchmarking
- Data integrity validation

## ⚠️ **Risk Assessment**

### **High Risk Areas**
1. **Data Loss**: Complex relationships during migration
2. **Downtime**: Service interruption during switchover
3. **Performance**: MongoDB query optimization
4. **Consistency**: Dual-write synchronization

### **Mitigation Strategies**
1. **Comprehensive Backups**: Full SQLite backup before migration
2. **Gradual Migration**: Phase-by-phase approach
3. **Rollback Plan**: Ability to revert to SQLite
4. **Monitoring**: Real-time data consistency checks

## 📈 **Benefits of MongoDB Migration**

### **Scalability**
- Horizontal scaling capabilities
- Better handling of large datasets
- Improved performance for complex queries

### **Flexibility**
- Schema-less design for evolving requirements
- Better handling of nested data structures
- Easier integration with modern applications

### **Features**
- Built-in aggregation framework
- Full-text search capabilities
- Geospatial queries support

## 🎯 **Recommendation**

Given that the current SQLite/Prisma system is working perfectly:

1. **Immediate Priority**: Keep current system operational
2. **Future Planning**: Prepare MongoDB migration for when scaling is needed
3. **Gradual Approach**: Implement dual-database support first
4. **Testing**: Extensive testing before full migration

The current system handles the requirements well, so MongoDB migration should be considered when:
- User base grows significantly (>10,000 users)
- Complex reporting requirements emerge
- Real-time analytics are needed
- Horizontal scaling becomes necessary

## 📋 **Next Steps**

1. **Phase 1**: Set up MongoDB development environment
2. **Phase 2**: Create Mongoose schemas
3. **Phase 3**: Implement dual-write system
4. **Phase 4**: Gradual migration with validation
5. **Phase 5**: Complete switchover and cleanup

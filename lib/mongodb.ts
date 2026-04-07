import { MongoClient, Db, Collection, ObjectId } from 'mongodb';

// MongoDB connection string - set via environment variable
const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB || 'transaction_dashboard';

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;
let useMockData = !MONGODB_URI;

export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db } | null> {
  if (!MONGODB_URI) {
    return null;
  }

  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  try {
    const client = await MongoClient.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    const db = client.db(MONGODB_DB);

    cachedClient = client;
    cachedDb = db;

    return { client, db };
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    useMockData = true;
    return null;
  }
}

export interface TransactionDocument {
  _id?: ObjectId | string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: string;
  created_at: Date;
  updated_at?: Date;
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: string;
  created_at: string;
  updated_at: string;
}

// In-memory mock data store
const now = new Date();
let mockTransactions: TransactionDocument[] = [
  {
    _id: '1',
    type: 'income',
    amount: 5000,
    category: 'Salary',
    description: 'Monthly Salary',
    date: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    created_at: now,
  },
  {
    _id: '2',
    type: 'expense',
    amount: 150,
    category: 'Food & Dining',
    description: 'Weekly Groceries',
    date: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    created_at: now,
  },
  {
    _id: '3',
    type: 'expense',
    amount: 75,
    category: 'Transportation',
    description: 'Gas for car',
    date: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    created_at: now,
  },
  {
    _id: '4',
    type: 'expense',
    amount: 200,
    category: 'Utilities',
    description: 'Electric bill',
    date: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    created_at: now,
  },
  {
    _id: '5',
    type: 'income',
    amount: 500,
    category: 'Freelance',
    description: 'Freelance project',
    date: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    created_at: now,
  },
  {
    _id: '6',
    type: 'expense',
    amount: 50,
    category: 'Entertainment',
    description: 'Movie tickets',
    date: now.toISOString().split('T')[0],
    created_at: now,
  },
  {
    _id: '7',
    type: 'expense',
    amount: 120,
    category: 'Shopping',
    description: 'New headphones',
    date: now.toISOString().split('T')[0],
    created_at: now,
  },
  {
    _id: '8',
    type: 'expense',
    amount: 85,
    category: 'Food & Dining',
    description: 'Restaurant dinner',
    date: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    created_at: now,
  },
  {
    _id: '9',
    type: 'income',
    amount: 250,
    category: 'Investment',
    description: 'Dividend payment',
    date: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    created_at: now,
  },
  {
    _id: '10',
    type: 'expense',
    amount: 300,
    category: 'Healthcare',
    description: 'Doctor visit',
    date: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    created_at: now,
  },
];

let mockIdCounter = 11;

// Helper to convert MongoDB _id to string id
export function toTransaction(doc: TransactionDocument): Transaction {
  return {
    id: doc._id?.toString() || '',
    type: doc.type,
    amount: doc.amount,
    category: doc.category,
    description: doc.description,
    date: doc.date,
    created_at: doc.created_at?.toISOString?.() || doc.created_at?.toString() || new Date().toISOString(),
    updated_at: doc.updated_at?.toISOString?.() || doc.created_at?.toISOString?.() || doc.created_at?.toString() || new Date().toISOString(),
  };
}

// Mock collection interface that mimics MongoDB Collection
class MockCollection {
  find(query: Record<string, unknown> = {}) {
    let results = [...mockTransactions];
    
    if (query.type) {
      results = results.filter(t => t.type === query.type);
    }
    
    if (query.category) {
      results = results.filter(t => t.category === query.category);
    }
    
    // Handle regex search for description
    if (query.description && typeof query.description === 'object') {
      const descQuery = query.description as { $regex?: string; $options?: string };
      if (descQuery.$regex) {
        const regex = new RegExp(descQuery.$regex, descQuery.$options || '');
        results = results.filter(t => regex.test(t.description));
      }
    }
    
    return {
      sort: (sortQuery: Record<string, number>) => {
        const key = Object.keys(sortQuery)[0] as keyof TransactionDocument;
        const direction = sortQuery[key];
        results.sort((a, b) => {
          const aVal = a[key];
          const bVal = b[key];
          if (typeof aVal === 'string' && typeof bVal === 'string') {
            return direction * aVal.localeCompare(bVal);
          }
          return 0;
        });
        return {
          limit: (n: number) => ({
            toArray: async () => results.slice(0, n)
          }),
          toArray: async () => results
        };
      },
      limit: (n: number) => ({
        toArray: async () => results.slice(0, n)
      }),
      toArray: async () => results
    };
  }

  async findOne(query: { _id: string | ObjectId }) {
    const id = query._id.toString();
    return mockTransactions.find(t => t._id?.toString() === id) || null;
  }

  async insertOne(doc: Omit<TransactionDocument, '_id'>) {
    const newDoc = { ...doc, _id: String(mockIdCounter++) };
    mockTransactions.push(newDoc as TransactionDocument);
    return { insertedId: newDoc._id };
  }

  async updateOne(
    query: { _id: string | ObjectId },
    update: { $set: Partial<TransactionDocument> }
  ) {
    const id = query._id.toString();
    const index = mockTransactions.findIndex(t => t._id?.toString() === id);
    if (index !== -1) {
      mockTransactions[index] = { ...mockTransactions[index], ...update.$set };
      return { modifiedCount: 1 };
    }
    return { modifiedCount: 0 };
  }

  async deleteOne(query: { _id: string | ObjectId }) {
    const id = query._id.toString();
    const index = mockTransactions.findIndex(t => t._id?.toString() === id);
    if (index !== -1) {
      mockTransactions.splice(index, 1);
      return { deletedCount: 1 };
    }
    return { deletedCount: 0 };
  }

  async countDocuments() {
    return mockTransactions.length;
  }

  aggregate(pipeline: Array<Record<string, unknown>>) {
    let results: TransactionDocument[] = [...mockTransactions];
    
    for (const stage of pipeline) {
      if (stage.$match) {
        const match = stage.$match as Record<string, unknown>;
        results = results.filter(t => {
          for (const [key, value] of Object.entries(match)) {
            if (t[key as keyof TransactionDocument] !== value) return false;
          }
          return true;
        });
      }
      
      if (stage.$group) {
        const group = stage.$group as Record<string, unknown>;
        const groupKey = group._id as string;
        const grouped: Record<string, { _id: string; total: number }> = {};
        
        for (const item of results) {
          const key = groupKey === null ? 'all' : (item[groupKey.replace('$', '') as keyof TransactionDocument] as string);
          if (!grouped[key]) {
            grouped[key] = { _id: key, total: 0 };
          }
          if (group.total && typeof group.total === 'object' && '$sum' in group.total) {
            const sumField = (group.total as { $sum: string }).$sum.replace('$', '') as keyof TransactionDocument;
            grouped[key].total += item[sumField] as number;
          }
        }
        
        return {
          sort: () => ({
            toArray: async () => Object.values(grouped).sort((a, b) => b.total - a.total)
          }),
          toArray: async () => Object.values(grouped)
        };
      }
    }
    
    return {
      sort: () => ({
        toArray: async () => results
      }),
      toArray: async () => results
    };
  }
}

const mockCollection = new MockCollection();

export async function getTransactionsCollection(): Promise<Collection<TransactionDocument> | MockCollection> {
  const connection = await connectToDatabase();
  
  if (!connection || useMockData) {
    return mockCollection as unknown as Collection<TransactionDocument>;
  }
  
  return connection.db.collection<TransactionDocument>('transactions');
}

// Seed initial data if collection is empty (only for real MongoDB)
export async function seedInitialData(): Promise<void> {
  if (useMockData || !MONGODB_URI) {
    return; // Mock data already has initial data
  }
  
  try {
    const collection = await getTransactionsCollection() as Collection<TransactionDocument>;
    const count = await collection.countDocuments();
    
    if (count === 0) {
      await collection.insertMany(mockTransactions.map(({ _id, ...rest }) => rest) as TransactionDocument[]);
    }
  } catch (error) {
    console.error('Error seeding data:', error);
  }
}

export function isUsingMockData(): boolean {
  return useMockData || !MONGODB_URI;
}

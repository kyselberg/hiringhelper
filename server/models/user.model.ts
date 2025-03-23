import bcrypt from 'bcryptjs';
import { Collection, ObjectId } from 'mongodb';
import { connectDB } from '../utils/mongodb';

export interface IUser {
  _id?: ObjectId;
  email: string;
  password: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export class UserModel {
  private static collection: Collection<IUser> | null = null;

  private static async getCollection(): Promise<Collection<IUser>> {
    if (!this.collection) {
      const db = await connectDB();
      this.collection = db.collection<IUser>('users');

      // Create indexes
      await this.collection.createIndex({ email: 1 }, { unique: true });
    }
    return this.collection;
  }

  static async create(userData: Omit<IUser, '_id' | 'createdAt' | 'updatedAt'>): Promise<IUser> {
    const collection = await this.getCollection();

    // Validate email format
    if (!/^\S+@\S+\.\S+$/.test(userData.email)) {
      throw new Error('Invalid email format');
    }

    // Validate password length
    if (userData.password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    // Validate name length
    if (userData.name.length < 2 || userData.name.length > 50) {
      throw new Error('Name must be between 2 and 50 characters');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    const now = new Date();
    const user: IUser = {
      ...userData,
      password: hashedPassword,
      createdAt: now,
      updatedAt: now,
    };

    try {
      const result = await collection.insertOne(user);
      return { ...user, _id: result.insertedId };
    } catch (error) {
      if ((error as any).code === 11000) {
        throw new Error('Email already exists');
      }
      throw error;
    }
  }

  static async findByEmail(email: string): Promise<IUser | null> {
    const collection = await this.getCollection();
    return collection.findOne({ email });
  }

  static async findById(id: string): Promise<IUser | null> {
    const collection = await this.getCollection();
    return collection.findOne({ _id: new ObjectId(id) });
  }

  static async update(id: string, updateData: Partial<Omit<IUser, '_id' | 'createdAt' | 'updatedAt'>>): Promise<IUser | null> {
    const collection = await this.getCollection();

    if (updateData.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(updateData.password, salt);
    }

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...updateData,
          updatedAt: new Date()
        }
      },
      { returnDocument: 'after' }
    );

    return result;
  }

  static async delete(id: string): Promise<boolean> {
    const collection = await this.getCollection();
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount === 1;
  }

  static async comparePassword(user: IUser, candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, user.password);
  }
}
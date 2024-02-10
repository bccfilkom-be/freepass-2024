import mongoose from 'mongoose'
import type { UserDocument } from '../types/user.type'

const userSchema = new mongoose.Schema<UserDocument>(
  {
    fullName: {
      type: String,
      required: true,
      trim: true
    },
    nim: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    faculty: {
      type: String,
      required: true,
      trim: true
    },
    major: {
      type: String,
      required: true,
      trim: true
    },
    username: {
      type: String,
      required: true,
      trim: true,
      unique: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: 8
    },
    role: {
      type: String,
      default: 'user'
    },
    commentedPosts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
      }
    ],
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
      }
    ]
  },
  {
    timestamps: true
  }
)

userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
    delete returnedObject.password
  }
})

/**
 * @typedef User
 */
export const User = mongoose.model('User', userSchema)

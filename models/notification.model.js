import mongoose from "mongoose";
const Schema = mongoose.Schema;

// Define the notification schema
const notificationSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  type: {
    type: String,
    enum: ['auth', 'telegram', 'yudo'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  read: {
    type: Boolean,
    default: false
  }
});

export const Notification = mongoose.model('Notification', notificationSchema);
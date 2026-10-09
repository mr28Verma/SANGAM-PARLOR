import mongoose, { Schema } from "mongoose";

export const appointmentServices = ["Hair", "Skin", "Makeup", "Bridal"] as const;

const appointmentSchema = new Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
  phone: { type: String, required: true, match: /^[6-9]\d{9}$/ },
  email: { type: String, trim: true, lowercase: true, maxlength: 254, default: "" },
  service: { type: String, required: true, enum: appointmentServices },
  // Calendar date is stored as YYYY-MM-DD rather than a midnight Date to avoid timezone shifts.
  date: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
  time: { type: String, required: true, enum: ["10:00 AM", "12:00 PM", "2:00 PM", "4:00 PM", "6:00 PM"] },
  price: { type: Number, default: null, min: 0 },
  status: { type: String, enum: ["pending", "confirmed", "completed", "cancelled"], default: "pending", required: true },
  specialRequests: { type: String, trim: true, maxlength: 1000, default: "" },
}, { timestamps: true });

// Active requests reserve a slot; cancellation releases it. The unique index makes this atomic.
appointmentSchema.index({ date: 1, time: 1 }, { unique: true, name: "active_booking_slot_unique", partialFilterExpression: { status: { $in: ["pending", "confirmed"] } } });
appointmentSchema.index({ status: 1, date: 1 });

export const Appointment = mongoose.models.Appointment || mongoose.model("Appointment", appointmentSchema);

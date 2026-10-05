import mongoose from 'mongoose';

const skillSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Skill name is required'],
      unique: true,
      trim: true,
      maxlength: [60, 'Skill name cannot exceed 60 characters'],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Frontend',
        'Backend',
        'Database',
        'Mobile',
        'AI/ML',
        'DevOps/Cloud',
        'Cybersecurity',
        'Core CS',
        'UI/UX',
        'Other',
      ],
      index: true,
    },
    description: {
      type: String,
      default: '',
      maxlength: [300, 'Description cannot exceed 300 characters'],
    },
    icon: {
      type: String,
      default: 'Code2',
    },
    isApproved: {
      type: Boolean,
      default: true,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Slug generation hook
skillSchema.pre('validate', function (next) {
  if (this.name && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  next();
});

export const Skill = mongoose.model('Skill', skillSchema);

import mongoose from "mongoose";

const speechSchema = new mongoose.Schema({
  date: { type: String },
  value: { type: String  },
  link: { type: String  },
  pdf: { type: String  },
});

const Speech = mongoose.model("Speech", speechSchema);

export default Speech;

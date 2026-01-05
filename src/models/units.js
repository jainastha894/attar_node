import mongoose from "mongoose";

const unitsSchema = new mongoose.Schema(
  {
    industryList: {
      type: [String],
      default: []
    },
    subCategoryList: {
      type: [String],
      default: []
    },
    sizeList: {
      type: [String],
      default: []
    },
    colorList: {
      type: [String],
      default: []
    },
    shapeList: {
      type: [String],
      default: []
    },
    neckTypeList: {
      type: [String],
      default: []
    },
    materialList: {
      type: [String],
      default: []
    },
    fragranceList: {
      type: [String],
      default: []
    },
    jarBottleList: {
      type: [String],
      default: []
    }
  },
  { timestamps: true }
);

// Ensure only one document exists
unitsSchema.statics.getUnits = async function() {
  let units = await this.findOne();
  if (!units) {
    units = new this({});
    await units.save();
  }
  return units;
};

export default mongoose.model("Units", unitsSchema);


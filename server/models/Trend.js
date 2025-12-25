import mongoose from 'mongoose'

const trendSchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
            unique: true,
        },
        noOfPurchase: {
            type: Number,
            default: 0,
        },
        noOfViews: {
            type: Number,
            default: 0,
        },
    }
)

const Trend = mongoose.model("Trend", trendSchema)
export default Trend;
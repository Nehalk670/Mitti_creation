import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a product name'],
        trim: true,
        unique: true,
        maxLength: [100, 'Product name cannot exceed 100 characters']
    },
    price: {
        type: Number,
        required: [true, 'Please provide a price'],
        min: [0, 'Price cannot be negative']
    },
    image: {
        type: String,
        required: [true, 'Please provide an image URL'],
        match: [
            /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i,
            'Please provide a valid image URL'
        ]
    },
    description: {
        type: String,
        required: [true, 'Please provide a description'],
        trim: true,
        maxLength: [500, 'Description cannot exceed 500 characters']
    },
    stock: {
        type: Number,
        required: [true, 'Please provide stock quantity'],
        min: [0, 'Stock cannot be negative'],
        default: 0
    },
    tagline: {
        type: String,
        trim: true,
        maxLength: [100, 'Tagline cannot exceed 100 characters']
    },
    category: {
        type: String,
        default: 'general',
        trim: true
    }
}, {
    timestamps: true
});

// Create initial products
productSchema.statics.createInitialProducts = async function () {
    const count = await this.countDocuments();

    if (count === 0) {
        const initialProducts = [
            {
                name: 'Golden Diya',
                tagline: 'Handcrafted brass elegance',
                price: 499,
                image: 'https://images.pexels.com/photos/3408354/pexels-photo-3408354.jpeg?auto=compress&cs=tinysrgb&w=800',
                description: 'Traditional brass diya with intricate patterns, perfect for your festive celebrations.',
                stock: 100,
                category: 'diyas'
            },
            {
                name: 'Ceramic Lantern',
                tagline: 'Modern minimalist design',
                price: 899,
                image: 'https://images.pexels.com/photos/6517632/pexels-photo-6517632.jpeg?auto=compress&cs=tinysrgb&w=800',
                description: 'Contemporary ceramic lantern that blends tradition with modern aesthetics.',
                stock: 100,
                category: 'lanterns'
            },
            {
                name: 'Crystal Candle Set',
                tagline: 'Luxury in light',
                price: 1299,
                image: 'https://images.pexels.com/photos/1652109/pexels-photo-1652109.jpeg?auto=compress&cs=tinysrgb&w=800',
                description: 'Premium crystal candle holders that create mesmerizing light patterns.',
                stock: 100,
                category: 'candles'
            },
            {
                name: 'Floating Diyas',
                tagline: 'Grace on water',
                price: 699,
                image: 'https://images.pexels.com/photos/1267699/pexels-photo-1267699.jpeg?auto=compress&cs=tinysrgb&w=800',
                description: 'Set of floating diyas for a serene and spiritual ambiance.',
                stock: 100,
                category: 'diyas'
            },
            {
                name: 'Hanging Lanterns',
                tagline: 'Illuminate from above',
                price: 1499,
                image: 'https://images.pexels.com/photos/949587/pexels-photo-949587.jpeg?auto=compress&cs=tinysrgb&w=800',
                description: 'Decorative hanging lanterns with intricate metalwork and warm glow.',
                stock: 100,
                category: 'lanterns'
            },
            {
                name: 'Silver Diya Collection',
                tagline: 'Timeless tradition',
                price: 799,
                image: 'https://images.pexels.com/photos/1723637/pexels-photo-1723637.jpeg?auto=compress&cs=tinysrgb&w=800',
                description: 'Set of silver-plated diyas for an elegant festive display.',
                stock: 100,
                category: 'diyas'
            },
            {
                name: 'Lotus Candle Holder',
                tagline: 'Symbol of purity',
                price: 599,
                image: 'https://images.pexels.com/photos/3408344/pexels-photo-3408344.jpeg?auto=compress&cs=tinysrgb&w=800',
                description: 'Lotus-shaped candle holder representing spiritual enlightenment.',
                stock: 100,
                category: 'candles'
            },
            {
                name: 'Copper Lantern Set',
                tagline: 'Warm metallic charm',
                price: 1099,
                image: 'https://images.pexels.com/photos/1303081/pexels-photo-1303081.jpeg?auto=compress&cs=tinysrgb&w=800',
                description: 'Artisan copper lanterns with traditional craftsmanship.',
                stock: 100,
                category: 'lanterns'
            }
        ];

        await this.insertMany(initialProducts);
        console.log('✅ Initial products created');
    }
};

export default mongoose.model('Product', productSchema);

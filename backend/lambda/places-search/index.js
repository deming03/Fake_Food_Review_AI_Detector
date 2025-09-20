const AWS = require('aws-sdk');
const axios = require('axios');

// Google Places API configuration
const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY || 'YOUR_API_KEY_HERE';
const PLACES_API_BASE = 'https://maps.googleapis.com/maps/api/place';

// DynamoDB configuration
const dynamodb = new AWS.DynamoDB.DocumentClient();
const RESTAURANTS_TABLE = process.env.RESTAURANTS_TABLE || 'fake-food-detector-restaurants';

/**
 * Lambda function for Google Places restaurant search
 */
exports.handler = async (event) => {
    console.log('Received event:', JSON.stringify(event, null, 2));
    
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
    };
    
    try {
        // Handle CORS preflight requests
        if (event.httpMethod === 'OPTIONS') {
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ message: 'CORS preflight successful' })
            };
        }
        
        // Parse request body
        const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
        const { query, location, radius = 5000 } = body;
        
        if (!query) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    success: false,
                    error: 'Search query is required'
                })
            };
        }
        
        console.log(`Searching for restaurants: "${query}" near ${location || 'user location'}`);
        
        // Search for restaurants using Google Places API
        const restaurants = await searchRestaurants(query, location, radius);
        
        // Store results in DynamoDB
        const storedRestaurants = await storeRestaurants(restaurants);
        
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                data: {
                    query,
                    location,
                    results: storedRestaurants,
                    count: storedRestaurants.length
                }
            })
        };
        
    } catch (error) {
        console.error('Error processing request:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                error: 'Internal server error'
            })
        };
    }
};

/**
 * Search for restaurants using Google Places API
 */
async function searchRestaurants(query, location, radius) {
    try {
        // Prepare search parameters
        const searchParams = {
            input: query,
            inputtype: 'textquery',
            fields: 'place_id,name,formatted_address,rating,user_ratings_total,price_level,opening_hours,photos',
            key: GOOGLE_PLACES_API_KEY
        };
        
        // Add location if provided
        if (location) {
            searchParams.locationbias = `circle:${radius}@${location}`;
        }
        
        // Make API request to Google Places
        const response = await axios.get(`${PLACES_API_BASE}/findplacefromtext/json`, {
            params: searchParams
        });
        
        if (response.data.status !== 'OK') {
            console.error('Google Places API error:', response.data.status);
            return [];
        }
        
        const candidates = response.data.candidates || [];
        console.log(`Found ${candidates.length} restaurant candidates`);
        
        // Get detailed information for each restaurant
        const detailedRestaurants = await Promise.all(
            candidates.map(candidate => getRestaurantDetails(candidate.place_id))
        );
        
        return detailedRestaurants.filter(restaurant => restaurant !== null);
        
    } catch (error) {
        console.error('Error searching restaurants:', error);
        return [];
    }
}

/**
 * Get detailed restaurant information
 */
async function getRestaurantDetails(placeId) {
    try {
        const response = await axios.get(`${PLACES_API_BASE}/details/json`, {
            params: {
                place_id: placeId,
                fields: 'place_id,name,formatted_address,rating,user_ratings_total,price_level,opening_hours,photos,website,formatted_phone_number,reviews',
                key: GOOGLE_PLACES_API_KEY
            }
        });
        
        if (response.data.status !== 'OK') {
            console.error('Places Details API error:', response.data.status);
            return null;
        }
        
        const place = response.data.result;
        
        // Format restaurant data
        const restaurant = {
            place_id: place.place_id,
            name: place.name,
            address: place.formatted_address,
            rating: place.rating || 0,
            review_count: place.user_ratings_total || 0,
            price_level: place.price_level || 0,
            phone: place.formatted_phone_number || '',
            website: place.website || '',
            google_maps_url: `https://maps.google.com/place/?q=place_id:${place.place_id}`,
            opening_hours: place.opening_hours ? {
                open_now: place.opening_hours.open_now,
                weekday_text: place.opening_hours.weekday_text || []
            } : null,
            photos: place.photos ? place.photos.slice(0, 3).map(photo => ({
                photo_reference: photo.photo_reference,
                width: photo.width,
                height: photo.height,
                url: `${PLACES_API_BASE}/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${GOOGLE_PLACES_API_KEY}`
            })) : [],
            sample_reviews: place.reviews ? place.reviews.slice(0, 3).map(review => ({
                author: review.author_name,
                rating: review.rating,
                text: review.text,
                time: review.time
            })) : []
        };
        
        return restaurant;
        
    } catch (error) {
        console.error('Error getting restaurant details:', error);
        return null;
    }
}

/**
 * Store restaurant data in DynamoDB
 */
async function storeRestaurants(restaurants) {
    const storedRestaurants = [];
    
    for (const restaurant of restaurants) {
        try {
            const restaurantId = `rest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            
            const item = {
                restaurant_id: restaurantId,
                place_id: restaurant.place_id,
                name: restaurant.name,
                address: restaurant.address,
                rating: restaurant.rating,
                review_count: restaurant.review_count,
                price_level: restaurant.price_level,
                phone: restaurant.phone,
                website: restaurant.website,
                google_maps_url: restaurant.google_maps_url,
                opening_hours: restaurant.opening_hours,
                photos: restaurant.photos,
                sample_reviews: restaurant.sample_reviews,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            
            await dynamodb.put({
                TableName: RESTAURANTS_TABLE,
                Item: item
            }).promise();
            
            storedRestaurants.push({
                id: restaurantId,
                ...restaurant
            });
            
            console.log(`Stored restaurant: ${restaurant.name}`);
            
        } catch (error) {
            console.error('Error storing restaurant:', restaurant.name, error);
        }
    }
    
    return storedRestaurants;
}

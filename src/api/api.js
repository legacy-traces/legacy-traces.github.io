const API_URL = 'https://snowy-snowflake-732e.legacytracesdev.workers.dev/';

// Helper to construct image URL
export const getImageUrl = (imageId) => {
    if (!imageId) return 'https://placehold.co/400x500/000/FFF?text=No+Image';
    if (imageId.startsWith('http')) return imageId;
    return `https://lh3.googleusercontent.com/d/${imageId}`;
};

// Cache to store the API response
let cachedData = null;

// Fetch all data from the API
export const fetchAllData = async () => {
    if (cachedData) return cachedData;
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Failed to fetch data');
        const data = await response.json();
        cachedData = data;
        return data;
    } catch (error) {
        console.error('Error fetching data:', error);
        return { collection: [], category: [], product: [] };
    }
};

export const fetchBanners = async () => {
    const data = await fetchAllData();
    return data.banner || [];
};

export const fetchProducts = async () => {
    const data = await fetchAllData();
    return data.product || [];
};

export const fetchCollections = async () => {
    const data = await fetchAllData();
    return data.collection || [];
};

export const fetchCategories = async () => {
    const data = await fetchAllData();
    return data.category || [];
};

export const fetchProductById = async (id) => {
    const products = await fetchProducts();
    return products.find(p => p.ID === id);
};

// --- Feedback & Ratings API ---

export const fetchAllFeedback = async () => {
    try {
        const response = await fetch(`${API_URL}?type=feedback`);
        if (!response.ok) return [];
        const data = await response.json();
        return data.feedback || [];
    } catch (error) {
        console.error('Error fetching all feedback:', error);
        return [];
    }
};

export const fetchProductFeedback = async (productId) => {
    try {
        const response = await fetch(`${API_URL}?type=feedback&productId=${productId}`);
        if (!response.ok) return [];
        const data = await response.json();
        return data.feedback || [];
    } catch (error) {
        console.error('Error fetching product feedback:', error);
        return [];
    }
};

export const postComment = async (commentData) => {
    try {
        const url = `${API_URL}?type=feedback${commentData.commentParentId ? '&action=reply' : ''}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(commentData)
        });
        return await response.json();
    } catch (error) {
        console.error('Error posting comment:', error);
        throw error;
    }
};

export const interactComment = async (commentId, action) => {
    try {
        const response = await fetch(`${API_URL}?type=feedback&action=${action}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ commentId })
        });
        return await response.json();
    } catch (error) {
        console.error(`Error ${action} comment:`, error);
        throw error;
    }
};

export const fetchProductRating = async (productId) => {
    try {
        const response = await fetch(`${API_URL}?type=rating&productId=${productId}`);
        if (!response.ok) return null;
        return await response.json();
    } catch (error) {
        console.error('Error fetching product rating:', error);
        return null;
    }
};

export const postRating = async (ratingData) => {
    try {
        const response = await fetch(`${API_URL}?type=rating`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(ratingData)
        });
        return await response.json();
    } catch (error) {
        console.error('Error posting rating:', error);
        throw error;
    }
};

export const fetchUserDetails = async (email) => {
    try {
        const response = await fetch(`${API_URL}?type=userDetails&email=${encodeURIComponent(email)}`);
        if (!response.ok) return null;
        const data = await response.json();
        return data.success ? data.customer : null;
    } catch (error) {
        console.error('Error fetching user details:', error);
        return null;
    }
};

export async function saveCustomer(data) {
  try {
    console.log("Sending customer data:", data);

    const response = await fetch(`${API_URL}?type=customer`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    console.log("API response:", result);

    return result;
  } catch (error) {
    console.error("API error:", error);
  }
}

export async function saveOrder(orderData) {
  try {
    console.log("Saving order:", orderData);

    const response = await fetch(`${API_URL}?type=order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(orderData)
    });

    const result = await response.json();

    console.log("Order saved:", result);

    return result;
  } catch (error) {
    console.error("Order API error:", error);
    throw error;
  }
}

export async function fetchAdminOrders(email) {
  try {
    const response = await fetch(`${API_URL}?type=order&email=${encodeURIComponent(email)}`);
    if (!response.ok) return [];
    const data = await response.json();
    return data.orders || data.data || data || [];
  } catch (error) {
    console.error('Error fetching admin orders:', error);
    return [];
  }
}

export async function updateOrderStatus(orderId, status) {
  try {
    const response = await fetch(`${API_URL}?type=order&action=updateStatus`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ orderId, status })
    });
    return await response.json();
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
}


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

// Fetch Banners (Using mock banners for now as API doesn't seem to have banners)
const banners = [
    {
        id: 1,
        image: "https://instagram.fmaa14-1.fna.fbcdn.net/v/t51.82787-15/601460733_17906628507294342_5368365134424290639_n.jpg?stp=dst-jpegr_e35_tt6&_nc_cat=107&ig_cache_key=Mzc5MjI3ODM5NzcxMjgwNzY0MA%3D%3D.3-ccb7-5&ccb=7-5&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6InhwaWRzLjE0NDB4MTkyMC5oZHIuQzMifQ%3D%3D&_nc_ohc=8y4Htvyur8wQ7kNvwEcZU_z&_nc_oc=AdmSNZAygw7uw_g7yZ9WeBUzHRa5e5_HLwIahiGNCcwVofNHCN4Uj_2xcfiqbgzNHHZTl7crhp5h2RTg9h1EReBc&_nc_ad=z-m&_nc_cid=2034&_nc_zt=23&_nc_ht=instagram.fmaa14-1.fna&_nc_gid=ohrRh-cLvQeKleUoRH0lzA&oh=00_AfpHbzvmEKCbJl2n-OeqX8m96lSPj6WZTDVg99Tqo41lZA&oe=69712321",
        alt: "Banner 1"
    },
    {
        id: 2,
        image: "https://instagram.fmaa14-1.fna.fbcdn.net/v/t51.82787-15/515150610_17887569294294342_1300272603318629388_n.webp?_nc_cat=108&ig_cache_key=MzY3MDUxNDYwMDQ3MTk4NDY4NA%3D%3D.3-ccb7-5&ccb=7-5&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6InhwaWRzLjE0NDB4MTkyMC5zZHIuQzMifQ%3D%3D&_nc_ohc=wfvhF4CFsy4Q7kNvwGlte8G&_nc_oc=AdkXyxg13fgBUZKeDyqrus-kewSyOHM3mnT9_4cRvNGf51KLhcihWQBi2QuAwolrFUL2AMX8unGaHtA9Rg-RgsXJ&_nc_ad=z-m&_nc_cid=2034&_nc_zt=23&_nc_ht=instagram.fmaa14-1.fna&_nc_gid=PGFCgL9ovfBPHzsLslxS4A&oh=00_AfqXtlcf_yicRFwv83pclqzVvlRgRb1HfpWp7x2VhAF5ag&oe=69713161",
        alt: "Banner 2"
    },
    {
        id: 3,
        image: "https://instagram.fmaa14-1.fna.fbcdn.net/v/t51.82787-15/511537525_17886426678294342_7745432823701418248_n.webp?stp=dst-webp_p640x640_sh0.08&_nc_cat=111&ig_cache_key=MzY2MzUyMDE4MDk5MjI3NzY2NQ%3D%3D.3-ccb7-5&ccb=7-5&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6InhwaWRzLjE0NDB4MTkyMC5zZHIuQzMifQ%3D%3D&_nc_ohc=83IWrGFqJBIQ7kNvwHfoxht&_nc_oc=AdlpE2b3e2iPwTXGh0eCac5nO_JJdlesdbK47fhAZ0DQyE9h3xW9ThVtkCFvgIeYTFKLQ3hWQVpXRIo7JeYo4Lcd&_nc_ad=z-m&_nc_cid=2034&_nc_zt=23&_nc_ht=instagram.fmaa14-1.fna&_nc_gid=PGFCgL9ovfBPHzsLslxS4A&oh=00_AfoWFen4e5TgGXMS1sEwfy7wl6t8iyJZfWX5X19iAicFdA&oe=69711BA0",
        alt: "Banner 3"
    }
];

export const fetchBanners = () => {
    return new Promise((resolve) => {
        setTimeout(() => resolve(banners), 500);
    });
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

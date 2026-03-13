export const getCategoryIcon = (category: string) => {
    const cat = category.toLowerCase();
    switch (cat) {
        case 'social':
            return 'share-social-outline';
        case 'finance':
            return 'card-outline';
        case 'work':
            return 'briefcase-outline';
        case 'personal':
            return 'person-outline';
        case 'entertainment':
            return 'game-controller-outline';
        default:
            return 'key-outline';
    }
};

const ITEM_COLORS = [
    '#0E5F73', // Deep Teal (Brand)
    '#4338CA', // Indigo
    '#7C3AED', // Vibrant Purple
    '#C2410C', // Dark Orange
    '#065F46', // Dark Emerald
    '#991B1B', // Crimson Red
    '#1E40AF', // Marine Blue
    '#9D174D', // Dark Rose
];

export const getDynamicColor = (id: string) => {
    if (!id) return ITEM_COLORS[0];

    // Simple hash function to get a stable index from string ID
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
        hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }

    const index = Math.abs(hash) % ITEM_COLORS.length;
    return ITEM_COLORS[index];
};

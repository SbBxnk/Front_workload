import { useState } from 'react';

export function useSearchFilter(initialSearch: string, initialLabel: string) {
    const [searchName, setSearchName] = useState(initialSearch);
    const [selectedLabel, setSelectedLabel] = useState(initialLabel);

    const clearSearch = () => setSearchName('');

    const handleSelect = (value: string) => {
        setSelectedLabel(value);
    };

    return {
        searchName,
        setSearchName,
        selectedLabel,
        handleSelect,
        clearSearch,
    };
}

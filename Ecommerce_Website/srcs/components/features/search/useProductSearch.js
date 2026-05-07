import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useDebounce } from './useDebounce';
import { fetchProductsByTitle } from '../../services/apiSearch';
import { fetchAISuggestions } from '../../services/apiSuggest';
import { aiApi } from '../../services/api';

export const useProductSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const debouncedQuery = useDebounce(query, 300);
  const searchRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setQuery('');
    setResults([]);
    setAiSuggestions([]);
  }, [location.pathname]);

  useEffect(() => {
    if (query.trim()) setLoading(true);
  }, [query]);

  useEffect(() => {
    const getData = async () => {
      const isNaturalLanguage = /(?:tìm|mua|giá|dưới|trên|khoảng|chuyên|chống|nhẹ|đẹp|xịn|rẻ|cao|thấp|pin trâu|màn hình|ổ cứng|ssd|hdd|ram|vga|cpu|bàn phím|chuột|tai nghe|laptop|pc|card đồ họa|tản nhiệt|mainboard|nguồn|case)/i.test(debouncedQuery);

      let searchQuery = debouncedQuery;
      let filters = {};

      if (isNaturalLanguage) {
        try {
          const { data } = await aiApi.post('/search/ai-parse', {
            query: debouncedQuery,
          });
          const parsed = data || {};
          if (parsed.extracted_query) searchQuery = parsed.extracted_query;
          filters = {
            category: parsed.category || undefined,
            min_price: parsed.min_price || undefined,
            max_price: parsed.max_price || undefined,
            color: parsed.color || undefined,
            specs: parsed.specs?.length ? parsed.specs : undefined,
          };
        } catch {
          // fallback to raw query
        }
      }

      const [coreResults, aiResults] = await Promise.all([
        fetchProductsByTitle(searchQuery, filters),
        fetchAISuggestions(debouncedQuery, 5),
      ]);
      setResults(coreResults);
      setAiSuggestions(aiResults);
      setLoading(false);
    };

    if (debouncedQuery) getData();
    else {
      setResults([]);
      setAiSuggestions([]);
      setLoading(false);
    }
  }, [debouncedQuery]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setQuery('');
        setResults([]);
        setAiSuggestions([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return {
    query,
    setQuery,
    results,
    aiSuggestions,
    loading,
    searchRef,
  };
};

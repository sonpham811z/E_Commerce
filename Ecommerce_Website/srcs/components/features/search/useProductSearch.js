import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useDebounce } from './useDebounce';
import { fetchProductsByTitle } from '../../services/apiSearch';

export const useProductSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const debouncedQuery = useDebounce(query, 200);
  const searchRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setQuery('');
    setResults([]);
  }, [location.pathname]);

  useEffect(() => {
    if (query.trim()) setLoading(true);
  }, [query]);

  useEffect(() => {
    const getData = async () => {
      const data = await fetchProductsByTitle(debouncedQuery);
      setResults(data);
      setLoading(false);
    };

    if (debouncedQuery) getData();
    else {
      setResults([]);
      setLoading(false);
    }
  }, [debouncedQuery]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setQuery('');
        setResults([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return {
    query,
    setQuery,
    results,
    loading,
    searchRef,
  };
};

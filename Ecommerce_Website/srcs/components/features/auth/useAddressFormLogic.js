import { useForm } from 'react-hook-form';
import { useMutation, useQuery } from '@tanstack/react-query';
import { registerAddressForm } from '@/components/services/apiAddress';
import { fetchProvinces, fetchDistricts, fetchWards } from '@/components/features/orders/apiAddress';
import { useState, useEffect } from 'react';

export function useAddressFormLogic() {
  // Initialize directly with async function to avoid empty dropdowns
  const initializeData = async () => {
    try {
      // Pre-fetch province data immediately
      const provinces = await fetchProvinces();
      setProvinceOptions(provinces);
      
      console.log('Provinces initialized with', provinces.length, 'items');
    } catch (error) {
      console.error('Failed to initialize provinces:', error);
    }
  };

  const [provinceOptions, setProvinceOptions] = useState([]);
  const [districtOptions, setDistrictOptions] = useState([]);
  const [wardOptions, setWardOptions] = useState([]);

  // Call initialization immediately
  useEffect(() => {
    initializeData();
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm({
    defaultValues: {
      fullName: '',
      phone: '',
      gender: 'male',
      city: '',
      district: '',
      ward: '',
      street: '',
      note: '',
      shippingMethod: 'standard',
    },
  });

  // Selected values
  const selectedProvince = watch('city');
  const selectedDistrict = watch('district');

  // Only keep this for refreshing
  const { isLoading: isLoadingProvinces } = useQuery({
    queryKey: ['provinces'],
    queryFn: fetchProvinces,
    onSuccess: (data) => {
      console.log('Provinces data received:', data);
      if (data && data.length > 0) {
        setProvinceOptions(data);
      }
    },
    onError: (error) => {
      console.error('Error fetching provinces:', error);
    }
  });

  // Handle district selection with effect to avoid query issues
  useEffect(() => {
    if (selectedProvince) {
      fetchDistricts(selectedProvince)
        .then(districts => {
          console.log('Districts data received:', districts);
          setDistrictOptions(districts);
          setValue('district', '');
          setValue('ward', '');
        })
        .catch(error => {
          console.error('Error fetching districts:', error);
        });
    } else {
      setDistrictOptions([]);
    }
  }, [selectedProvince, setValue]);

  // Handle ward selection with effect to avoid query issues
  useEffect(() => {
    if (selectedDistrict) {
      fetchWards(selectedDistrict)
        .then(wards => {
          console.log('Wards data received:', wards);
          setWardOptions(wards);
          setValue('ward', '');
        })
        .catch(error => {
          console.error('Error fetching wards:', error);
        });
    } else {
      setWardOptions([]);
    }
  }, [selectedDistrict, setValue]);

  const mutation = useMutation({
    mutationFn: (formData) => registerAddressForm({ addressData: formData }),
    onSuccess: () => alert('Lưu địa chỉ thành công!'),
    onError: (error) => alert(`Lỗi: ${error.message}`),
  });

  const onSubmit = (data) => mutation.mutate(data);

  return {
    register,
    handleSubmit,
    errors,
    watch,
    setValue,
    onSubmit,
    isLoading: mutation.isLoading || isLoadingProvinces,
    isSuccess: mutation.isSuccess,
    provinceOptions,
    districtOptions,
    wardOptions,
  };
}

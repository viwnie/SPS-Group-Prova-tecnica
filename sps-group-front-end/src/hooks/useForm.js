import { useState, useCallback } from 'react';

export function useForm(initialState = {}) {
  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});

  const handleChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [errors]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    handleChange(name, value);
  }, [handleChange]);

  const setFieldError = useCallback((field, message) => {
    setErrors(prev => ({ ...prev, [field]: message }));
  }, []);

  const clearErrors = useCallback(() => setErrors({}), []);

  const resetForm = useCallback(() => {
    setFormData(initialState);
    setErrors({});
  }, [initialState]);

  const setFormDataDirect = useCallback((data) => {
    setFormData(data);
  }, []);

  return {
    formData,
    errors,
    handleChange,
    handleInputChange,
    setFieldError,
    clearErrors,
    resetForm,
    setFormDataDirect
  };
}

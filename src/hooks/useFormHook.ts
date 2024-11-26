import { DefaultValues, useForm, SubmitHandler } from 'react-hook-form';

const useFormHook = <T extends Record<string, unknown>>(defaultValues?: DefaultValues<T>) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<T>({
    defaultValues,
  });

  const onSubmit: SubmitHandler<T> = (data) => {
    console.log('Form Data:', data);
    reset();
  };

  return {
    register,
    handleSubmit,
    errors,
    onSubmit,
    reset,
    setValue,
  };
};

export default useFormHook;

import { DefaultValues, useForm, SubmitHandler } from 'react-hook-form';

const useFormHook = <T extends Record<string, any>>(defaultValues?: DefaultValues<T>) => {
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
    if (data.file && data.file.length > 0) {
      console.log('File uploaded:', data.file[0]);
    }
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

import {
  DefaultValues,
  useForm,
  SubmitHandler,
  Path,
  PathValue,
} from 'react-hook-form';

const useFormHook = <T extends Record<string, unknown>>(
  defaultValues?: DefaultValues<T>
) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<T>({
    defaultValues,
  });

  const onSubmit: SubmitHandler<T> = () => {
    reset();
  };

  const updateField = (field: Path<T>, value: PathValue<T, Path<T>>) => {
    setValue(field, value);
  };

  return {
    register,
    handleSubmit,
    errors,
    onSubmit,
    reset,
    setValue,
    updateField,
    watch,
  };
};

export default useFormHook;

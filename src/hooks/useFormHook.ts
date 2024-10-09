import { useForm, SubmitHandler } from 'react-hook-form';

interface FormValues {
  loginEmail: string;
  loginPassword: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  bio: string;
  file?: FileList; // Optional field for file upload
  lastName: string;
  firstName: string;
  middleName: string | null;
  employmentDate: string;
  citizenship: string;
  gender: string;
  passportData: string;
  inn: string;
  insuranceNumber: string;
}

const useFormHook = (defaultValues?: Partial<FormValues>) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm<FormValues>({
    defaultValues, // Use defaultValues to initialize the form
  });

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    console.log('Form Data:', data);

    if (data.file && data.file.length > 0) {
      console.log('File uploaded:', data.file[0]);
    }

    reset(); // Reset the form after submission
  };

  return {
    register,
    handleSubmit,
    errors,
    onSubmit,
    reset, // We return reset to initialize/reset the form externally
    setValue
  };
};

export default useFormHook;

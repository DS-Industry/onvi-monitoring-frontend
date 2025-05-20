import React, { useState } from 'react';
import ArrowLeft from 'feather-icons-react';
import OTPImage from '@/assets/OTPImage.png';
import OnviBlue from '@/assets/onvi_blue.png';
const ForgotEmailForm = React.lazy(() => import('./ForgotEmailForm'));
const ForgotOTPForm = React.lazy(() => import('./ForgotOTPForm'));
const ForgotPasswordForm = React.lazy(() => import('./ForgotPasswordForm'));
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const ForgotPassword: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const [count, setCount] = useState(0);
    const [forgotObj, setForgotObj] = useState({
        email: '',
        confirmString: ''
    });
    const handleLoginNavigate = (event: React.FormEvent) => {
        event.preventDefault();
        navigate('/login');
      }
    
    return (
        <div className="flex min-h-screen items-center justify-center bg-background02 p-4">
            <div className="flex flex-col rounded-lg p-8 lg:flex-row md:p-0">
                <div className="lg:w-5/12 p-8 lg:ml-40">
                    <div className='flex text-primary02 mb-5 cursor-pointer' onClick={handleLoginNavigate}>
                        <ArrowLeft icon={'arrow-left'} />
                        <p>{t("login.back")}</p>
                    </div>
                    <div className='flex mb-5'>
                        <img src={OnviBlue} className='h-7 w-14' loading="lazy" alt="Onvi" />
                        <div className="text-primary02 font-semibold text-xs items-center justify-center flex ml-2">{t("login.business")}</div>
                    </div>
                    { count === 0 && <ForgotEmailForm count={count} setCount={setCount} forgotObj={forgotObj} setForgotObj={setForgotObj} /> }
                    { count === 1 && <ForgotOTPForm count={count} setCount={setCount} forgotObj={forgotObj} setForgotObj={setForgotObj} /> }
                    { count === 2 && <ForgotPasswordForm forgotObj={forgotObj} /> }
                </div>

                <div className="hidden lg:flex lg:w-8/12 rounded-r-lg items-center justify-center lg:ml-20">
                    <div className="p-8">
                      <img src={OTPImage} alt="Rocket illustration" key={"forgot-password"} className="object-cover w-11/12 h-11/12" loading="lazy" decoding='async' />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;

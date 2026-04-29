import React, { useState } from 'react';

const APP_DEEP_LINK = 'onvione://payment/complete';

const PaymentSuccess: React.FC = () => {
  const [opening, setOpening] = useState(false);

  const handleContinue = () => {
    setOpening(true);

    window.location.href = APP_DEEP_LINK;

    setTimeout(() => {
      setOpening(false);
    }, 2000);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#f4f9ff] to-[#eef6ff] p-4">
      <div className="w-full max-w-lg rounded-2xl border border-[#dbeafe] bg-white p-8 text-center shadow-[0_10px_30px_rgba(15,23,42,0.08)]">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#e7f8ee] text-3xl">
          <span role="img" aria-label="success">
            ✅
          </span>
        </div>

        <h1 className="mb-3 text-3xl font-bold text-text01">
          Оплата прошла успешно
        </h1>

        <p className="mx-auto max-w-md text-base leading-6 text-text02">
          Спасибо! Платеж подтвержден!
        </p>

        <button
          type="button"
          onClick={handleContinue}
          disabled={opening}
          className="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-primary02 px-4 py-3 text-base font-semibold text-white transition hover:bg-primary02_Hover disabled:opacity-60"
        >
          {opening ? 'Открываем приложение...' : 'Далее'}
        </button>
      </div>
    </div>
  );
};

export default PaymentSuccess;
import { useState } from "react";
import Notification from "../ui/Notification";

const RatingOfCarWases = () => {
    const [notificationVisible, setNotificationVisible] = useState(true);
  return (
    <>
      {notificationVisible && (
        <Notification
          title="Ваши новости"
          message="В данном разделе будут отображаться главные новости и события вашей автомойки"
          onClose={() => setNotificationVisible(false)}
        />
      )}
    </>
  );
};

export default RatingOfCarWases;

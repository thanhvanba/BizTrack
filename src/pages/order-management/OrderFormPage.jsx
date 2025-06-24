import MultiOrderFormTabs from "../../components/order/MultiOrderFormTabs";
import OrderFormData from "../../components/order/OrderFormData";
import { useLocation, useParams } from 'react-router-dom';

const OrderFormPage = () => {
  const location = useLocation();
  const { orderId } = useParams();

  let mode = 'create';

  if (location.pathname.includes('edit-order') && orderId) {
    mode = 'edit';
  } else if (location.pathname.includes('return-order') && orderId) {
    mode = 'return';
  }

  console.log("Detected mode:", mode);
  return (
    <div>
      {mode === "create" ? (
        <>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-xl font-semibold">Tạo đơn hàng mới</h1>
          </div>
          <MultiOrderFormTabs />
        </>
      ) : (
        <OrderFormData mode={mode} />
      )}
    </div>
  );
};

export default OrderFormPage;

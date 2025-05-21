import MultiOrderFormTabs from "../../components/order/MultiOrderFormTabs";
import OrderFormData from "../../components/order/OrderFormData";


const OrderFormPage = ({ mode = "create" }) => {

  return (
    <div>
      {mode === 'create' ?
        <>

          <div className="flex justify-between items-center mb-6">
            <h1 className="text-xl font-semibold">Tạo đơn hàng mới</h1>
          </div>
          <MultiOrderFormTabs />
        </>
        : <OrderFormData mode={mode} />
      }
    </div>
  )
};

export default OrderFormPage;

import { toast, ToastContainer } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";

const useToastNotify = (content, type = "info") => {
    if (toast[type] && typeof toast[type] === "function") {
        return toast[type](content, {
            position: "top-center",
            theme: "light",
        });
    } else {
        // Xử lý trường hợp type không hợp lệ hoặc không phải là hàm
        console.warn(
            `Invalid toast type: ${type}. Falling back to default toast.`
        );
        return toast(content, {
            // Sử dụng toast() mặc định
            position: "top-center",
            theme: "light",
        });
    }
};
export default useToastNotify 
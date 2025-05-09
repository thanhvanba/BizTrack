import { toast, ToastContainer } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";

const useToastNotify = (content, type) => {
    return toast[type](content, {
        position: "top-center",
        theme: 'light'
    });
};
export default useToastNotify 
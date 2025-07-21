import { toast } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";

const useToastNotify = (content, type = "info") => {
    const options = {
        position: "top-center",
        theme: "light",
        autoClose: 1000, // 2 giây
    };
    if (toast[type] && typeof toast[type] === "function") {
        return toast[type](content, options);
    } else {
        console.warn(
            `Invalid toast type: ${type}. Falling back to default toast.`
        );
        return toast(content, options);
    }
};
export default useToastNotify; 
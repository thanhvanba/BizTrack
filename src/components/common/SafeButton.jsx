import { Button as AntButton } from "antd";
import { useEffect, useRef, useState } from "react";

const SafeButton = ({ onClick, disabled, loading, ...restProps }) => {
    const [pending, setPending] = useState(false);
    const isMountedRef = useRef(true);

    useEffect(() => {
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    const handleClick = async (event) => {
        if (!onClick) return;
        if (pending) return;

        const maybePromise = onClick(event);
        if (maybePromise && typeof maybePromise.then === "function") {
            try {
                setPending(true);
                await maybePromise;
            } finally {
                if (isMountedRef.current) setPending(false);
            }
        }
    };

    return (
        <AntButton
            {...restProps}
            onClick={handleClick}
            disabled={disabled || pending}
            loading={loading || pending}
        />
    );
};

export default SafeButton;



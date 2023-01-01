type BrandProps = {
    monochrome?: boolean;
};

export default function Brand(props: BrandProps) {
    return (
        <span
            className={`p-1 text-xl font-black leading-none select-none ${
                props.monochrome ? 'text-black' : 'text-white'
            }`}>
            <span>DataViewer</span>
            <span
                className={`${
                    props.monochrome ? 'text-gray-500' : 'text-emerald-300'
                }`}>
                .
            </span>
        </span>
    );
}

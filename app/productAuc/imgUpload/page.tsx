import { CldUploadWidget } from 'next-cloudinary';
interface ImgUploadProp {
    onUploadSuccess: (url: string) => void;
}
export default function ImgUpload({ onUploadSuccess }: ImgUploadProp) {

    return (
        <CldUploadWidget uploadPreset="agri-conn-preset"
            options={{
                multiple: true,
                maxFiles: 5,
                clientAllowedFormats: ['png', 'jpeg', 'webp', 'jpg']
            }}
            onSuccess={(result) => {
                if (typeof result.info == 'object' && 'secure_url' in result.info) {
                    const newImgUrl = result.info.secure_url
                    onUploadSuccess(newImgUrl)
                }
            }}
        >
            {({ open }) => {
                return (
                    <button type='button' onClick={() => open()} className="relative cursor-pointer rounded-md bg-transparent font-semibold text-[#009C25] focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[#009C25]  hover:text-green-500">
                        Upload Images
                    </button>
                );
            }}
        </CldUploadWidget >
    );
}


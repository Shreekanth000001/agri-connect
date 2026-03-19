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
                    <button type='button' onClick={() => open()} className="w-2/3 bg-green-600 text-white py-2 rounded-md hover:bg-green-500 m-1">
                        Upload Images
                    </button>
                );
            }}
        </CldUploadWidget >
    );
}

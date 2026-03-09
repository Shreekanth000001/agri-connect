import { CldUploadWidget } from 'next-cloudinary';

export default function ImgUpload (){

    return (
        <CldUploadWidget uploadPreset="agri-conn-preset">
            {({ open }) => {
                return (
                    <button onClick={() => open()}>
                        Upload an Image
                    </button>
                );
            }}
        </CldUploadWidget>
    );
}

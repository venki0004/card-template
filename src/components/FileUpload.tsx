import React, { useEffect, useState } from "react";

import { toast } from "react-toastify";

const FileUpload = ({
  id,
  label,
  acceptMimeTypes = [
    "application/x-zip-compressed",
    "application/zip",
    "application/x-rar-compressed",
    "image/png",
    "image/jpeg",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ],
  setImage,
  title = "Drag and Drop PDF here",
  maxSize = 5, // in MB
  imageUrl = "",
  styleType = "lg",
  filename,
  previewData = "",
  name,
  setPreviewMeta,
  removeImage,
  error,
  type = "image",
}: any) => {
  const [isUploaded, setUploaded] = useState(false);
  const [active, setActive] = useState(false);
  const [imageMeta, setImageMeta] = useState({ name: "", url: "", type: "" });

  let icons = {
    FileDefault: "/assets/images/FileDefault.svg",
    FileUploadIcon: "/assets/images/FileUploadIcon.svg",
    FileUploaded: "/assets/images/FileUploaded.svg",
    xls: "/assets/images/xls.svg",
  };

  useEffect(() => {
    if (imageUrl?.startsWith("data:")) {      
      setImageMeta({
        name:'userImage',
        url: imageUrl,
        type: "image/png",
      });
      setUploaded(true)
    }

    if (previewData) {
      setImageMeta(previewData);
      setUploaded(true);
    }
    if(!imageUrl && !previewData) {
     setImageMeta(
      { name: "", url: "", type: "" }
     )
     setUploaded(false)
    }
  }, [previewData, imageUrl]);

  const validation = (file: any) => {
    const maxSizeInBytes = Number(maxSize) * 1024 ** 2;
    if (file?.size > maxSizeInBytes) {
      toast.error(`File Size Exceeds the ${maxSize} MB`, {
        position: toast.POSITION.TOP_RIGHT,
      });
      return false;
    }

    if (!acceptMimeTypes.includes(file.type)) {
      toast.error("Unsupported file selected!", {
        position: toast.POSITION.TOP_RIGHT,
      });
      return false;
    }

    return true;
  };

  const convertBase64 = (file: any) => {
    const isValid = validation(file);
    if (isValid) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const meta = {
          name: file.name,
          url: reader.result,
          type: file.type,
        } as any;
        setImageMeta(meta);
        if (setPreviewMeta) {
          setPreviewMeta(meta);
        }
        setUploaded(true);
        setActive(true);
        setImage({
          url: reader.result || "",
          name: filename,
          file,
          preview: meta,
        });
      };
    }
  };

  const chooseFile = (e: any) => {
    e.preventDefault();
    const ele = document.getElementById(id);
    if (ele) ele.click();
  };

  const onChange = (e: any) => {
    e.preventDefault();
    const file = e.target.files[0];
    convertBase64(file);
  };

  const handleCancel = () => {
    setUploaded(false);
    setActive(false);
    if (removeImage) {
      removeImage("");
    }
  };

  const onDrag = (event: any) => {
    event.preventDefault();
    event.stopPropagation();
    if (event.type === "dragover") {
      setActive(true);
    }

    if (event.type === "dragleave") {
      setActive(false);
    }

    if (event.type === "drop") {
      const file = event.dataTransfer.files[0];
      convertBase64(file);
    }
  };

  return (
    <div
      className={`relative file-upload-box w-full h-fit ${
        error && "file-upload-error"
      } ${active ? "file-upload-active" : ""}`}
    >
      {!isUploaded ? (
        <>
          <label
            htmlFor={id}
            className={`cursor-pointer ${
              styleType === "md" ? "hidden" : "block"
            }`}
            onDragOver={(e) => onDrag(e)}
            onDragLeave={(e) => {
              onDrag(e);
            }}
            onDrop={(e) => {
              onDrag(e);
            }}
          >
            <img
              src={type === "image" ? icons?.FileDefault : icons.xls}
              className="mx-auto"
              alt=""
            />
            <p className="text-center font-bold text-shadeDarkBlue text-lg pt-2">
              {title}
            </p>
          </label>
          <div>
            <div
              className={`flex justify-between items-center ${
                styleType === "md" ? "pt-0" : "pt-6"
              }`}
            >
              <div className="flex justify-center items-center space-x-0 lg:space-x-6">
                <div className="hidden lg:block">
                  <img
                    src={icons?.FileUploadIcon}
                    alt=""
                    className="w-[25px] h-[24px]"
                  />
                </div>
                <div className="text-Kimberly flex flex-col text-sm label-sec">
                  <p>{label}</p>
                  <p className="pt-2">Maximum Size: {maxSize} Mb</p>
                </div>
              </div>
              <div>
                <input
                  type="file"
                  id={id}
                  onChange={onChange}
                  accept={acceptMimeTypes.toString()}
                  className="hidden"
                />
                <div
                  className="upload-btn flex cursor-pointer justify-center items-center rounded-lg"
                  id={id}
                  onClick={(e) => chooseFile(e)}
                >
                  <p>Choose File</p>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <div
            className={`flex justify-center flex-col items-center ${
              styleType === "md" ? "hidden" : "block"
            }`}
          >
            <img src={icons?.FileUploaded} alt="" />
            <p className="text-shadeDarkBlue text-center pt-4 font-bold">
              Uploaded!
            </p>
          </div>
          <div
            className={`flex justify-between items-center ${
              styleType === "md" ? "pt-0" : "pt-6"
            }`}
          >
            <div className="flex justify-center items-center space-x-6">
              <img
                src={imageMeta.url}
                alt=""
                className="w-[50px] h-[50px]"
                onError={(e:any) => {
                  e.target.src = icons?.FileUploaded; 
                }}
              />
              <p className="text-shadeDarkBlue text-sm">
                {imageMeta.name.length > 10 ? (
                  <>{imageMeta.name.substring(0, 10)}...</>
                ) : (
                  <>{imageMeta.name}</>
                )}
              </p>
            </div>
            <div>
              <button
                onClick={handleCancel}
                type="button"
                className="cancel-btn flex cursor-pointer justify-center items-center rounded-lg"
              >
                Remove
              </button>
            </div>
          </div>
        </>
      )}
      {error && (
        <p className="absolute -bottom-6 ml-3 text-red-600 text-xs">{error}</p>
      )}
    </div>
  );
};

export default FileUpload;

"use client"
import React, { useState, useRef } from "react";
import "./FileUploader.scss";

interface FileUploaderProps {
  uploadUrl: string; // URL pour le backend où les fichiers seront uploadés
}

const FileUploader: React.FC<FileUploaderProps> = ({ uploadUrl }) => {
  const [progress, setProgress] = useState<number>(0);
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; size: string }[]>([]);
  const progressAreaRef = useRef<HTMLDivElement>(null);
  const uploadedAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFormClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      let fileName = file.name;
      if (fileName.length >= 12) {
        const splitName = fileName.split(".");
        fileName = `${splitName[0].substring(0, 13)}... .${splitName[1]}`;
      }
      uploadFile(file, fileName);
    }
  };

  const uploadFile = (file: File, name: string) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", uploadUrl);

    xhr.upload.addEventListener("progress", (event: ProgressEvent) => {
      const { loaded, total } = event;
      const fileLoaded = Math.floor((loaded / total) * 100);
      const fileTotal = Math.floor(total / 1000);
      const fileSize = fileTotal < 1024 ? `${fileTotal} KB` : `${(loaded / (1024 * 1024)).toFixed(2)} MB`;

      const progressHTML = `
        <li class="row">
          <i class="material-icons">description</i>
          <div class="content">
            <div class="details">
              <span class="name">${name} • Uploading</span>
              <span class="percent">${fileLoaded}%</span>
            </div>
            <div class="progress-bar">
              <div class="progress" style="width: ${fileLoaded}%"></div>
            </div>
          </div>
        </li>`;

      if (progressAreaRef.current) {
        progressAreaRef.current.innerHTML = progressHTML;
      }

      if (loaded === total) {
        if (progressAreaRef.current) {
          progressAreaRef.current.innerHTML = "";
        }
        const uploadedHTML = `
          <li class="row">
            <div class="content upload">
              <i class="material-icons">description</i>
              <div class="details">
                <span class="name">${name} • Uploaded</span>
                <span class="size">${fileSize}</span>
              </div>
            </div>
            <i class="material-icons">check</i>
          </li>`;

        if (uploadedAreaRef.current) {
          uploadedAreaRef.current.insertAdjacentHTML("afterbegin", uploadedHTML);
        }

        setUploadedFiles((prev) => [...prev, { name, size: fileSize }]);
      }
    });

    const formData = new FormData();
    formData.append("file", file);
    xhr.send(formData);
  };

  return (
    <div className="wrapper">
      <header>PV Uploader</header>
      <form onClick={handleFormClick}>
        <input
          ref={fileInputRef}
          className="file-input"
          type="file"
          accept="application/pdf"
          name="file"
          hidden
          onChange={handleFileChange}
        />
        <i className="material-icons">cloud_upload</i>
        <p>Browse File to Upload</p>
      </form>
      <section ref={progressAreaRef} className="progress-area"></section>
      <section ref={uploadedAreaRef} className="uploaded-area"></section>
    </div>
  );
};

export default FileUploader;

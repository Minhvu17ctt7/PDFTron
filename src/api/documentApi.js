import axiosClient from "./axiosClient";

const document = {
  //   getAll: (params) => {
  //     const url = '/products';
  //     return axiosClient.get(url, { params });
  //   },

  //   get: (id) => {
  //     const url = `/products/${id}`;
  //     return axiosClient.get(url);
  //   },

  postSigning: (json,file) => {
    
    // // const datas = {...data,files:[{name:"file",files}] }
    // const header = {
    //   "content-type": "multipart/form-data",
    // };
    const url = `/document/signing`;

    const formData = new FormData();
    formData.append("data", JSON.stringify(json));
    formData.append("files", file);
    // formData.append("files", file);
    const header = {
        "content-type": "application/octet-stream",
      };
    return axiosClient.post(url, formData, header);
  },
};

export default document;


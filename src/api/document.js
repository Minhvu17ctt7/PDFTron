import axiosClient from "./axiosClient";

const documentApi = {
  postSigning: (json) => {
    const url = `/document/signing2`;
    return axiosClient.post(url, json);
  },
};

export default documentApi;

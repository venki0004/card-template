import Axios from 'axios';
import * as actions from './api-creators';
import { toast } from 'react-toastify';
import { logout } from '../../utils/auth';
import { decryptData } from '../../utils/encryption';

const baseURL = process.env.REACT_APP_BACKEND_URL;
const api = ({ dispatch }: { dispatch: any }) =>
  (next: any) =>
    /* eslint-disable consistent-return */
    async (action: any) => {
      if (action.type !== actions.apiCallBegan.type) return next(action);

      const { url, method, data, onStart, onSuccess, onError } = action.payload;

      if (onStart) dispatch({ type: onStart, payload: {} });

      try {
        let userToken: string = decryptData(localStorage.getItem('user-token') || '');
        if (data && data.access_token) {
          userToken = data.access_token;
        }
        const headers = { Authorization: `Bearer ${userToken}` };

        const response = await Axios.request({
          baseURL,
          url,
          method,
          data,
          headers,
        });
        /* eslint-disable consistent-return */
        if (response.headers.Authorization) {
          response.data.data.token = response.headers.Authorization || '';
        }

        if (onSuccess) {
          dispatch({ type: onSuccess, payload: response.data });
        }
      } catch (error: any) {
        const { status } = error.response;
        if (status === 401) {
          toast.dismiss(); // i need to hide all toast notification
          toast.error('Session Expired', {
            position: toast.POSITION.TOP_RIGHT,
          });
          logout();
          window.location.href = '';
        }
        if (onError) {
          dispatch({
            type: onError,
            payload: error.response.data.errors || {},
          });
        }
      }

      next(action);
    };

export default api;

import axios from "axios";


const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ||
    "http://127.0.0.1:8000/api";


const api = axios.create({
    baseURL: API_BASE_URL,
});


// ==========================================
// REQUEST INTERCEPTOR
// ==========================================

api.interceptors.request.use(
    (config) => {

        const accessToken =
            localStorage.getItem("access_token");

        if (accessToken) {

            config.headers = config.headers || {};

            config.headers.Authorization =
                `Bearer ${accessToken}`;
        }

        return config;
    },

    (error) => {
        return Promise.reject(error);
    }
);


// ==========================================
// RESPONSE INTERCEPTOR
// AUTOMATIC ACCESS TOKEN REFRESH
// ==========================================

api.interceptors.response.use(

    // Successful response
    (response) => {
        return response;
    },


    // Error response
    async (error) => {

        const originalRequest =
            error.config;


        // --------------------------------------
        // SAFETY CHECK
        // --------------------------------------

        if (!originalRequest) {
            return Promise.reject(error);
        }


        // --------------------------------------
        // DO NOT REFRESH TOKEN FOR LOGIN
        // --------------------------------------

        const requestUrl =
            originalRequest.url || "";

        if (
            requestUrl.includes("/accounts/login/")
        ) {
            return Promise.reject(error);
        }


        // --------------------------------------
        // DO NOT REFRESH TOKEN FOR TOKEN REFRESH
        // --------------------------------------

        if (
            requestUrl.includes("/accounts/token/refresh/")
        ) {
            return Promise.reject(error);
        }


        // --------------------------------------
        // CHECK FOR 401
        // --------------------------------------

        if (
            error.response?.status === 401 &&
            !originalRequest._retry
        ) {

            originalRequest._retry = true;


            const refreshToken =
                localStorage.getItem("refresh_token");


            // ----------------------------------
            // NO REFRESH TOKEN
            // ----------------------------------

            if (!refreshToken) {

                localStorage.removeItem(
                    "access_token"
                );

                localStorage.removeItem(
                    "refresh_token"
                );

                window.location.href = "/login";

                return Promise.reject(error);
            }


            try {

                // ----------------------------------
                // REQUEST NEW ACCESS TOKEN
                // ----------------------------------

                const response =
                    await axios.post(
                        `${API_BASE_URL}/accounts/token/refresh/`,
                        {
                            refresh: refreshToken,
                        }
                    );


                const newAccessToken =
                    response.data?.access;


                if (!newAccessToken) {

                    throw new Error(
                        "Token refresh failed"
                    );
                }


                // ----------------------------------
                // SAVE NEW ACCESS TOKEN
                // ----------------------------------

                localStorage.setItem(
                    "access_token",
                    newAccessToken
                );


                // ----------------------------------
                // RETRY ORIGINAL REQUEST
                // ----------------------------------

                originalRequest.headers =
                    originalRequest.headers || {};

                originalRequest.headers.Authorization =
                    `Bearer ${newAccessToken}`;


                return api(originalRequest);


            } catch (refreshError) {

                // ----------------------------------
                // LOGOUT USER
                // ----------------------------------

                localStorage.removeItem(
                    "access_token"
                );

                localStorage.removeItem(
                    "refresh_token"
                );

                localStorage.removeItem(
                    "username"
                );

                localStorage.removeItem(
                    "email"
                );

                localStorage.removeItem(
                    "notification_read"
                );


                window.location.href =
                    "/login";


                return Promise.reject(
                    refreshError
                );
            }
        }


        return Promise.reject(error);
    }
);


export default api;
// در داخل AuthContext یا یک Interceptor
// تنظیم Axios Interceptor برای ارسال توکن در هر درخواست
api.interceptors.request.use(config => {
  const token = localStorage.getItem('authToken'); 
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});
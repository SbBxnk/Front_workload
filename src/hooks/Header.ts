const useAuthHeaders = () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };
  
  export default useAuthHeaders;
  
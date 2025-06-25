import axios from "axios";
import { QueryClient } from "@tanstack/react-query";
import { API_URL } from "./constants";

const apiClient = axios.create({
  baseURL: API_URL,
  // timeout: 2000,
  xsrfCookieName: "csrftoken",
  xsrfHeaderName: "X-CSRFToken",
  withXSRFToken: true,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

export { apiClient, queryClient };
